from django.contrib import admin
from django.core.exceptions import ValidationError

from main.models import Profile
from .models import Event, Registration


class EventHeadInline(admin.TabularInline):
    model = Profile.events.through
    raw_id_fields = ('profile',)
    extra = 0
    verbose_name = 'Event Head'
    verbose_name_plural = 'Event Heads'

class RegistrationsInline(admin.TabularInline):
    model = Registration
    fields = ('profile', 'team_id')
    extra = 0

    def get_readonly_fields(self, req, obj=None):
        fields = super(RegistrationsInline, self).get_readonly_fields(req, obj)

        if not req.user.is_superuser and req.user.has_perm('event.own_event_registrations'):
            return self.fields

        return fields

class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'id', 'technical', 'team_type', 'complete_status', 'num_registrations', 'views']
    list_filter = ['technical', 'team_type']
    inlines = [EventHeadInline]

    readonly_fields = ('views',)

    def get_queryset(self, req):
        qs = super(EventAdmin, self).get_queryset(req)
        qs = qs.prefetch_related('registration_set')
        if req.user.is_superuser:
            return qs

        if req.user.has_perm('event.change_own'):
            qs = qs.filter(heads=req.user.profile)

        return qs

admin.site.register(Event, EventAdmin)


class RegistrationAdmin(admin.ModelAdmin):
    fields = ('event', 'profile', 'team_id')
    list_display = ['event', 'profile', 'team_id', 'on_spot', 'created']
    ordering = ['-created']
    search_fields = ('team_id', 'profile__name')
    list_filter = ['event', 'on_spot']

    def get_readonly_fields(self, req, obj=None):
        fields = super(RegistrationAdmin, self).get_readonly_fields(req, obj)

        if not req.user.is_superuser and req.user.has_perm('event.own_event_registrations'):
            return self.fields

        return fields


    def get_queryset(self, req):
        qs = super(RegistrationAdmin, self).get_queryset(req)
        if req.user.is_superuser:
            return qs

        if req.user.has_perm('event.own_event_registrations'):
            qs = qs.filter(event__heads=req.user.profile)

        return qs

admin.site.register(Registration, RegistrationAdmin)
