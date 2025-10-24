from django.db import models
from tasks.models import Task


class Completion(models.Model):
    """할 일 완료 기록 모델"""

    # 관계
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='completions', verbose_name='할 일')

    # 완료 정보
    completed_date = models.DateField(verbose_name='완료 날짜')
    completed_time = models.TimeField(auto_now_add=True, verbose_name='완료 시각')
    note = models.TextField(blank=True, verbose_name='메모')

    # 메타 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일시')

    class Meta:
        verbose_name = '완료 기록'
        verbose_name_plural = '완료 기록 목록'
        ordering = ['-completed_date', '-completed_time']
        # 같은 할 일은 하루에 한 번만 완료 가능
        unique_together = ['task', 'completed_date']

    def __str__(self):
        return f"{self.task.title} - {self.completed_date}"
