# UniSocial / MFP - Full Project Documentation (Notion Ready)

Last updated from codebase scan: `2026-04-02`

---

## 1) Executive Summary

`MFP` (branded as `UniSocial` in UI) is a multi-tenant social media management SaaS with:

- Auth + onboarding + organization membership
- Social account connections (Meta/Instagram, LinkedIn, YouTube)
- Multi-platform post scheduling and async publishing
- Analytics aggregation and dashboarding
- Industry news feed ingestion
- AI-assisted post generation
- Audit logging and platform admin console

This repo is split into:

- `mfp_backend/` (Django + DRF + Celery)
- `mfp_frontend/` (React + Vite + Tailwind)
- `docker-compose.yml` (web/db/redis/celery/nginx/flower)

---

## 2) Product Goals and Why This Architecture Exists

### Business goals

- Let teams plan/publish across multiple social platforms from one UI.
- Avoid context switching between native apps.
- Give organization-level visibility and analytics.
- Keep secure multi-user access with role controls.

### Technical goals

- Keep API responses fast while platform publishing/analytics calls are slow.
- Support token-based social integrations with renewals.
- Keep tenant isolation (organization data separation).
- Support horizontal scaling in Docker/cloud environments.

### Why async + caching are used

- Publishing and analytics provider APIs are network-heavy and rate-limited.
- Celery workers handle long-running operations out of request path.
- Redis caching reduces repeated aggregate queries (`analytics`, `dashboard`, etc.).

---

## 3) Monorepo Structure

## Root

- `docker-compose.yml` - service orchestration
- `.env` - runtime environment variables
- `PROJECT_DOCUMENTATION.md` - existing summary doc
- `PROJECT_DOCUMENTATION_NOTION_READY.md` - this document

## Backend (`mfp_backend/`)

- `config/` - Django settings, URL routing, Celery app bootstrap, health endpoints
- `common/` - shared base models, middleware, pagination, exception handler
- `apps/authentication/`
- `apps/organizations/`
- `apps/industries/`
- `apps/social_accounts/`
- `apps/posts/`
- `apps/analytics/`
- `apps/news/`
- `apps/audit/`
- `apps/ai/`
- `apps/platform_admin/`
- `nginx/nginx.conf` - reverse proxy config
- `requirements.txt`

## Frontend (`mfp_frontend/`)

- `src/pages/` - route-level screens
- `src/components/` - reusable UI modules
- `src/features/dashboard/` - dashboard composition
- `src/services/` - API service wrappers
- `src/context/AuthContext.jsx` - session bootstrap and auth state
- `src/layouts/DashboardLayout.jsx` - app shell (sidebar/topbar/content)
- `src/hooks/` - analytics and dashboard data hooks

---

## 4) Runtime Architecture

## Services (`docker-compose.yml`)

- `web` - Django API via Gunicorn (`config.wsgi`)
- `db` - PostgreSQL 15
- `redis` - cache + Celery broker/backend
- `celery` - worker
- `celery_beat` - scheduled tasks
- `flower` - task monitoring
- `nginx` - TLS + reverse proxy
- `certbot` - certificate handling

## Request flow

1. Browser calls `https://app.unisocial.online` frontend.
2. Frontend API calls hit `https://api.unisocial.online`.
3. Nginx proxies to Django web container.
4. Django validates JWT, resolves org context, serves API.
5. For async work, Django queues Celery jobs through Redis.
6. Worker processes tasks and updates DB.

---

## 5) Backend Stack and Key Libraries

- Python 3.12
- Django 5.2.11
- Django REST Framework 3.16.1
- `djangorestframework_simplejwt` for JWT access/refresh
- Celery 5.6 + Redis
- PostgreSQL (`psycopg2-binary`)
- `django-storages` + boto3 for S3
- `django-encrypted-model-fields` for sensitive token fields
- `django-prometheus` for metrics
- `sentry-sdk` optional error reporting
- Google APIs + Meta Graph + LinkedIn APIs
- Groq SDK for AI text generation

---

## 6) Frontend Stack

- React 19
- Vite 7
- React Router
- Axios
- Tailwind CSS
- Recharts
- React Hook Form + Zod
- Sonner (toast)
- date-fns

