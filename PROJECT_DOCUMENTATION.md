# MFP Project Documentation

## 1. Project Overview
MFP is a multi-platform social publishing and analytics SaaS application.

Core capabilities:
- User authentication with OTP verification and JWT sessions.
- Organization onboarding and member/role management.
- Social account integrations: Meta/Instagram, LinkedIn, YouTube.
- Post creation, scheduling, publishing, and recycle bin workflows.
- Unified analytics dashboard and per-platform analytics.
- Industry news ingestion and feed delivery.
- AI-assisted post content generation.
- Audit logging and operational observability.

## 2. High-Level Architecture
The project follows a modular full-stack architecture:
- Frontend: React + Vite SPA (`mfp_frontend`).
- Backend: Django + DRF modular API (`mfp_backend`).
- Database: PostgreSQL.
- Cache/Broker: Redis.
- Async workers: Celery + Celery Beat + Flower.
- Reverse proxy: Nginx (Docker deployment).
- Storage: AWS S3 via `django-storages`.
- Monitoring: Prometheus middleware + Sentry support.

Runtime in Docker:
- `web` (Gunicorn/Django API)
- `db` (Postgres 15)
- `redis` (Redis 7)
- `celery` (background workers)
- `celery_beat` (scheduled jobs)
- `flower` (task monitor on `:5555`)
- `nginx` (entrypoint on `:8080`)

## 3. Repository Structure
Top-level:
- `docker-compose.yml`: multi-service orchestration.
- `mfp_backend/`: Django backend.
- `mfp_frontend/`: React frontend.

Backend key folders:
- `apps/authentication`
- `apps/organizations`
- `apps/industries`
- `apps/social_accounts`
- `apps/posts`
- `apps/analytics`
- `apps/news`
- `apps/audit`
- `apps/ai`
- `config/` (settings, urls, celery, wsgi/asgi)
- `common/` (shared model mixins/utilities)

Frontend key folders:
- `src/pages` (route pages)
- `src/features/dashboard` (main dashboard feature)
- `src/components` (UI by domain)
- `src/services` (API client/service layer)
- `src/hooks` (data hooks)
- `src/layouts` (shell layout)
- `src/context` (auth context)

## 4. Technology Stack
Backend:
- Python 3.12
- Django 5.2.x
- Django REST Framework
- SimpleJWT
- Django Filter
- DRF YASG (Swagger/ReDoc)
- Celery + django-celery-beat
- Redis + django-redis
- PostgreSQL + psycopg2
- django-storages + boto3 (S3)
- django-prometheus
- sentry-sdk
- django-encrypted-model-fields
- newspaper3k/feedparser/BeautifulSoup (news pipeline)
- OpenAI and Groq SDKs (AI features)

Frontend:
- React 19
- Vite 7
- React Router
- Axios
- Tailwind CSS 4
- Recharts
- React Hook Form + Zod
- Sonner (toast notifications)
- date-fns

Infrastructure:
- Docker / Docker Compose
- Gunicorn
- Nginx
- Flower

## 5. Backend Module Documentation

### 5.1 Authentication (`apps/authentication`)
Purpose:
- Registration, login, logout.
- OTP flows for email verification and password reset.
- JWT refresh and token lifecycle.

Key models:
- `User`: custom auth user with email-first identity.
- `OTPToken`: hashed OTP records with purpose and expiry.

API (`/api/v1/auth/`):
- `register/`
- `login/`
- `request-email-verification-otp/`
- `verify-email-otp/`
- `request-password-reset/`
- `reset-password/`
- `token/refresh/`
- `logout/`

### 5.2 Organizations (`apps/organizations`)
Purpose:
- Organization creation and account context.
- Membership, role changes, ownership transfer.
- Settings management.

Key models:
- `Organization`
- `OrganizationMember`
- `OrganizationInvite`

API (`/api/v1/organizations/`):
- `create/`
- `delete/`
- `settings/`
- `members/`
- `members/<member_id>/remove/`
- `members/<member_id>/change-role/`
- `members/<member_id>/transfer-ownership/`

### 5.3 Industries (`apps/industries`)
Purpose:
- Industry taxonomy for org personalization and news.

Key models:
- `Industry`
- `Tag`

API (`/api/v1/industries/`):
- `GET /`

### 5.4 Social Accounts (`apps/social_accounts`)
Purpose:
- OAuth integration and account lifecycle management.
- Publishing target synchronization per platform.

Key models:
- `SocialAccount`
- `PublishingTarget`
- `MetaPage`
- `LinkedInOrganization`

Supported providers:
- `meta`
- `instagram`
- `linkedin`
- `youtube`

Key implementation:
- Meta callback stores long-lived tokens.
- Meta page sync discovers Facebook pages and linked Instagram business accounts.
- Publishing targets are created per platform resource.
- Refresh/disconnect flows are provider-aware.

