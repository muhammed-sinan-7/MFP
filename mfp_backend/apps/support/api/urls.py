from django.urls import path

from .views import PublicSupportTicketCreateView, SupportTicketDetailView, SupportTicketListCreateView

urlpatterns = [
    path("public/", PublicSupportTicketCreateView.as_view()),
    path("tickets/", SupportTicketListCreateView.as_view()),
    path("tickets/<uuid:ticket_id>/", SupportTicketDetailView.as_view()),
]

