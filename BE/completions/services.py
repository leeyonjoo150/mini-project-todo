from datetime import date, timedelta
from .models import Completion
from tasks.models import Task


class CompletionService:
    """Completion 관련 비즈니스 로직"""

    @staticmethod
    def mark_complete(task, completed_date=None, note=''):
        """할 일 완료 처리"""
        if completed_date is None:
            completed_date = date.today()

        # 중복 완료 방지 (get_or_create 사용)
        completion, created = Completion.objects.get_or_create(
            task=task,
            completed_date=completed_date,
            defaults={'note': note}
        )

        return completion, created

    @staticmethod
    def is_completed_on_date(task_id, check_date=None):
        """특정 날짜에 완료했는지 확인"""
        if check_date is None:
            check_date = date.today()

        return Completion.objects.filter(
            task_id=task_id,
            completed_date=check_date
        ).exists()

    @staticmethod
    def get_weekly_stats(task_id, start_date=None):
        """주간 완료 통계"""
        if start_date is None:
            today = date.today()
            start_date = today - timedelta(days=6)  # 최근 7일

        end_date = start_date + timedelta(days=6)

        completions = Completion.objects.filter(
            task_id=task_id,
            completed_date__gte=start_date,
            completed_date__lte=end_date
        )

        completed_days = completions.count()
        total_days = 7

        return {
            'total_days': total_days,
            'completed_days': completed_days,
            'completion_rate': round((completed_days / total_days) * 100, 1) if total_days > 0 else 0,
            'dates': [c.completed_date.isoformat() for c in completions]
        }

    @staticmethod
    def get_streak(task_id):
        """연속 달성일 계산"""
        today = date.today()
        streak = 0

        # 오늘부터 거꾸로 확인
        check_date = today

        while True:
            if CompletionService.is_completed_on_date(task_id, check_date):
                streak += 1
                check_date -= timedelta(days=1)
            else:
                break

        return streak

    @staticmethod
    def get_completion_history(task_id, days=30):
        """완료 히스토리 조회"""
        end_date = date.today()
        start_date = end_date - timedelta(days=days-1)

        completions = Completion.objects.filter(
            task_id=task_id,
            completed_date__gte=start_date,
            completed_date__lte=end_date
        ).order_by('-completed_date')

        return completions

    @staticmethod
    def get_monthly_stats(task_id, year=None, month=None):
        """월간 완료 통계"""
        today = date.today()
        if year is None:
            year = today.year
        if month is None:
            month = today.month

        # 해당 월의 첫날과 마지막날
        from calendar import monthrange
        days_in_month = monthrange(year, month)[1]
        start_date = date(year, month, 1)
        end_date = date(year, month, days_in_month)

        completions = Completion.objects.filter(
            task_id=task_id,
            completed_date__gte=start_date,
            completed_date__lte=end_date
        )

        completed_days = completions.count()

        return {
            'year': year,
            'month': month,
            'total_days': days_in_month,
            'completed_days': completed_days,
            'completion_rate': round((completed_days / days_in_month) * 100, 1),
            'dates': [c.completed_date.isoformat() for c in completions]
        }
