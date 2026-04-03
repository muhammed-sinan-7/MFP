# UniSocial (MFP) - Official Project Overview

Last updated: `2026-04-02`

## 1. Project Summary
UniSocial (MFP) is a multi-tenant social media management platform that helps organizations:

- Connect social accounts (Meta/Instagram, LinkedIn, YouTube)
- Create and schedule cross-platform content
- Track analytics in one dashboard
- Manage team access with role-based controls
- Use AI assistance for content drafting

This document is the concise official overview for product, technical, and operations stakeholders.

## 2. Core Product Features
- Authentication with email OTP verification and secure session handling
- Organization onboarding and membership roles (`OWNER`, `ADMIN`, `EDITOR`, `VIEWER`)
- Social account OAuth integrations and publishing target sync
- Multi-platform scheduling and asynchronous publishing
- Dashboard and platform-level analytics (overview, trends, engagement)
- Industry news feed by organization domain
- Audit logs for critical actions
- Platform Admin console:
  - Users
  - Organizations
  - Posts
  - Social Accounts
  - Audit Logs
  - Industries (CRUD)
  - News Sources (CRUD)

## 3. Technology Stack
### Backend
- Python 3.12
- Django + Django REST Framework
- SimpleJWT (access/refresh token flow)
- PostgreSQL
- Redis
- Celery + Celery Beat + Flower
- AWS S3 (`django-storages`)
- Prometheus middleware, optional Sentry

### Frontend
- React 19 + Vite
- Tailwind CSS
- Axios
- Recharts
- React Hook Form + Zod

### Infrastructure
- Docker Compose services: `web`, `db`, `redis`, `celery`, `celery_beat`, `flower`, `nginx`, `certbot`

## 4. High-Level Architecture
1. Frontend SPA calls backend REST APIs.
2. Nginx handles HTTPS and proxies traffic to Django web service.
3. Django handles auth, business logic, and DB operations.
4. Celery workers process async tasks (publish, token refresh, analytics/news sync).
5. Redis provides cache + queue backend.
6. S3 stores uploaded media.

## 5. Security Essentials
- JWT access token + HttpOnly refresh cookie model
- Refresh token rotation and blacklist support
- OTP verification with cooldown/attempt limits
- Provider tokens stored in encrypted DB fields
- CORS/CSRF and secure cookie controls (env-based)
- Org-scoped data access via membership context
- Immutable audit logs for sensitive actions

## 6. Session Essentials
- Access tokens are sent as Bearer headers by frontend API client.
- Refresh token is cookie-based and renewed via `/api/v1/auth/token/refresh/`.
- Frontend uses refresh de-duplication to avoid race conditions.
- On invalid refresh (`401`), session is cleared and user is logged out safely.

## 7. Scheduling Essentials
- Scheduler receives `publishing_target_ids` and media payload.
- Backend validates targets belong to current org.
- One `PostPlatform` record is created per target/provider.
- Celery dispatcher picks due posts every minute.
- Provider publisher adapters publish content and update status (`pending/processing/success/failed`).

## 8. Analytics Essentials
- Periodic task syncs metrics for published content.
- Current metrics + historical snapshots are stored.
- Dashboard and analytics endpoints aggregate org data.
- Redis caching reduces repeated heavy queries.

## 9. Key API Groups
- `/api/v1/auth/`
- `/api/v1/organizations/`
- `/api/v1/social/`
- `/api/v1/posts/`
- `/api/v1/analytics/`
- `/api/v1/news/`
- `/api/v1/audit/`
- `/api/v1/ai/`
- `/api/v1/admin-panel/`

## 10. Deployment Essentials
- Main deployment mode: Docker Compose on server/VM
- Nginx terminates TLS and proxies to backend
- PostgreSQL + Redis required
- Environment variables control app, auth, providers, storage, and integrations

## 11. Operational Essentials
- Health endpoints:
  - `/health/`
  - `/ready/`
- API docs:
  - `/swagger/`
  - `/redoc/`
- Async monitoring:
  - Flower service
- Slow request visibility:
  - request timing middleware logs

## 12. Current Focus Areas
- Continued mobile responsiveness improvements across pages
- Provider-specific analytics permission constraints (especially LinkedIn)
- CI/CD and testing expansion

## 13. Document Scope
This is a concise official overview.  
For full deep technical documentation, see:
- `PROJECT_DOCUMENTATION_NOTION_READY.md`
- `NOTION_IMPORT_PROJECT_DOC.html`
