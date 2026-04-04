from django.db import transaction
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.organizations.mixins import OrganizationContextMixin
from apps.support.api.serializers import SupportTicketCreateSerializer, SupportTicketSerializer
from apps.support.models import SupportTicket, SupportTicketSource
from apps.support.services import notify_support_team


class PublicSupportTicketCreateView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "support"

    def post(self, request):
        serializer = SupportTicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            ticket = serializer.save(source=SupportTicketSource.PUBLIC)
            transaction.on_commit(lambda: notify_support_team(ticket))

        return Response(
            {
                "message": "Support request received. Our team will review it shortly.",
                "ticket": SupportTicketSerializer(ticket).data,
            },
            status=status.HTTP_201_CREATED,
        )


class SupportTicketListCreateView(OrganizationContextMixin, APIView):
    permission_classes = [IsAuthenticated]
    throttle_scope = "support"

    def get(self, request):
        queryset = SupportTicket.objects.filter(requester=request.user).select_related("organization")
        return Response(SupportTicketSerializer(queryset, many=True).data)

    def post(self, request):
        serializer = SupportTicketCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        with transaction.atomic():
            ticket = serializer.save(
                requester=request.user,
                organization=request.organization,
                email=request.user.email,
                name=request.user.email,
                source=SupportTicketSource.IN_APP,
            )
            transaction.on_commit(lambda: notify_support_team(ticket))

        return Response(
            {
                "message": "Support ticket created.",
                "ticket": SupportTicketSerializer(ticket).data,
            },
            status=status.HTTP_201_CREATED,
        )


class SupportTicketDetailView(OrganizationContextMixin, APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, ticket_id):
        ticket = (
            SupportTicket.objects.filter(id=ticket_id, requester=request.user)
            .select_related("organization")
            .first()
        )
        if not ticket:
            return Response({"error": "Support ticket not found"}, status=404)

        return Response(SupportTicketSerializer(ticket).data)