---

## 7) Core Domain Model

## Tenant model

- `User` belongs to exactly one active organization membership (`OrganizationMember` uniqueness constraints).
- `Organization` owns social accounts, posts, analytics, and audit scope.

## Social model

- `SocialAccount` stores provider credentials at org scope.
- Each account has `PublishingTarget` rows (actual selectable destinations).
  - Example: one Meta account -> multiple Facebook pages + Instagram targets.

## Content model

- `Post` is logical parent.
- `PostPlatform` is one publish job per target/provider.
- `PostPlatformMedia` attaches ordered media files.

## Analytics model

- `PostPlatformAnalytics` = latest metrics (1:1 with post-platform)
- `PostPlatformAnalyticsSnapshot` = historical points (time series)

## Audit model

- `AuditLog` immutable record of critical actions.

---

## 8) Authentication, Session, and Security Design

## Auth pattern

- Access token: JWT Bearer, short lifetime (`15 min`).
- Refresh token: HttpOnly cookie, longer lifetime (`7 days` default, `30 days` with remember me).
- Refresh rotation enabled (`ROTATE_REFRESH_TOKENS=True`, blacklist enabled).

## Why this design

- Keeps access token off cookies (header-based API auth).
- Keeps refresh token inaccessible to JS (HttpOnly) to reduce token theft risk.
- Supports auto-session continuation without forcing frequent re-login.

## Backend auth endpoints

Prefix: `/api/v1/auth/`

- `register/`
- `request-email-verification-otp/`
- `verify-email-otp/`
- `login/`
- `me/`
- `token/refresh/`
- `logout/`
- `request-password-reset/`
- `reset-password/`

## OTP security model

- OTP values are never stored in plain text.
- Stored as HMAC digest: `HMAC(secret_key, user_id:purpose:otp)`.
- Cooldown via cache (`60s`).
- Expiry: `5 min`.
- Max attempts: `5`.
- Unique active OTP per user+purpose constraint.

## Cookie/CORS/CSRF controls

- Environment-sensitive cookie settings:
  - dev: `SameSite=Lax`, insecure cookies
  - prod: `SameSite=None`, secure cookies, domain `.unisocial.online`
- `CORS_ALLOW_CREDENTIALS=True`
- `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` env-driven
- `SECURE_PROXY_SSL_HEADER` and forwarded host handling for reverse proxy TLS

## Sensitive data protection

- Social access/refresh/page tokens stored in encrypted model fields.
- Passwords stored through Django hashers.
- Session refresh cookie is HttpOnly and scoped by path/domain settings.

## Authorization model

- Organization-level auth via `OrganizationContextMixin`:
  - attaches `request.organization` and `request.membership`
- Role permissions:
  - `OWNER`, `ADMIN`, `EDITOR`, `VIEWER`
- Platform admin guard:
  - `is_staff` or `is_superuser`

---

## 9) Frontend Session Lifecycle

Main files:

- `src/services/api.js`
- `src/context/AuthContext.jsx`

## Boot sequence

1. App boots `AuthContext`.
2. If public route and no access token -> do not trust stale stored user.
3. If access token exists -> call `/auth/me/`.
4. If needed -> call `/auth/token/refresh/` with credentials cookie.
5. Persist normalized user profile in storage.

## Token storage strategy

- Access token stored in session/local storage based on `remember_me`.
- Storage mode key tracks where token was persisted.
- Refresh token is cookie only.

## Refresh race handling

- Single in-flight refresh promise (`refreshInFlightPromise`) dedupes concurrent refresh calls.
- Axios response interceptor queues pending requests while refresh is in progress.
- Only hard logout on refresh `401` (not on transient network/server errors).

## Cross-tab logout sync

- Broadcast via custom event + localStorage `auth:event`.
- All tabs clear auth state on logout event.

---

## 10) Organization and Onboarding Flow

1. User registers -> inactive + unverified.
2. OTP verification activates account.
3. User logs in.
4. If no org membership, frontend routes to `/onboarding`.
5. Organization creation:
   - creates `Organization`
   - creates `OrganizationMember(role=OWNER)`
6. Settings endpoint provides org profile fields including logo and industry.

---

## 11) Social Account Integration Flow

