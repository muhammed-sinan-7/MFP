from django.conf import settings
from django.db import models
from django.utils import timezone

from apps.organizations.models import Organization
from common.models import BaseModel


class SupportTicketStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_PROGRESS = "in_progress", "In Progress"
    RESOLVED = "resolved", "Resolved"
    CLOSED = "closed", "Closed"


class SupportTicketPriority(models.TextChoices):
    LOW = "low", "Low"
    NORMAL = "normal", "Normal"
    HIGH = "high", "High"
    URGENT = "urgent", "Urgent"


class SupportTicketSource(models.TextChoices):
    PUBLIC = "public", "Public"
    IN_APP = "in_app", "In App"


class SupportTicket(BaseModel):
    organization = models.ForeignKey(
        Organization,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )
    requester = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="support_tickets",
    )
    name = models.CharField(max_length=255)
    email = models.EmailField(db_index=True)
    subject = models.CharField(max_length=255)
    category = models.CharField(max_length=100, default="general")
    message = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=SupportTicketStatus.choices,
        default=SupportTicketStatus.OPEN,
        db_index=True,
    )
    priority = models.CharField(
        max_length=20,
        choices=SupportTicketPriority.choices,
        default=SupportTicketPriority.NORMAL,
        db_index=True,
    )
    source = models.CharField(
        max_length=20,
        choices=SupportTicketSource.choices,
        default=SupportTicketSource.PUBLIC,
        db_index=True,
    )
    admin_response = models.TextField(blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "priority"]),
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["requester", "status"]),
        ]

    def save(self, *args, **kwargs):
        if self.status in {SupportTicketStatus.RESOLVED, SupportTicketStatus.CLOSED}:
            self.resolved_at = self.resolved_at or timezone.now()
        elif self.status in {SupportTicketStatus.OPEN, SupportTicketStatus.IN_PROGRESS}:
            self.resolved_at = None

        if self.admin_response and not self.responded_at:
            self.responded_at = timezone.now()

        super().save(*args, **kwargs)
