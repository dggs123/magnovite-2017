from django import forms
from django.contrib import admin
from django.contrib.admin import AdminSite
from django.contrib.auth.models import Group
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import ReadOnlyPasswordHashField
from django.contrib.admin.models import LogEntry, DELETION
from django.utils.html import escape
from django.core.urlresolvers import reverse

from .models import MUser, Profile
from event.models import Registration, Event
from workshop.models import Workshop
from payment.models import Invoice

class WorkshopsInline(admin.TabularInline):
    model = Profile.registered_workshops.through
    extra = 0

class RegistrationsInline(admin.TabularInline):
    model = Registration
    extra = 0

class EventsInline(admin.TabularInline):
    model = Profile.events.through
    verbose_name = 'Event Incharge Of'
    verbose_name_plural = 'Events Incharge Of'
    extra = 0

class InvoiceInline(admin.TabularInline):
    model = Invoice
    fields = ('description', 'invoice_type', 'success')
    extra = 0

class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'user', 'auth_provider', 'college', 'mobile')
    search_fields = ('name', 'mobile', 'college')
    exclude = ('events', 'registered_workshops')
    list_filter = ('auth_provider',)
    inlines = [InvoiceInline, WorkshopsInline, RegistrationsInline, EventsInline]

    def get_queryset(self, req):
        print('hi')
        qs = super(ProfileAdmin, self).get_queryset(req)
        return qs.prefetch_related('user')

admin.site.register(Profile, ProfileAdmin)


class UserCreationForm(forms.ModelForm):
    """
    A form for creating new users. Includes all the required
    fields, plus a repeated password.
    """
    password1 = forms.CharField(label='Password', widget=forms.PasswordInput)
    password2 = forms.CharField(label='Password confirmation', widget=forms.PasswordInput)

    class Meta:
        model = MUser
        fields = ('email',)

    def clean_password2(self):
        # Check that the two password entries match
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError("Passwords don't match")
        return password2

    def save(self, commit=True):
        # Save the provided password in hashed format
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user


class UserChangeForm(forms.ModelForm):
    """
    A form for updating users. Includes all the fields on
    the user, but replaces the password field with admin's
    password hash display field.
    """
    password = ReadOnlyPasswordHashField(label= ("Password"),
        help_text= ("Raw passwords are not stored, so there is no way to see "
                    "this user's password, but you can change the password "
                    "using <a href=\"password/\">this form</a>."))

    class Meta:
        model = MUser
        fields = ('email', 'password', 'is_active', 'is_admin', 'is_staff')

    def clean_password(self):
        # Regardless of what the user provides, return the initial value.
        # This is done here, rather than on the field, because the
        # field does not have access to the initial value
        return self.initial["password"]


class ProfileInline(admin.StackedInline):
    model = Profile
    extra = 0


class MUserAdmin(UserAdmin):
    # The forms to add and change user instances
    form = UserChangeForm
    add_form = UserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('email', 'get_id', 'date_joined', 'is_admin', 'is_staff')
    list_filter = ('is_admin', 'is_staff', 'date_joined')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Permissions', {
            'fields': ('is_admin', 'is_superuser', 'is_staff')
        }),
        ('Permissions+', {'fields': ('groups', 'user_permissions')}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. UserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')}
        ),
    )
    search_fields = ('email',)
    ordering = ('-date_joined',)
    filter_horizontal = ()
    inlines = [ProfileInline]

admin.site.register(MUser, MUserAdmin)


class LogEntryAdmin(admin.ModelAdmin):

    date_hierarchy = 'action_time'

    readonly_fields = ('user', 'content_type', 'change_message', 'object_id',
                       'action_flag', 'object_repr')

    list_filter = [
        'content_type',
        'action_flag'
    ]

    search_fields = [
        'object_repr',
        'change_message'
    ]


    list_display = [
        'action_time',
        'user',
        'content_type',
        'object_link',
        'action_flag',
        'change_message',
    ]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return request.user.is_superuser and request.method != 'POST'

    def has_delete_permission(self, request, obj=None):
        return False

    def object_link(self, obj):
        if obj.action_flag == DELETION:
            link = escape(obj.object_repr)
        else:
            ct = obj.content_type
            link = u'<a href="%s">%s</a>' % (
                reverse('admin:%s_%s_change' % (ct.app_label, ct.model), args=[obj.object_id]),
                escape(obj.object_repr),
            )
        return link
    object_link.allow_tags = True
    object_link.admin_order_field = 'object_repr'
    object_link.short_description = u'object'

    def get_queryset(self, request):
        return super(LogEntryAdmin, self).get_queryset(request) \
            .prefetch_related('content_type')


admin.site.register(LogEntry, LogEntryAdmin)
