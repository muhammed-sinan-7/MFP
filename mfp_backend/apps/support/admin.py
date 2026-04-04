from django.contrib import admin

from .models import SupportTicket


@admin.register(SupportTicket)
class SupportTicketAdmin(admin.ModelAdmin):
    list_display = ("subject", "email", "status", "priority", "source", "created_at")
    list_filter = ("status", "priority", "source", "category")
    search_fields = ("subject", "email", "name", "message")

