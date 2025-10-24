from rest_framework import serializers
from .models import Completion
from tasks.models import Task
from datetime import date


class CompletionSerializer(serializers.ModelSerializer):
    """완료 기록 Serializer"""
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_type = serializers.CharField(source='task.task_type', read_only=True)

    class Meta:
        model = Completion
        fields = ['id', 'task', 'task_title', 'task_type', 'completed_date', 'completed_time', 'note', 'created_at']
        read_only_fields = ['completed_time', 'created_at']


class CompletionCreateSerializer(serializers.Serializer):
    """완료 기록 생성 Serializer"""
    task_id = serializers.IntegerField(required=True)
    completed_date = serializers.DateField(required=False, default=date.today)
    note = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_task_id(self, value):
        """Task 존재 및 권한 확인"""
        user = self.context['request'].user
        try:
            task = Task.objects.get(id=value, user=user)
        except Task.DoesNotExist:
            raise serializers.ValidationError('해당 할 일을 찾을 수 없거나 권한이 없습니다.')
        return value

    def validate_completed_date(self, value):
        """미래 날짜 방지"""
        if value > date.today():
            raise serializers.ValidationError('미래 날짜는 선택할 수 없습니다.')
        return value


class CompletionStatsSerializer(serializers.Serializer):
    """완료 통계 Serializer"""
    total_days = serializers.IntegerField()
    completed_days = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    dates = serializers.ListField(child=serializers.CharField())


class MonthlyStatsSerializer(serializers.Serializer):
    """월간 통계 Serializer"""
    year = serializers.IntegerField()
    month = serializers.IntegerField()
    total_days = serializers.IntegerField()
    completed_days = serializers.IntegerField()
    completion_rate = serializers.FloatField()
    dates = serializers.ListField(child=serializers.CharField())
