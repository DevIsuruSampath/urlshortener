# Paid Link Shortener (GPLinks-style)

Monorepo for a paid-link URL shortener with step-based interstitial flow.

Current mode: **single-user admin** (no public user registration flow).

## Tech
- Frontend: Next.js App Router + TypeScript
- Backend: FastAPI + SQLAlchemy + Alembic
- Cache/Rate Limit: Redis
- DB: PostgreSQL

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
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=replace_with_bcrypt_or_argon2_hash
ADMIN_SESSION_COOKIE_NAME=paidlink_admin_session
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
COOKIE_HTTPONLY=true
FLOW_SIGNING_SECRET=replace_with_long_random_secret
ADMIN_JWT_SECRET=replace_with_long_random_secret
SESSION_TOKEN_EXPIRE_MINUTES=15
START_RATE_LIMIT_PER_MINUTE=120
STEP_RATE_LIMIT_PER_MINUTE=60
AUTH_RATE_LIMIT_PER_MINUTE=20
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
- Admin: `/admin/auth/*`, `/admin/links/*`, `/admin/stats/*`
  - bootstrap endpoints: `GET /admin/auth/status`, `POST /admin/auth/setup`

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
- `api` must match one value in `ADMIN_API_TOKENS`
- `url` must be `http://` or `https://` and pass public URL safety checks (no localhost/private/internal targets)
- `alias` (optional) must be `4-20` chars (`A-Z`, `a-z`, `0-9`, `_`, `-`) and unique
- `format` (optional) must be `json` or `text`
