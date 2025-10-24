from rest_framework import serializers
from .models import Task
from datetime import date


class TaskListSerializer(serializers.ModelSerializer):
    """할 일 목록용 Serializer (간단)"""
    is_completed_today = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'task_type', 'priority', 'status',
            'due_date', 'created_at', 'is_completed_today'
        ]

    def get_is_completed_today(self, obj):
        """오늘 완료 여부 (나중에 Completion 앱에서 구현)"""
        # TODO: Completion 앱 구현 후 연결
        return False


class TaskDetailSerializer(serializers.ModelSerializer):
    """할 일 상세용 Serializer (통계 포함)"""
    is_completed_today = serializers.SerializerMethodField()
    completion_count = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'task_type', 'priority', 'status',
            'repeat_days', 'start_date', 'end_date', 'due_date',
            'created_at', 'updated_at', 'archived_at',
            'is_completed_today', 'completion_count'
        ]

    def get_is_completed_today(self, obj):
        """오늘 완료 여부"""
        # TODO: Completion 앱 구현 후 연결
        return False

    def get_completion_count(self, obj):
        """총 완료 횟수"""
        # TODO: Completion 앱 구현 후 연결
        return 0


class TaskCreateUpdateSerializer(serializers.ModelSerializer):
    """할 일 생성/수정용 Serializer (검증 강화)"""

    class Meta:
        model = Task
        fields = [
            'title', 'description', 'task_type', 'priority',
            'repeat_days', 'start_date', 'end_date', 'due_date'
        ]

    def validate_title(self, value):
        """제목 검증"""
        if not value or not value.strip():
            raise serializers.ValidationError('제목은 필수입니다.')
        if len(value) > 200:
            raise serializers.ValidationError('제목은 200자를 초과할 수 없습니다.')
        return value.strip()

    def validate_repeat_days(self, value):
        """반복 요일 검증"""
        if value:
            valid_days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            days = [d.strip() for d in value.split(',')]
            for day in days:
                if day not in valid_days:
                    raise serializers.ValidationError(
                        f'올바르지 않은 요일 형식입니다: {day}. '
                        f'사용 가능한 형식: {", ".join(valid_days)}'
                    )
        return value

    def validate(self, attrs):
        """전체 데이터 검증"""
        task_type = attrs.get('task_type')

        # weekly 타입 검증
        if task_type == 'weekly':
            if not attrs.get('repeat_days'):
                raise serializers.ValidationError({
                    'repeat_days': 'weekly 타입은 반복 요일을 지정해야 합니다.'
                })

        # period 타입 검증
        if task_type == 'period':
            start_date = attrs.get('start_date')
            end_date = attrs.get('end_date')

            if not start_date or not end_date:
                raise serializers.ValidationError({
                    'start_date': 'period 타입은 시작일과 종료일을 지정해야 합니다.',
                    'end_date': 'period 타입은 시작일과 종료일을 지정해야 합니다.'
                })

            if start_date > end_date:
                raise serializers.ValidationError({
                    'end_date': '종료일은 시작일보다 이후여야 합니다.'
                })

        # once 타입 검증
        if task_type == 'once':
            if not attrs.get('due_date'):
                raise serializers.ValidationError({
                    'due_date': 'once 타입은 마감일을 지정해야 합니다.'
                })

        return attrs

    def create(self, validated_data):
        """할 일 생성"""
        user = self.context['request'].user
        task = Task.objects.create(user=user, **validated_data)
        return task
