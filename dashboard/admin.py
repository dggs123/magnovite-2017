from django.contrib import admin

from .models import Analytics

@admin.register(Analytics)
class AnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date']
    list_filter = ['date']