## Meta/Instagram

- Connect endpoint returns OAuth URL with HMAC-signed state payload.
- Callback verifies state signature and TTL.
- Exchanges short-lived token -> long-lived token.
- Upserts `SocialAccount(provider=meta)`.
- Syncs pages:
  - stores `MetaPage`
  - creates Meta page targets
  - discovers IG business account and creates Instagram target
- Async sync task also runs for eventual consistency.

## LinkedIn

- OAuth state stored in cache (TTL 10 min).
- Callback exchanges code, fetches profile (`userinfo`), fallback `id_token` decode.
- Upserts `SocialAccount(provider=linkedin)`.
- Creates linked publishing target (user-level).
- On publish API 401/403 or invalid token:
  - account marked inactive
  - targets deactivated
  - reconnect required

## YouTube

- OAuth with offline access + consent prompt.
- Callback stores access + refresh token and channel metadata.
- Creates YouTube publishing target.
- Token refresh runs both:
  - just-in-time inside publisher
  - periodic Celery refresh tasks

## Disconnect behavior

- Deactivates targets.
- Clears sensitive token fields.
- Marks account inactive.
- Removes provider child objects where applicable.

---

## 12) Scheduling and Publishing - Deep Technical Explanation

This section answers: **How the system knows which account to post to**.

## Scheduling data contract (frontend -> backend)

When creating a schedule, frontend sends:

- `caption`
- `scheduled_time`
- `publishing_target_ids[]`
- media fields keyed as `image_<target_id>_*` / `video_<target_id>_*`

## Backend target validation

`PostCreateSerializer` validates:

- each `publishing_target_id` belongs to current organization
- target is active
- scheduled time is future

So tenant-cross posting is blocked at validation time.

## Persisted scheduling objects

For each target ID:

1. create one `PostPlatform(post=<post>, publishing_target=<target>)`
2. attach media rows (`PostPlatformMedia`)
3. set initial `publish_status=pending`

## Provider routing at publish time

Worker task `publish_platform(platform_id)`:

1. locks row (`select_for_update`) for idempotency
2. ensures not already success
3. validates token freshness
4. resolves provider from `post_platform.publishing_target.provider`
5. routes to publisher adapter:
   - InstagramPublisher
   - LinkedInPublisher
   - YouTubePublisher
6. stores external post ID and status

This is how account selection works:

- `PostPlatform -> PublishingTarget -> SocialAccount -> tokens`.

No guessing or implicit mapping is used; routing is explicit via FK chain.

## Publish orchestration schedule

Celery beat triggers `dispatch_scheduled_platforms` every minute:

- finds due `pending` jobs
- also recovers stale `processing` > 10 min
- batches and dispatches `publish_platform` tasks

## Retry/failure policy

- Up to 3 retries with exponential backoff.
- On final failure, mark `FAILED` with reason.
- Token-expired failures mark immediate failure.

## Recycle bin lifecycle

- soft delete via `is_deleted` + `deleted_at`
- restore supported
- permanent delete endpoint
- automated purge task after 30 days

---

## 13) Analytics Pipeline - Deep Technical Explanation

## Data ingestion

Task `sync_post_analytics` runs every 30 min:

- scans successfully published post-platform rows
- picks provider fetcher from registry
- fetches remote metrics
- saves current row + snapshot (deduped if unchanged within 15 min)

## Provider fetchers

- Instagram: Meta Graph media metadata + insights (`views/reach/saved`)
- LinkedIn: social actions endpoint (`likes/comments`)
- YouTube: Data API + Analytics API (`views`, `watch_time`, traffic sources)

## Read APIs

Aggregated endpoints (overview, engagement chart/distribution, recent posts, full dashboard) use:

- org-scoped query filters
- Redis cache (short TTL for near-real-time feel)
- fallback strategy in full dashboard to avoid blank cards if live table sparse

## Why both current + snapshot tables exist

- Current table gives fast latest-value reads.
- Snapshot table enables trends/charts over time and fallback reconstruction.

---

## 14) News Pipeline

## Purpose

- Show industry-specific external content on dashboard/feed.

## Flow

