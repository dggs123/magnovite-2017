from django.contrib import admin

from .models import Invoice

@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['created', 'invoice_type', 'profile', 'pending', 'success', 'get_id']
    list_filter = ['created', 'invoice_type', 'pending', 'success']