API (`/api/v1/social/`):
- `GET /` (connected accounts)
- `GET /meta/connect/`, `GET /meta/callback/`
- `GET /linkedin/connect/`, `GET /linkedin/callback/`
- `GET /youtube/connect/`, `GET /youtube/callback/`
- `GET /publishing-targets/`
- `POST /accounts/<account_id>/refresh/`
- `POST /accounts/<account_id>/disconnect/`

### 5.5 Posts & Scheduler (`apps/posts`)
Purpose:
- Cross-platform post creation and scheduling.
- Media validation and provider constraints.
- Publish state machine and retry behavior.
- Recycle bin + permanent delete lifecycle.

Key models:
- `Post`
- `PostPlatform`
- `PostPlatformMedia`

Statuses:
- `pending`, `processing`, `success`, `failed`

API (`/api/v1/posts/`):
- `GET /` list posts
- `POST /create/`
- `GET /<pk>/`
- `PATCH /<pk>/edit/`
- `DELETE /<pk>/delete/`
- `POST /<pk>/restore/`
- `DELETE /<pk>/permanent-delete/`
- `GET /recycle-bin/`
- `DELETE /recycle-bin/empty/`

Background tasks:
- `dispatch_scheduled_platforms` every minute.
- `publish_platform` async with retry/backoff and idempotency checks.
- `purge_recycle_bin` auto cleanup (30-day retention).

### 5.6 Analytics (`apps/analytics`)
Purpose:
- Unified overview and platform analytics endpoints.
- Dashboard data aggregation.
- Snapshot-based historical trending.

Key models:
- `PostPlatformAnalytics` (current per post-platform metrics)
- `PostPlatformAnalyticsSnapshot` (historical snapshots)

API (`/api/v1/analytics/`):
- `dashboard/full/`
- `overview/`
- `engagement-chart/`
- `engagement-distribution/`
- `recent-posts/`
- `instagram/*`
- `linkedin/*`
- `youtube/*`

Background tasks:
- `sync_post_analytics` (periodic fetch from platform APIs).
- `cleanup_old_analytics_snapshots` (30-day cleanup).

Data strategy:
- Cache on heavy endpoints via Redis.
- Latest-snapshot fallbacks in dashboard to avoid blank/zeroed KPI states.

### 5.7 News (`apps/news`)
Purpose:
- Pull industry-specific articles from RSS sources.
- Persist and expose curated feeds.

Key models:
- `NewsSource`
- `NewsArticle`

API (`/api/v1/news/`):
- `industry/`

Background tasks:
- `ingest_all_news` every 30 minutes.
- Per-industry fan-out via `ingest_news_for_industry`.

### 5.8 Audit (`apps/audit`)
Purpose:
- Immutable audit trail for security and product actions.

Key model:
- `AuditLog` with severity, action type, actor, org, metadata.

API (`/api/v1/audit/`):
- `logs/`

### 5.9 AI (`apps/ai`)
Purpose:
- AI content generation endpoint for post drafting/refinement.

API (`/api/v1/ai/`):
- `generate-post/`

## 6. Frontend Documentation

### 6.1 Routing
Public pages:
- `/`
- `/login`
- `/register`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`
- `/terms`
- `/privacy`

Authenticated app shell:
- `/overview` (main dashboard)
- `/accounts`
- `/posts`
- `/schedule`
- `/analytics`
- `/audit`
- `/recycle-bin`
- `/feeds`
- `/settings`

### 6.2 API Layer
Primary client:
- `src/services/api.js`

Behavior:
- Adds bearer token to protected requests.
- Handles 401 with refresh-token queueing.
- Retries original request after successful refresh.
- Clears local state and redirects on refresh failure.

### 6.3 Main Feature Areas
- Dashboard: KPI cards, top posts, integrations, news.
- Connected Accounts: OAuth connect/refresh/disconnect.
- Scheduler: date-based planning, platform editors, media uploads.
- Post Management: post list/edit/delete/restore.
- Analytics: overview and per-platform visualizations.
- News Feed: industry-driven article panels.
- Audit Logs: filtered activity stream.

### 6.4 Validation & UX
- Form validation with `react-hook-form` + `zod`.
- Toast notifications through `sonner`.
- Charting through `recharts`.
- Legal consent banner with 30-day local persistence.

## 7. Data Model Summary
Primary relational flow:
- `Organization` -> `SocialAccount` -> `PublishingTarget`
- `Organization` -> `Post` -> `PostPlatform` -> `PostPlatformMedia`
- `PostPlatform` -> `PostPlatformAnalytics` (current)
- `PostPlatform` -> `PostPlatformAnalyticsSnapshot` (history)
- `Industry` -> `NewsSource` -> `NewsArticle`
- `User`/Org actions -> `AuditLog`

## 8. Async Jobs and Schedules
Configured in `config/celery.py`:
- Meta token refresh dispatcher: every 12h.
- YouTube token refresh dispatcher: every 15m.
- Scheduled publish dispatcher: every 1m.
- Recycle bin purge: hourly.
- Analytics sync: every 30m.
- News ingestion: every 30m.
- Analytics snapshot cleanup: daily at 02:30.

## 9. Caching, Performance, and Scaling
- Redis used for:
  - DRF endpoint caching.
  - app-level cache for dashboard/analytics responses.
  - Celery broker/result backend.
- DB indexing present on:
  - org/provider/status/time lookup paths.
  - analytics snapshot time-series paths.
- Async processing removes slow network IO from request path.
- Nginx and Gunicorn provide production-ready request serving.

## 10. Security and Compliance Notes
- JWT auth with refresh rotation support.
- OTP-based verification and password reset.
- Throttling rules via DRF throttles.
- Encrypted social tokens (`django-encrypted-model-fields`).
- CORS and CSRF controls in settings.
- Audit logging for sensitive actions.
- Legal pages and consent banner present in frontend.

## 11. API Documentation and Health Endpoints
- Swagger UI: `/swagger/`
- ReDoc: `/redoc/`
- Health check: `/health/`
- Readiness check: `/ready/`
- Prometheus: included at root through `django_prometheus.urls`

## 12. Environment Variables (Backend)
Important variables used by code:
- App/security: `SECRET_KEY`, `DEBUG`, `FIELD_ENCRYPTION_KEY`
- DB: `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- Redis/cache: `REDIS_URL`, `REDIS_CACHE_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`
- Auth/email: `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- Meta: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `META_STATE_SECRET`
- LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
- Google/YouTube: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- AI: `OPENAI_API_KEY`, `GROQ_API_KEY`
- Storage: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`
- Frontend redirect: `FRONTEND_SUCCESS_URL`
- Observability: `SENTRY_DSN`

