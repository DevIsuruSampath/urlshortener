# PaidLink — Monetized URL Shortener

Single-admin URL shortener with scroll-based ad interstitials.

## Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript
- **Backend:** FastAPI + SQLAlchemy + Alembic
- **Database:** PostgreSQL
- **Cache:** Redis

## Architecture

| Domain | App | Port | Purpose |
|--------|-----|------|---------|
| `example.com` | `apps/web` | 3000 | Landing Page |
| `admin.example.com` | `apps/web` | 3000 | Admin Dashboard |
| `adsexample.com` | `apps/web` | 3000 | ScrollWall Ad Pages + Verify |
| `api.example.com` | `apps/api` | 8000 | API Endpoints |
| `exa.com` | `apps/api` | 8000 | Short Link Redirects |

**2 apps, 2 ports, 5 domains.**

## How It Works

```
Admin creates link → https://exa.com/AbCd123

User clicks link:
  exa.com/AbCd123
    → adsexample.com/step/1?session_id=UUID  (scroll + ads)
    → adsexample.com/step/2?session_id=UUID  (scroll + ads)
    → adsexample.com/step/3?session_id=UUID  (scroll + ads)
    → adsexample.com/verify?session_id=UUID  (cyber animation)
    → google.com ✅
```

### User Flow Detail

1. **Click** → `exa.com/AbCd123` hits `apps/api` `GET /{code}`
2. **Session** → API creates `ClickSession`, redirects to `adsexample.com/step/1`
3. **ScrollWall** → User must scroll 90% to unlock "Continue" button
4. **Step Complete** → Frontend calls `POST /visitor/step-complete` (anti-skip validation)
5. **Repeat** → Steps 2 and 3 with more ads
6. **Verify** → Cyber terminal animation, calls `GET /visitor/verify/{session_id}`
7. **Redirect** → 3-second countdown → original URL

### Anti-Fraud

- Sequential step validation (no skipping)
- Minimum wait time per step (8s first, 3s subsequent)
- IP + User-Agent deduplication (24h window)
- Bot/suspicious UA detection
- Rate limiting on all endpoints

## Creating Links (3 Methods)

### 1. Admin Dashboard
Create from UI at `admin.example.com/admin/links`:
- Enter destination URL → Click "Quick Create"
- Returns: `https://exa.com/AbCd123`
- Manage: Edit, Delete, Pause, Block from Actions menu

### 2. Public API (GET)
```
GET https://api.example.com/api?api=YOUR_TOKEN&url=https://google.com&alias=mylink
```
```json
{ "status": "success", "shortenedUrl": "https://exa.com/mylink" }
```

### 3. Public API (POST)
```bash
curl -X POST https://api.example.com/api \
  -H "Content-Type: application/json" \
  -d '{"api": "YOUR_TOKEN", "url": "https://google.com", "alias": "mylink"}'
```

**Parameters:**
| Param | Required | Description |
|-------|----------|-------------|
| `api` | ✅ | API token |
| `url` | ✅ | Destination URL (http/https) |
| `alias` | ❌ | Custom alias (4-20 chars: `A-Za-z0-9_-`) |
| `format` | ❌ | `json` (default) or `text` |

## API Endpoints

### Visitor Flow (Public — no auth)

| Action | Method | Endpoint |
|--------|--------|----------|
| Start session | `GET` | `/{code}` |
| Complete step | `POST` | `/visitor/step-complete` |
| Verify & get URL | `GET` | `/visitor/verify/{session_id}` |

### Link Management (Admin auth required)

| Action | Method | Endpoint |
|--------|--------|----------|
| Create | `POST` | `/admin/links` |
| List | `GET` | `/admin/links` |
| Edit | `PATCH` | `/admin/links/{id}` |
| Delete | `DELETE` | `/admin/links/{id}` |
| Pause/Resume | `PATCH` | `/admin/links/{id}/toggle` |
| Block/Unblock | `PATCH` | `/admin/links/{id}/block` |

### Settings (Admin auth required)

| Setting | Method | Endpoint |
|---------|--------|----------|
| Change Password | `POST` | `/admin/auth/change-password` |
| Flow Defaults | `GET/PUT` | `/admin/settings/flow` |
| Anti-Abuse | `GET/PUT` | `/admin/settings/anti-abuse` |
| Monetization | `GET/PUT` | `/admin/settings/monetization` |

