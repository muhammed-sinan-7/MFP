import logging
import threading

from django.conf import settings
from django.core.mail import send_mail

from .models import SupportTicket

logger = logging.getLogger(__name__)


def notify_support_team(ticket: SupportTicket):
    support_email = getattr(settings, "SUPPORT_EMAIL", None) or settings.DEFAULT_FROM_EMAIL
    if not support_email:
        return

    subject = f"[MFP Support] {ticket.subject}"
    body = (
        f"Ticket ID: {ticket.id}\n"
        f"Source: {ticket.source}\n"
        f"Priority: {ticket.priority}\n"
        f"Status: {ticket.status}\n"
        f"Name: {ticket.name}\n"
        f"Email: {ticket.email}\n"
        f"Organization: {getattr(ticket.organization, 'name', '-')}\n\n"
        f"Message:\n{ticket.message}\n"
    )

    def _runner():
        try:
            send_mail(
                subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [support_email],
                fail_silently=True,
            )
        except Exception as exc:
            logger.warning("Support ticket email notification failed: %s", exc)

    threading.Thread(target=_runner, daemon=True).start()

