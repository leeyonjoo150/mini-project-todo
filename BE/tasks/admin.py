from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'task_type', 'priority', 'status', 'due_date', 'created_at']
    list_filter = ['task_type', 'priority', 'status', 'created_at']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'archived_at']

    fieldsets = (
        ('기본 정보', {
            'fields': ('user', 'title', 'description')
        }),
        ('타입 및 상태', {
            'fields': ('task_type', 'priority', 'status')
        }),
        ('반복 설정', {
            'fields': ('repeat_days',)
        }),
        ('날짜', {
            'fields': ('start_date', 'end_date', 'due_date')
        }),
        ('메타 정보', {
            'fields': ('created_at', 'updated_at', 'archived_at')
        }),
    )
