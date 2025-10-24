from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from drf_spectacular.utils import extend_schema, OpenApiParameter
from .models import Task
from .serializers import (
    TaskListSerializer,
    TaskDetailSerializer,
    TaskCreateUpdateSerializer
)
from .services import TaskService


class TaskViewSet(viewsets.ModelViewSet):
    """할 일 ViewSet"""
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """사용자의 할 일만 조회"""
        return Task.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        """액션에 따라 다른 Serializer 사용"""
        if self.action == 'list':
            return TaskListSerializer
        elif self.action == 'retrieve':
            return TaskDetailSerializer
        return TaskCreateUpdateSerializer

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 목록 조회',
        description='사용자의 모든 활성 할 일 목록을 조회합니다.'
    )
    def list(self, request, *args, **kwargs):
        """할 일 목록"""
        queryset = self.get_queryset().filter(status='active')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 생성',
        description='새로운 할 일을 생성합니다.'
    )
    def create(self, request, *args, **kwargs):
        """할 일 생성"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        task = serializer.save()
        return Response(
            TaskDetailSerializer(task).data,
            status=status.HTTP_201_CREATED
        )

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 상세 조회',
        description='특정 할 일의 상세 정보를 조회합니다.'
    )
    def retrieve(self, request, *args, **kwargs):
        """할 일 상세"""
        return super().retrieve(request, *args, **kwargs)

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 수정',
        description='할 일 정보를 수정합니다.'
    )
    def update(self, request, *args, **kwargs):
        """할 일 수정"""
        return super().update(request, *args, **kwargs)

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 삭제',
        description='할 일을 삭제합니다.'
    )
    def destroy(self, request, *args, **kwargs):
        """할 일 삭제"""
        return super().destroy(request, *args, **kwargs)

    @extend_schema(
        tags=['Tasks'],
        summary='오늘 할 일',
        description='오늘 표시할 할 일 목록을 조회합니다.'
    )
    @action(detail=False, methods=['get'])
    def today(self, request):
        """오늘 할 일"""
        tasks = TaskService.get_today_tasks(request.user)
        serializer = TaskListSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Tasks'],
        summary='이번 주 할 일',
        description='이번 주에 표시할 할 일 목록을 조회합니다.'
    )
    @action(detail=False, methods=['get'])
    def weekly(self, request):
        """이번 주 할 일"""
        tasks = TaskService.get_weekly_tasks(request.user)
        serializer = TaskListSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Tasks'],
        summary='마감 지난 할 일',
        description='마감일이 지난 할 일 목록을 조회합니다.'
    )
    @action(detail=False, methods=['get'])
    def overdue(self, request):
        """마감 지난 할 일"""
        tasks = TaskService.get_overdue_tasks(request.user)
        serializer = TaskListSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Tasks'],
        summary='보관된 할 일',
        description='보관된 할 일 목록을 조회합니다.'
    )
    @action(detail=False, methods=['get'])
    def archived(self, request):
        """보관된 할 일"""
        tasks = self.get_queryset().filter(status='archived')
        serializer = TaskListSerializer(tasks, many=True, context={'request': request})
        return Response(serializer.data)

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 보관',
        description='할 일을 보관합니다.'
    )
    @action(detail=True, methods=['post'])
    def archive(self, request, pk=None):
        """할 일 보관"""
        task = self.get_object()
        task.status = 'archived'
        task.archived_at = timezone.now()
        task.save()
        return Response({
            'message': '할 일이 보관되었습니다.',
            'task': TaskDetailSerializer(task).data
        })

    @extend_schema(
        tags=['Tasks'],
        summary='할 일 복구',
        description='보관된 할 일을 복구합니다.'
    )
    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        """할 일 복구"""
        task = self.get_object()
        task.status = 'active'
        task.archived_at = None
        task.save()
        return Response({
            'message': '할 일이 복구되었습니다.',
            'task': TaskDetailSerializer(task).data
        })
