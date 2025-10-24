from django.contrib import admin
from .models import Completion


@admin.register(Completion)
class CompletionAdmin(admin.ModelAdmin):
    list_display = ['task', 'completed_date', 'completed_time', 'created_at']
    list_filter = ['completed_date', 'created_at']
    search_fields = ['task__title', 'note']
    readonly_fields = ['completed_time', 'created_at']

    fieldsets = (
        ('완료 정보', {
            'fields': ('task', 'completed_date', 'completed_time', 'note')
        }),
        ('메타 정보', {
            'fields': ('created_at',)
        }),
    )
