from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema, OpenApiParameter
from datetime import date
from .models import Completion
from tasks.models import Task
from .serializers import (
    CompletionSerializer,
    CompletionCreateSerializer,
    CompletionStatsSerializer,
    MonthlyStatsSerializer
)
from .services import CompletionService


class CompletionViewSet(viewsets.ModelViewSet):
    """완료 기록 ViewSet"""
    permission_classes = [IsAuthenticated]
    serializer_class = CompletionSerializer

    def get_queryset(self):
        """사용자의 완료 기록만 조회"""
        return Completion.objects.filter(task__user=self.request.user)

    @extend_schema(
        tags=['Completions'],
        summary='완료 기록 목록',
        description='완료 기록 목록을 조회합니다. task_id로 필터링 가능합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=False)
        ]
    )
    def list(self, request, *args, **kwargs):
        """완료 기록 목록"""
        queryset = self.get_queryset()

        # task_id 필터링
        task_id = request.query_params.get('task_id')
        if task_id:
            queryset = queryset.filter(task_id=task_id)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Completions'],
        summary='완료 처리',
        description='할 일을 완료 처리합니다.',
        request=CompletionCreateSerializer
    )
    def create(self, request, *args, **kwargs):
        """완료 처리"""
        serializer = CompletionCreateSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        task_id = serializer.validated_data['task_id']
        completed_date = serializer.validated_data.get('completed_date', date.today())
        note = serializer.validated_data.get('note', '')

        task = Task.objects.get(id=task_id, user=request.user)
        completion, created = CompletionService.mark_complete(task, completed_date, note)

        if created:
            return Response(
                {
                    'message': '완료 처리되었습니다.',
                    'completion': CompletionSerializer(completion).data
                },
                status=status.HTTP_201_CREATED
            )
        else:
            return Response(
                {
                    'message': '이미 완료 처리된 날짜입니다.',
                    'completion': CompletionSerializer(completion).data
                },
                status=status.HTTP_200_OK
            )

    @extend_schema(
        tags=['Completions'],
        summary='완료 취소',
        description='완료 기록을 삭제합니다.'
    )
    def destroy(self, request, *args, **kwargs):
        """완료 취소"""
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=['Completions'],
        summary='오늘 완료 여부',
        description='특정 할 일의 오늘 완료 여부를 확인합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=True)
        ]
    )
    @action(detail=False, methods=['get'])
    def check(self, request):
        """오늘 완료 여부"""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({'detail': 'task_id는 필수입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 권한 확인
        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({'detail': '해당 할 일을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        is_completed = CompletionService.is_completed_on_date(task_id)

        return Response({
            'task_id': task_id,
            'is_completed_today': is_completed
        })

    @extend_schema(
        tags=['Completions'],
        summary='완료 히스토리',
        description='특정 할 일의 완료 히스토리를 조회합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=True),
            OpenApiParameter(name='days', type=int, description='조회 기간(일)', required=False)
        ]
    )
    @action(detail=False, methods=['get'])
    def history(self, request):
        """완료 히스토리"""
        task_id = request.query_params.get('task_id')
        days = int(request.query_params.get('days', 30))

        if not task_id:
            return Response({'detail': 'task_id는 필수입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 권한 확인
        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({'detail': '해당 할 일을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        completions = CompletionService.get_completion_history(task_id, days)
        serializer = CompletionSerializer(completions, many=True)

        return Response(serializer.data)

    @extend_schema(
        tags=['Completions'],
        summary='주간 통계',
        description='특정 할 일의 주간 완료 통계를 조회합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=True)
        ],
        responses={200: CompletionStatsSerializer}
    )
    @action(detail=False, methods=['get'])
    def weekly_stats(self, request):
        """주간 통계"""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({'detail': 'task_id는 필수입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 권한 확인
        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({'detail': '해당 할 일을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        stats = CompletionService.get_weekly_stats(task_id)
        serializer = CompletionStatsSerializer(stats)

        return Response(serializer.data)

    @extend_schema(
        tags=['Completions'],
        summary='월간 통계',
        description='특정 할 일의 월간 완료 통계를 조회합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=True),
            OpenApiParameter(name='year', type=int, description='연도', required=False),
            OpenApiParameter(name='month', type=int, description='월', required=False)
        ],
        responses={200: MonthlyStatsSerializer}
    )
    @action(detail=False, methods=['get'])
    def monthly_stats(self, request):
        """월간 통계"""
        task_id = request.query_params.get('task_id')
        year = request.query_params.get('year')
        month = request.query_params.get('month')

        if not task_id:
            return Response({'detail': 'task_id는 필수입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 권한 확인
        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({'detail': '해당 할 일을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        year = int(year) if year else None
        month = int(month) if month else None

        stats = CompletionService.get_monthly_stats(task_id, year, month)
        serializer = MonthlyStatsSerializer(stats)

        return Response(serializer.data)

    @extend_schema(
        tags=['Completions'],
        summary='연속 달성일',
        description='특정 할 일의 연속 달성일을 조회합니다.',
        parameters=[
            OpenApiParameter(name='task_id', type=int, description='할 일 ID', required=True)
        ]
    )
    @action(detail=False, methods=['get'])
    def streak(self, request):
        """연속 달성일"""
        task_id = request.query_params.get('task_id')
        if not task_id:
            return Response({'detail': 'task_id는 필수입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        # 권한 확인
        try:
            task = Task.objects.get(id=task_id, user=request.user)
        except Task.DoesNotExist:
            return Response({'detail': '해당 할 일을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

        streak = CompletionService.get_streak(task_id)

        return Response({
            'task_id': task_id,
            'streak': streak
        })
