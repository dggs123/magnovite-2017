from django.contrib import admin

from main.models import Profile

from .models import Workshop


class RegisteredInline(admin.TabularInline):
    model = Profile.registered_workshops.through
    extra = 0

@admin.register(Workshop)
class WorkshopAdmin(admin.ModelAdmin):
    list_display = ['title', 'num_registered']
    inlines = [RegisteredInline]
