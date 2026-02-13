# paidlink-shortener

Monorepo scaffold for a paid-link shortener platform.

## Structure
- `apps/web`: Next.js App Router frontend (landing + auth + dashboard + interstitial flow)
- `apps/api`: FastAPI backend (auth, links, flow tracking, stats)
- `packages/shared`: shared config/constants
- `infra`: docker + nginx + helper scripts

## Quick start
1. Copy env: `cp .env.example .env`
2. Start stack: `make dev`
3. Open web: `http://localhost:3000`
4. API docs: `http://localhost:8000/docs`
