from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("organizations", "0006_organization_logo"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="SupportTicket",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255)),
                ("email", models.EmailField(db_index=True, max_length=254)),
                ("subject", models.CharField(max_length=255)),
                ("category", models.CharField(default="general", max_length=100)),
                ("message", models.TextField()),
                ("status", models.CharField(choices=[("open", "Open"), ("in_progress", "In Progress"), ("resolved", "Resolved"), ("closed", "Closed")], db_index=True, default="open", max_length=20)),
                ("priority", models.CharField(choices=[("low", "Low"), ("normal", "Normal"), ("high", "High"), ("urgent", "Urgent")], db_index=True, default="normal", max_length=20)),
                ("source", models.CharField(choices=[("public", "Public"), ("in_app", "In App")], db_index=True, default="public", max_length=20)),
                ("admin_response", models.TextField(blank=True)),
                ("responded_at", models.DateTimeField(blank=True, null=True)),
                ("resolved_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(blank=True, default=dict)),
                ("organization", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="support_tickets", to="organizations.organization")),
                ("requester", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="support_tickets", to=settings.AUTH_USER_MODEL)),
            ],
            options={
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="supportticket",
            index=models.Index(fields=["status", "priority"], name="support_tic_status_49819d_idx"),
        ),
        migrations.AddIndex(
            model_name="supportticket",
            index=models.Index(fields=["organization", "status"], name="support_tic_organiz_146eb8_idx"),
        ),
        migrations.AddIndex(
            model_name="supportticket",
            index=models.Index(fields=["requester", "status"], name="support_tic_request_e4a05b_idx"),
        ),
    ]
