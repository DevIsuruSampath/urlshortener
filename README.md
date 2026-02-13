# Paid Link Shortener (GPLinks-style)

Monorepo for a paid-link URL shortener with step-based interstitial flow.

## Tech
- Frontend: Next.js App Router + TypeScript
- Backend: FastAPI + SQLAlchemy + Alembic
- Cache/Rate Limit: Redis
- DB: PostgreSQL
- Reverse proxy: Nginx

## Run locally
```bash
cp .env.example .env
docker compose -f infra/docker-compose.yml up --build
```

Open: <http://localhost>

- `/` -> Next.js
- `/api/*` -> FastAPI
- `/{code}` -> FastAPI redirect hot path

## Monorepo
- `apps/web` – frontend
- `apps/api` – backend
- `packages/shared/tiers.json` – tier/step rules
- `infra` – docker-compose + nginx

## Single-container Dockerfile (optional)
A root `Dockerfile` is included for platforms that require one container.
It runs:
- FastAPI on `0.0.0.0:8000`
- Next.js on `0.0.0.0:3000`
- Nginx on `:80` (routes `/`, `/api`, and `/{code}`)

Build/run:
```bash
docker build -t paidlink-shortener .
docker run --rm -p 80:80 --env-file .env paidlink-shortener
```

## Split deployment (without nginx)
Deploy two services:
1. `apps/web` (port `3000`) -> `example.com`
2. `apps/api` (port `8000`) -> `api.example.com`

Set web env:
```env
NEXT_PUBLIC_API_BASE=https://api.example.com
API_INTERNAL_BASE_URL=https://api.example.com
```

Set API env:
```env
PUBLIC_WEB_BASE_URL=https://example.com
PUBLIC_API_BASE_URL=https://api.example.com
```

A Next route handler (`apps/web/src/app/[code]/route.ts`) forwards short-code hits from `example.com/{code}` to API, so you can run without nginx and still keep main-domain short links.