1. Celery beat triggers `ingest_all_news` every 30 min.
2. Task fan-outs per industry.
3. RSS ingestion service fetches/parses feeds and stores deduplicated articles.
4. API `/api/v1/news/industry/` returns org industry feed (paginated).

---

## 15) AI Content Generation

Endpoint: `/api/v1/ai/generate-post/`

- Validates request payload (`history`, `platform`, `tone`, `audience`)
- Uses `PostService` + `AIService` (Groq model currently)
- Retries once on LLM errors
- Supports JSON extraction path from model response

Why implemented:

- Reduce user effort for first draft generation and rewrites.

---

## 16) Audit and Admin

## Audit

- `AuditLog` is append-only (immutable by save guard).
- Captures actor, org, action, target model/id, IP, user-agent, metadata.
- Sensitive flows (org, posts, token refresh) log events.

## Platform admin

Prefix: `/api/v1/admin-panel/`

- overview
- users CRUD-lite
- organizations list/update/archive/restore
- social accounts list/update/disconnect
- posts list/update/archive/restore
- audit logs browsing

Authorization: authenticated + staff/superuser.

---

## 17) API Surface Map (by module)

## System

- `/health/`
- `/ready/`
- `/swagger/`
- `/redoc/`

## Auth (`/api/v1/auth/`)

- `register/`, `login/`, `me/`, `token/refresh/`, `logout/`
- OTP and password-reset endpoints

## Organizations (`/api/v1/organizations/`)

- create/delete/settings
- member list/remove/change-role/transfer-ownership

## Social (`/api/v1/social/`)

- account list
- connect/callback per provider
- publishing-targets list
- account refresh/disconnect

## Posts (`/api/v1/posts/`)

- list, create, detail, edit
- delete/restore/permanent-delete
- recycle-bin list/empty

## Analytics (`/api/v1/analytics/`)

- dashboard/full
- overview, engagement-chart, distribution, recent-posts
- provider-specific groups for Instagram/LinkedIn/YouTube

## News (`/api/v1/news/industry/`)

## Audit (`/api/v1/audit/logs/`)

## AI (`/api/v1/ai/generate-post/`)

## Platform admin (`/api/v1/admin-panel/*`)

---

## 18) Observability and Performance Tooling

- Prometheus middleware integrated into URL config root.
- Request timing middleware adds:
  - `Server-Timing`
  - `X-Response-Time-ms`
- Slow requests >= 1000ms logged with path/method/status/duration.
- Sentry can be enabled with `SENTRY_DSN`.
- Flower available for Celery queue visibility.

---

## 19) Data Security and Privacy Posture

## What is protected

- User passwords: hashed (Django auth).
- Social provider credentials: encrypted fields.
- Refresh tokens: HttpOnly secure cookies.
- Tenant boundaries: org-level filtering + context mixin.

## Current security controls

- JWT + rotating refresh tokens + blacklist
- OTP verification + lock/cooldown controls
- DRF throttling:
  - anon/user/global
  - login/otp scopes
- CSRF/CORS controls
- audit logs for sensitive actions

## High-priority operational caution

- If `.env` with real secrets is present in workspace/commits, rotate keys immediately and keep secrets out of VCS.

---

## 20) Why Common Issues Happen (Root-Cause Guide)

## A) Unauthorized on login page / auto logout / refresh failures

Common causes in this architecture:

- Refresh cookie not sent due domain/samesite/secure mismatch.
- Stale frontend bundle still running old auth logic.
- Refresh token expired/blacklisted.
- User became inactive (`is_active=False`) and refresh now correctly fails.
- Frontend calls protected endpoints before auth bootstrap settles.

What code already does:

- public-route bootstrap guard in `AuthContext`
- refresh dedupe and controlled failure handling in `api.js`
- refresh endpoint returns user payload and clears on invalid conditions

## B) “Checking session…” for long time / slow endpoints

Common causes:

- high backend latency (DB, Redis, provider API)
- worker saturation (publish/analytics jobs)
- repeated heavy endpoints on load
- cold cache (first hit slower)
- proxy/container resource limits

Existing support:

- slow request logging in middleware
- per-endpoint cache in analytics/news
- async queues for publish + sync jobs

---

## 21) Configuration and Environment Variables

## Core app

