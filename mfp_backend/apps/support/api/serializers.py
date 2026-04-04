from rest_framework import serializers

from apps.support.models import SupportTicket


class SupportTicketCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "category",
            "message",
            "priority",
        ]
        read_only_fields = ["id"]


class SupportTicketSerializer(serializers.ModelSerializer):
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = SupportTicket
        fields = [
            "id",
            "name",
            "email",
            "subject",
            "category",
            "message",
            "priority",
            "status",
            "source",
            "admin_response",
            "organization_name",
            "created_at",
            "updated_at",
            "responded_at",
            "resolved_at",
        ]

