# Paid Link Shortener (GPLinks-style)

Monetized URL shortener with step-based interstitial ad flow.

Current mode: **single-user admin** (no public user registration flow).

## Tech
- Frontend: Next.js App Router + TypeScript
- Backend: FastAPI + SQLAlchemy + Alembic
- Cache/Rate Limit: Redis
- DB: PostgreSQL

## Multi-Domain Architecture

| Domain | Service | Purpose |
|--------|---------|---------|
| `example.com` | Frontend (3000) | Landing Page, Login |
| `admin.example.com` | Frontend (3000) | Admin Dashboard |
| `adsexample.com` | Frontend (3000) | Ad/Interstitial Pages |
| `api.example.com` | Backend (8000) | API Endpoints |
| `exa.com` | Backend (8000) | Short Link Redirects |

## How It Works

```
Admin creates link → https://exa.com/AbCd123
User clicks link   → exa.com/AbCd123
                   → Redirects to adsexample.com/l?... (ads + timer)
                   → User waits → Captcha → Continue
                   → Redirects to original URL (google.com)
```

## Creating Links (3 Methods)

### 1. Admin Dashboard
Create links from the UI at `admin.example.com/admin/links`:
- Enter destination URL → Click "Quick Create"
- Returns: `https://exa.com/AbCd123`
- Manage: Edit, Delete, Pause, Block from the Actions menu

### 2. Public API (GET)
```
GET https://api.example.com/api?api=YOUR_TOKEN&url=https://google.com&alias=mylink
```
Response (JSON):
```json
{ "status": "success", "shortenedUrl": "https://exa.com/mylink" }
```
Response (Text):
```
GET https://api.example.com/api?api=YOUR_TOKEN&url=https://google.com&format=text
→ https://exa.com/AbCd123
```

