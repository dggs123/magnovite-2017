from django.contrib import admin

from .models import Subscription

@admin.register(Subscription)
class AuthorAdmin(admin.ModelAdmin):
    list_display = ('email',)