- `SECRET_KEY`, `DEBUG`
- `ALLOWED_HOSTS`
- `FRONTEND_ORIGIN`, CORS/CSRF lists

## Cookies/auth

- `AUTH_REFRESH_COOKIE_NAME`
- `AUTH_REFRESH_COOKIE_DOMAIN`
- `AUTH_REFRESH_COOKIE_PATH`
- `AUTH_REFRESH_COOKIE_SECURE`
- `AUTH_REFRESH_COOKIE_SAMESITE`
- `REMEMBER_ME_REFRESH_TOKEN_DAYS`

## DB/cache/queue

- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- `REDIS_URL`, `REDIS_CACHE_URL`
- `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`

## Cloud/storage

- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `AWS_STORAGE_BUCKET_NAME`, `AWS_S3_REGION_NAME`

## Provider OAuth

- Meta: `META_APP_ID`, `META_APP_SECRET`, `META_REDIRECT_URI`, `META_STATE_SECRET`
- LinkedIn: `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_REDIRECT_URI`
- Google/YouTube: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`

## Email/AI/monitoring

- `EMAIL_HOST_USER`, `EMAIL_HOST_PASSWORD`
- `GROQ_API_KEY`, `OPENAI_API_KEY`
- `SENTRY_DSN`
- `FIELD_ENCRYPTION_KEY`

Frontend:

- `VITE_API_BASE`

---

## 22) Frontend Route Map

## Public routes

- `/`
- `/login`
- `/register`
- `/verify-otp`
- `/forgot-password`
- `/reset-password`
- `/terms`
- `/privacy`

## Protected app routes

- `/overview`
- `/accounts`
- `/posts`
- `/schedule`
- `/analytics`
- `/audit`
- `/recycle-bin`
- `/feeds`
- `/settings`
- `/admin-panel` (admin-only)

---

## 23) Development and Deployment

## Local/Docker quick start

1. Set `.env`.
2. Run: `docker compose up --build`
3. API behind Nginx on ports `80/443` (or mapped local setup).

## Nginx behavior

- Redirect HTTP->HTTPS
- Proxy app requests to `web:8000`
- Serve static from `/app/staticfiles`
- Redirect media path to S3 bucket URL

## Notes

- Backend Dockerfile installs from `requirements.txt`.
- Compose mounts backend code into container for live code visibility.

---

## 24) Known Gaps / Technical Debt

- Some frontend/mobile pages still under iterative responsiveness improvements.
- Provider analytics coverage varies by provider permission scope.
- LinkedIn analytics is constrained by platform permissions and endpoint behavior.
- Additional CI/CD and automated test coverage documentation can be expanded.

---

## 25) Practical “How To” Playbooks

## A) Connect account then schedule

1. Connect provider in `/accounts`.
2. Ensure publishing targets exist (`/social/publishing-targets/`).
3. In `/schedule`, pick date/time and target.
4. Submit form with `publishing_target_ids` + media.
5. Celery dispatches when due.

## B) Understand why a post failed

1. Check `PostPlatform.publish_status` and `failure_reason`.
2. Verify account token expiration and active flags.
3. Check worker logs for provider response payload.

## C) Diagnose auth loop

1. Confirm refresh cookie exists for `api` domain/path.
2. Confirm `AUTH_REFRESH_COOKIE_*` and CORS settings match deployment domains.
3. Hard-refresh frontend bundle after deploy.
4. Verify refresh endpoint response status and payload.

---

## 26) Suggested Notion Structure (Copy/Paste Layout)

Create these top-level Notion pages:

1. Product Overview
2. System Architecture
3. Security & Session Design
4. Backend Modules
5. Frontend Modules
6. Scheduling & Publishing Internals
7. Analytics Pipeline
8. Runbooks & Troubleshooting
9. Deployment & Environments
10. API Reference

Each section in this markdown maps directly to one of those pages.

---

## 27) Source of Truth

This document is generated from the current repository code and configs, especially:

- `mfp_backend/config/settings.py`
- `mfp_backend/config/urls.py`
- `mfp_backend/config/celery.py`
- `mfp_backend/apps/*`
- `mfp_frontend/src/*`
- `docker-compose.yml`

When behavior changes, update this file immediately to keep docs accurate.