### 3. Public API (POST)
```bash
curl -X POST https://api.example.com/api \
  -H "Content-Type: application/json" \
  -d '{"api": "YOUR_TOKEN", "url": "https://google.com", "alias": "mylink"}'
```
Response:
```json
{ "status": "success", "shortenedUrl": "https://exa.com/mylink" }
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `api` | ✅ | Your API token |
| `url` | ✅ | Destination URL (http/https only) |
| `alias` | ❌ | Custom alias (4-20 chars: `A-Z`, `a-z`, `0-9`, `_`, `-`) |
| `format` | ❌ | `json` (default) or `text` |

## Link Management (Admin)

All endpoints require admin session cookie.

| Action | Method | Endpoint |
|--------|--------|----------|
| Create | `POST` | `/admin/links` |
| List | `GET` | `/admin/links` |
| Edit | `PATCH` | `/admin/links/{id}` |
| Delete | `DELETE` | `/admin/links/{id}` |
| Pause/Resume | `PATCH` | `/admin/links/{id}/toggle` |
| Block/Unblock | `PATCH` | `/admin/links/{id}/block` |

## Settings (Admin)

| Setting | Method | Endpoint |
|---------|--------|----------|
| Change Password | `POST` | `/admin/auth/change-password` |
| Flow Defaults | `GET/PUT` | `/admin/settings/flow` |
| Anti-Abuse | `GET/PUT` | `/admin/settings/anti-abuse` |
| Monetization | `GET/PUT` | `/admin/settings/monetization` |

## Run locally (no nginx)
```bash
cp example.env .env
docker compose -f infra/docker-compose.yml up --build
```

Open:
- Web: <http://localhost:3000>
- API: <http://localhost:8000>

## Monorepo
- `apps/web` – frontend
- `apps/api` – backend
- `packages/shared/tiers.json` – tier/step rules
- `infra` – docker-compose + helper scripts

## Split deployment (recommended)
Deploy two services:
1. `apps/web` (port `3000`) -> `urlshortener.devisuru.ggff.net`
2. `apps/api` (port `8000`) -> `api.urlshortener.devisuru.ggff.net`

You can use either:
- service-specific Dockerfiles (`apps/web/Dockerfile`, `apps/api/Dockerfile`), or
- root `Dockerfile` with `RUN_SERVICE` env (`web` or `api`).

Set web env:
```env
NEXT_PUBLIC_API_BASE=https://api.urlshortener.devisuru.ggff.net
```

Set API env:
```env
PUBLIC_WEB_BASE_URL=https://urlshortener.devisuru.ggff.net
PUBLIC_API_BASE_URL=https://api.urlshortener.devisuru.ggff.net
CORS_ORIGINS=https://urlshortener.devisuru.ggff.net
ADMIN_API_TOKENS=replace_token_1,replace_token_2
ADMIN_SETUP_TOKEN=replace_with_long_random_bootstrap_token
ADMIN_SESSION_COOKIE_NAME=paidlink_admin_session
COOKIE_SECURE=true
COOKIE_SAMESITE=none
COOKIE_HTTPONLY=true
FLOW_SIGNING_SECRET=replace_with_long_random_secret
ADMIN_JWT_SECRET=replace_with_long_random_secret
SESSION_TOKEN_EXPIRE_MINUTES=15
START_RATE_LIMIT_PER_MINUTE=120
STEP_RATE_LIMIT_PER_MINUTE=60
AUTH_RATE_LIMIT_PER_MINUTE=20
DEV_API_RATE_LIMIT_PER_MINUTE=60
ADMIN_SETUP_RATE_LIMIT_PER_MINUTE=5
ADMIN_LOGIN_RATE_LIMIT_PER_MINUTE=10
ADMIN_LOGIN_LOCKOUT_THRESHOLD=10
ADMIN_LOGIN_LOCKOUT_MINUTES=15
ADMIN_LOGIN_PROGRESSIVE_DELAY_MAX_SECONDS=2
REQUIRE_HTTPS_FOR_ADMIN_SETUP=true
DATABASE_AUTO_CREATE=false
RUN_MIGRATIONS=false
```

A Next route handler (`apps/web/src/app/[code]/route.ts`) forwards short-code hits from `urlshortener.../{code}` to API, so short links work on main domain without nginx.
It auto-handles local docker-compose (`localhost` -> internal `api` service) to keep env setup minimal.

App routes:
- Public pages: `(public)/*`
- `/admin/setup` (first-run bootstrap)
- `/admin/login` (single admin login)
- `/admin/*` (overview, links, stats, settings)
- `/login` (compat redirect -> `/admin/login`)
- `/l` (interstitial)
- `/{code}` (short-code forwarder)

API routing (clean split):
- Public: `GET /api`, `POST /api`, `GET /{code}`, `POST /flow/step-complete`, `GET /flow/go`
- Admin: `/admin/auth/*`, `/admin/links/*`, `/admin/stats/*`, `/admin/security-events/*`
  - bootstrap endpoints:
    - `GET /admin/auth/status` -> `{ "initialized": true|false }`
    - `POST /admin/auth/setup` (only when initialized=false)
      - requires setup token when `ADMIN_SETUP_TOKEN` is set (`?token=...` or `x-admin-setup-token` header)
      - body: `{ "email": "...", "password": "...", "confirm_password": "..." }`
      - response includes one-time recovery codes
  - login endpoint:
    - `POST /admin/auth/login`
      - body: `{ "email": "...", "password": "..." }` or `{ "email": "...", "recovery_code": "ABCD-EFGH-IJKL" }`
  - logout endpoint:
    - `POST /admin/auth/logout`
  - security events endpoint:
    - `GET /admin/security-events?limit=50` (admin auth required)
    - `POST /admin/security-events` for UI-originated events (`settings_changed`, `link_blocked`, `link_unblocked`)
  - developer token management:
    - `GET /admin/auth/developer-token` (masked only)
    - `POST /admin/auth/developer-token/regenerate` (returns new token once + keeps old tokens for rotation window)
    - `POST /admin/auth/developer-token/finalize` (removes old tokens, keeps newest)

Admin auth security rules:
- Setup endpoint is one-time (only when `initialized=false`)
- Optional setup lock token (`ADMIN_SETUP_TOKEN`) prevents public admin-claim during first deploy
- Setup endpoint has per-IP rate limit (default `5/min`) and can require HTTPS in production
- Login endpoint has per-IP rate limit (default `10/min`)
- Login lockout defaults to `10` failed attempts for `15` minutes (`ADMIN_LOGIN_LOCKOUT_THRESHOLD`, `ADMIN_LOGIN_LOCKOUT_MINUTES`)
- Progressive delay is applied after failed login attempts (up to `ADMIN_LOGIN_PROGRESSIVE_DELAY_MAX_SECONDS`, default `2s`)
- `/admin/links/*` and `/admin/stats/*` always require admin auth
- Admin auth uses HTTP-only session cookie for split deploy:
  - API sets cookie on `api.*` domain
  - Web sends requests with `credentials: include`
  - `CORS_ORIGINS` must include web origin and `allow_credentials=true` is enabled in API middleware
  - Recommended for cross-subdomain reliability: `COOKIE_SAMESITE=none` + `COOKIE_SECURE=true`
- Admin account is stored with secure password hash only (no plain password in DB):
  - `email`, `password_hash`, `created_at`, `updated_at`
- Admin credentials are not read from env; bootstrap + reset operate through DB (`/admin/setup` or CLI reset).
- Setup issues 10 one-time recovery codes (shown once, hashed in DB); login can use recovery code when password is unavailable.
- Security audit events are persisted and visible on `/admin/settings` (latest 50):
  - `admin_setup_completed`, `admin_login_success`, `admin_login_failed`, `admin_password_reset_cli`, `developer_api_token_used`, `link_blocked`, `link_unblocked`, `settings_changed`

Admin password reset (Dokploy-style):
- This is intentionally terminal-only (not exposed via web API).
- Run inside API container:
  - `python -m app.cli reset-admin-password`
  - or `./start.sh reset-admin-password`
- Output prints the new password to terminal.

GPLinks-style shortener API (`/api`):
- JSON (default):
  - `GET /api?api=TOKEN&url=https://example.com&alias=myalias`
- Text response:
  - `GET /api?api=TOKEN&url=https://example.com&alias=myalias&format=text`
- POST support (json or form):
  - `POST /api` with `api`, `url`, optional `alias`, optional `format=text|json`

Response formats:
- JSON (default)
  - Success: `{ "status": "success", "shortenedUrl": "..." }`
  - Error: `{ "status": "error", "message": "..." }`
- TEXT (`format=text`)
  - Success: short URL only (plain text)
  - Error: `400` with empty body (GPLinks-compatible)

Validation rules:
- `api` must match one active token (env `ADMIN_API_TOKENS` or rotated DB token set)
- `url` must be `http://` or `https://` and pass public URL safety checks (no localhost/private/internal targets)
- `alias` (optional) must be `4-20` chars (`A-Z`, `a-z`, `0-9`, `_`, `-`) and unique
- `format` (optional) must be `json` or `text`
- Developer API is rate-limited per IP (`DEV_API_RATE_LIMIT_PER_MINUTE`, default `60`)