Frontend:
- `VITE_API_BASE`

## 13. Local Development Setup
Prerequisites:
- Docker + Docker Compose
- Node.js 18+ (recommended)
- Python 3.12 (for non-docker backend workflows)

Option A: Full stack with Docker
1. Configure root `.env`.
2. Run:
```bash
docker compose up --build
```
3. Access:
- API via Nginx: `http://localhost:8080/api/v1/...`
- Flower: `http://localhost:5555`

Option B: Frontend local + backend Docker
1. Start backend stack via Docker.
2. In `mfp_frontend/.env`, set `VITE_API_BASE` to backend base URL.
3. Run frontend:
```bash
cd mfp_frontend
npm install
npm run dev
```

## 14. AWS Deployment Notes (Current Direction)
Current implementation is AWS-ready in these areas:
- S3-backed media storage via `django-storages`.
- Containerized services suitable for ECS/EC2 deployment.
- Environment-variable driven configuration.

Typical AWS production shape:
- ALB -> Nginx/Django service
- RDS PostgreSQL
- ElastiCache Redis
- ECS tasks for web/celery/celery-beat/flower (or equivalent)
- S3 for media/static assets
- CloudWatch + Sentry for monitoring

## 15. How Core Workflows Are Implemented

### 15.1 Account Connection Workflow
1. Frontend triggers provider connect endpoint.
2. OAuth callback exchanges code for tokens.
3. `SocialAccount` upserted.
4. Publishing targets synchronized.
5. UI refreshes targets/accounts.

### 15.2 Post Scheduling Workflow
1. User creates post with target IDs and media.
2. API stores `Post` and `PostPlatform` rows.
3. `dispatch_scheduled_platforms` picks due jobs.
4. `publish_platform` uses provider publisher adapters.
5. Status and failure metadata updated per platform.

### 15.3 Analytics Workflow
1. Published platform posts are selected.
2. Provider-specific fetchers pull latest metrics.
3. Current analytics table is updated.
4. Snapshots are periodically inserted/deduplicated.
5. Dashboard and analytics APIs aggregate cached responses.

## 16. Recent Implemented Improvements (Current State)
- Connected account sync reliability improved for Meta/Instagram.
- Publishing target retrieval stabilized for scheduler UX.
- Analytics endpoint performance and cache behavior improved.
- Snapshot growth management and cleanup automation added.
- Recycle bin retention aligned to 30 days.
- Dashboard endpoint now supports stronger fallback calculations.
- Main dashboard UI updated for cleaner data-driven sections.

## 17. Known Technical Debt / Future Enhancements
- Add formal architecture diagrams (C4/UML).
- Add automated test coverage docs and CI badges.
- Add OpenAPI export file and client generation guidance.
- Add role-permission matrix and security hardening checklist.
- Add per-environment config files (`.env.example`) with comments.

## 18. Quick Reference
- Backend root: `mfp_backend/`
- Frontend root: `mfp_frontend/`
- Compose entry: `docker-compose.yml`
- Main dashboard page: `/overview`
- Unified dashboard API: `/api/v1/analytics/dashboard/full/`