### Developer API Token

| Action | Method | Endpoint |
|--------|--------|----------|
| View (masked) | `GET` | `/admin/auth/developer-token` |
| Regenerate | `POST` | `/admin/auth/developer-token/regenerate` |
| Finalize rotation | `POST` | `/admin/auth/developer-token/finalize` |

### Admin Auth

| Action | Method | Endpoint |
|--------|--------|----------|
| Status | `GET` | `/admin/auth/status` |
| Setup (first run) | `POST` | `/admin/auth/setup` |
| Login | `POST` | `/admin/auth/login` |
| Logout | `POST` | `/admin/auth/logout` |
| Security Events | `GET` | `/admin/security-events` |

## Project Structure

```
urlshortener/
├── apps/
│   ├── api/                    ⚙️ Backend (FastAPI :8000)
│   │   ├── app/
│   │   │   ├── core/           # Config, auth, rate limiting, Redis
│   │   │   ├── db/             # Models, migrations (6 total)
│   │   │   ├── routers/
│   │   │   │   ├── redirect.py     # GET /{code} → adsexample.com
│   │   │   │   ├── visitor.py      # step-complete + verify
│   │   │   │   ├── public_api.py   # GET/POST /api
│   │   │   │   ├── flow.py         # Legacy flow (backwards compat)
│   │   │   │   └── admin/          # auth, links, stats, settings
│   │   │   ├── services/       # Business logic
│   │   │   ├── schemas/        # Pydantic models
│   │   │   └── main.py
│   │   ├── Dockerfile
│   │   └── .env.example
│   │
│   └── web/                    🎨 Frontend (Next.js :3000)
│       └── src/
│           ├── app/
│           │   ├── (public)/       # Landing pages
│           │   ├── admin/          # Dashboard, links, settings
│           │   ├── step/[step]/    # ScrollWall ad pages
│           │   ├── verify/         # Verification animation
│           │   └── [code]/         # Short code forwarder
│           ├── components/
│           │   ├── ads/            # ScrollWall
│           │   ├── ui/             # Design system
│           │   ├── layout/         # Sidebar, TopBar
│           │   └── auth/           # Guards, forms
│           ├── lib/                # API client, env config
│           └── middleware.ts       # Domain routing
│
├── packages/shared/            📦 Shared config
│   └── tiers.json
├── infra/
│   └── docker-compose.yml      🐳 Local dev (Postgres + Redis)
├── Dockerfile                  🐳 Production (unified)
└── example.env
```

## Run Locally

```bash
cp example.env .env
docker compose -f infra/docker-compose.yml up --build
```

- Web: http://localhost:3000
- API: http://localhost:8000

## Deploy (Dokploy)

Deploy 2 services:

**Service 1 — Web (Next.js)**
```env
NEXT_PUBLIC_API_BASE=https://api.example.com
NEXT_PUBLIC_APP_DOMAIN=example.com
NEXT_PUBLIC_ADMIN_DOMAIN=admin.example.com
NEXT_PUBLIC_ADS_DOMAIN=adsexample.com
```
→ Domains: `example.com`, `admin.example.com`, `adsexample.com`

**Service 2 — API (FastAPI)**
→ See `apps/api/.env.example` for full config
→ Domains: `api.example.com`, `exa.com`

## Middleware (Domain Routing)

`apps/web/src/middleware.ts` handles routing by hostname:

| Domain | Behavior |
|--------|----------|
| `admin.example.com` | `/` → redirect to `/admin/stats` |
| `adsexample.com` | Allow `/step/*`, `/verify`; block everything else |
| `example.com` | Block `/step/*`, `/verify`; allow everything else |

## Admin Auth

- Setup is one-time only (`POST /admin/auth/setup`)
- Optional bootstrap token (`ADMIN_SETUP_TOKEN`)
- HTTP-only session cookie (`COOKIE_DOMAIN=.example.com`)
- Recovery codes issued at setup (10 codes, shown once)
- Password reset via CLI only: `python -m app.cli reset-admin-password`
- Security events logged: login, setup, blocks, settings changes

## Cookie Security

For cross-subdomain auth (`example.com` ↔ `api.example.com`):
```env
COOKIE_DOMAIN=.example.com
COOKIE_SAMESITE=lax
COOKIE_SECURE=true
COOKIE_HTTPONLY=true
```
