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
- FastAPI on `127.0.0.1:8000`
- Next.js on `127.0.0.1:3000`
- Nginx on `:80` (routes `/`, `/api`, and `/{code}`)

Build/run:
```bash
docker build -t paidlink-shortener .
docker run --rm -p 80:80 --env-file .env paidlink-shortener
```
