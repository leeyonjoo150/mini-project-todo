from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


class Task(models.Model):
    """할 일 모델"""

    TASK_TYPE_CHOICES = [
        ('once', '한 번만'),
        ('daily', '매일'),
        ('weekly', '요일별'),
        ('period', '기간'),
    ]

    PRIORITY_CHOICES = [
        ('high', '높음'),
        ('medium', '보통'),
        ('low', '낮음'),
    ]

    STATUS_CHOICES = [
        ('active', '활성'),
        ('archived', '보관'),
    ]

    # 관계
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks', verbose_name='사용자')

    # 기본 정보
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='상세 설명')

    # 타입 및 상태
    task_type = models.CharField(max_length=10, choices=TASK_TYPE_CHOICES, default='once', verbose_name='할 일 타입')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium', verbose_name='우선순위')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active', verbose_name='상태')

    # 반복 설정 (weekly 타입용)
    repeat_days = models.CharField(max_length=50, blank=True, verbose_name='반복 요일',
                                   help_text='Mon,Tue,Wed,Thu,Fri,Sat,Sun 형식')

    # 날짜
    start_date = models.DateField(null=True, blank=True, verbose_name='시작일')
    end_date = models.DateField(null=True, blank=True, verbose_name='종료일')
    due_date = models.DateField(null=True, blank=True, verbose_name='마감일')

    # 메타 정보
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일시')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일시')
    archived_at = models.DateTimeField(null=True, blank=True, verbose_name='보관일시')

    class Meta:
        verbose_name = '할 일'
        verbose_name_plural = '할 일 목록'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.get_task_type_display()})"

    def clean(self):
        """모델 검증"""
        # weekly 타입은 repeat_days 필수
        if self.task_type == 'weekly' and not self.repeat_days:
            raise ValidationError({'repeat_days': 'weekly 타입은 반복 요일을 지정해야 합니다.'})

        # period 타입은 start_date와 end_date 필수
        if self.task_type == 'period':
            if not self.start_date or not self.end_date:
                raise ValidationError({
                    'start_date': 'period 타입은 시작일과 종료일을 지정해야 합니다.',
                    'end_date': 'period 타입은 시작일과 종료일을 지정해야 합니다.'
                })
            if self.start_date > self.end_date:
                raise ValidationError({'end_date': '종료일은 시작일보다 이후여야 합니다.'})

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
