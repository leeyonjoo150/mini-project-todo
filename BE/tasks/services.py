from datetime import date, timedelta
from .models import Task


class TaskService:
    """Task 관련 비즈니스 로직"""

    @staticmethod
    def get_today_tasks(user):
        """오늘 표시할 할 일 목록"""
        today = date.today()
        weekday = today.strftime('%a')  # Mon, Tue, Wed, ...

        active_tasks = Task.objects.filter(user=user, status='active')
        today_tasks = []

        for task in active_tasks:
            if TaskService._should_show_today(task, today, weekday):
                today_tasks.append(task)

        return today_tasks

    @staticmethod
    def _should_show_today(task, today, weekday):
        """특정 할 일을 오늘 보여줄지 판단"""
        if task.task_type == 'once':
            # 한 번만: due_date가 오늘이면 표시
            return task.due_date == today

        elif task.task_type == 'daily':
            # 매일: 항상 표시 (단, start_date/end_date 확인)
            if task.start_date and today < task.start_date:
                return False
            if task.end_date and today > task.end_date:
                return False
            return True

        elif task.task_type == 'weekly':
            # 요일별: repeat_days에 오늘 요일이 포함되면 표시
            if not task.repeat_days:
                return False
            days = [d.strip() for d in task.repeat_days.split(',')]
            return weekday in days

        elif task.task_type == 'period':
            # 기간: start_date ~ end_date 사이면 표시
            if not task.start_date or not task.end_date:
                return False
            return task.start_date <= today <= task.end_date

        return False

    @staticmethod
    def get_weekly_tasks(user):
        """이번 주 할 일 목록"""
        today = date.today()
        start_of_week = today - timedelta(days=today.weekday())  # 이번 주 월요일
        end_of_week = start_of_week + timedelta(days=6)  # 이번 주 일요일

        active_tasks = Task.objects.filter(user=user, status='active')
        weekly_tasks = []

        for task in active_tasks:
            if TaskService._should_show_this_week(task, start_of_week, end_of_week):
                weekly_tasks.append(task)

        return weekly_tasks

    @staticmethod
    def _should_show_this_week(task, start_of_week, end_of_week):
        """특정 할 일을 이번 주에 보여줄지 판단"""
        if task.task_type == 'once':
            # 한 번만: due_date가 이번 주면 표시
            if task.due_date:
                return start_of_week <= task.due_date <= end_of_week
            return False

        elif task.task_type == 'daily':
            # 매일: 이번 주와 겹치면 표시
            if task.start_date and task.start_date > end_of_week:
                return False
            if task.end_date and task.end_date < start_of_week:
                return False
            return True

        elif task.task_type == 'weekly':
            # 요일별: 무조건 표시
            return True

        elif task.task_type == 'period':
            # 기간: 이번 주와 겹치면 표시
            if not task.start_date or not task.end_date:
                return False
            return not (task.end_date < start_of_week or task.start_date > end_of_week)

        return False

    @staticmethod
    def get_overdue_tasks(user):
        """마감 지난 할 일"""
        today = date.today()
        return Task.objects.filter(
            user=user,
            status='active',
            task_type='once',
            due_date__lt=today
        )
