# Paid Link Shortener (GPLinks-style)

Monorepo for a paid-link URL shortener with step-based interstitial flow.

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
DATABASE_AUTO_CREATE=true
RUN_MIGRATIONS=true
```

A Next route handler (`apps/web/src/app/[code]/route.ts`) forwards short-code hits from `urlshortener.../{code}` to API, so short links work on main domain without nginx.
It auto-handles local docker-compose (`localhost` -> internal `api` service) to keep env setup minimal.
