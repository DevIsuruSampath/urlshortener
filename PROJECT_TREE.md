# URL Shortener - Complete Project Structure

## 📁 Project Tree

```
urlshortener/
├── apps/
│   ├── api/                          # FastAPI Backend
│   │   ├── app/
│   │   │   ├── __init__.py
│   │   │   ├── main.py               # FastAPI app entry point
│   │   │   ├── init.py               # Application initialization
│   │   │   ├── cli.py                # CLI commands
│   │   │   │
│   │   │   ├── core/                 # Core application logic
│   │   │   │   ├── config.py         # Configuration management
│   │   │   │   ├── security.py       # Authentication & security
│   │   │   │   ├── bootstrap.py      # Admin bootstrap
│   │   │   │   ├── rate_limit.py     # Rate limiting
│   │   │   │   └── redis_client.py
│   │   │   │
│   │   │   ├── db/                   # Database layer
│   │   │   │   ├── base.py           # SQLAlchemy base
│   │   │   │   ├── session.py        # Database session
│   │   │   │   ├── bootstrap.py      # DB initialization
│   │   │   │   ├── migrations/       # Alembic migrations
│   │   │   │   │   ├── env.py
│   │   │   │   │   └── versions/
│   │   │   │   └── models/          # SQLAlchemy models
│   │   │   │       ├── link.py
│   │   │   │       ├── user.py
│   │   │   │       ├── click_session.py
│   │   │   │       ├── completion_dedupe.py
│   │   │   │       ├── payout.py
│   │   │   │       ├── security_event.py
│   │   │   │       ├── admin_recovery_code.py
│   │   │   │       └── app_setting.py
│   │   │   │
│   │   │   ├── routers/              # API endpoints
│   │   │   │   ├── admin/            # Admin routes (protected)
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   ├── auth.py       # POST /admin/auth/login, logout, change-password
│   │   │   │   │   ├── links.py      # GET/POST/DELETE /admin/links
│   │   │   │   │   ├── stats.py      # GET /admin/stats/*
│   │   │   │   │   ├── settings.py   # GET /admin/settings/*
│   │   │   │   │   └── security_events.py # GET /admin/security-events
│   │   │   │   │
│   │   │   │   ├── public_api.py      # GET/POST /api (public API)
│   │   │   │   ├── redirect.py       # GET /{code} (short URL redirect)
│   │   │   │   └── visitor.py        # POST /visitor/step-complete
│   │   │   │
│   │   │   ├── schemas/              # Pydantic schemas
│   │   │   │   ├── admin_auth.py
│   │   │   │   ├── link.py
│   │   │   │   └── security_event.py
│   │   │   │
│   │   │   ├── services/             # Business logic
│   │   │   │   ├── link_service.py
│   │   │   │   ├── admin_user_service.py
│   │   │   │   ├── admin_api_token_service.py
│   │   │   │   ├── admin_recovery_service.py
│   │   │   │   ├── fraud_service.py
│   │   │   │   ├── security_event_service.py
│   │   │   │   └── url_safety.py
│   │   │   │
│   │   │   └── tests/                # Tests
│   │   │       └── test_health.py
│   │   │
│   │   ├── requirements.txt          # Python dependencies
│   │   └── Dockerfile
│   │
│   └── web/                         # Next.js Frontend
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── layout.tsx        # Root layout
│       │   │   ├── globals.css       # Global styles
│       │   │   ├── middleware.ts     # Domain routing middleware
│       │   │   │
│       │   │   ├── admin/            # Admin Dashboard Routes
│       │   │   │   ├── layout.tsx    # Admin layout wrapper
│       │   │   │   ├── page.tsx      # GET / (Dashboard Overview)
│       │   │   │   │
│       │   │   │   ├── links/        # Links Management
│       │   │   │   │   ├── page.tsx  # GET /links (List all links)
│       │   │   │   │   └── new/      # Create New Link
│       │   │   │   │       └── page.tsx # GET /links/new
│       │   │   │   │
│       │   │   │   ├── profile/      # User Profile
│       │   │   │   │   └── page.tsx  # GET /profile
│       │   │   │   │
│       │   │   │   ├── stats/        # Analytics
│       │   │   │   │   └── page.tsx  # GET /stats (Quality)
│       │   │   │   │
│       │   │   │   └── settings/     # Settings
│       │   │   │       └── page.tsx  # GET /settings
│       │   │   │
│       │   │   ├── (public)/         # Public Marketing Pages
│       │   │   │   ├── layout.tsx    # Public layout
│       │   │   │   ├── page.tsx      # GET / (Landing page)
│       │   │   │   ├── pricing/      # Pricing page
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── faq/          # FAQ page
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── contact/      # Contact page
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── terms/        # Terms page
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── privacy/      # Privacy page
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── cookie/       # Cookie policy
│       │   │   │   │   └── page.tsx
│       │   │   │   └── support/      # Support page
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   ├── login/            # Login Page
│       │   │   │   └── page.tsx      # GET /login
│       │   │   │
│       │   │   ├── step/[step]/       # Ad Flow Steps
│       │   │   │   └── page.tsx      # GET /step/1, /step/2, etc.
│       │   │   │
│       │   │   ├── verify/           # Verification Page
│       │   │   │   └── page.tsx      # GET /verify/{session_id}
│       │   │   │
│       │   │   ├── [code]/           # Short URL Redirect
│       │   │   │   └── route.ts      # Rewrite to API
│       │   │   │
│       │   │   └── api/             # Internal API Routes (proxies)
│       │   │       └── admin/
│       │   │           └── links/
│       │   │               └── route.ts # POST /api/admin/links
│       │   │
│       │   ├── components/           # React Components
│       │   │   ├── layout/           # Layout Components
│       │   │   │   ├── AppShell.tsx
│       │   │   │   ├── Sidebar.tsx
│       │   │   │   ├── TopBar.tsx
│       │   │   │   ├── UserMenu.tsx
│       │   │   │   ├── dashboard-nav-items.ts
│       │   │   │   └── nav-utils.ts
│       │   │   │
│       │   │   ├── auth/             # Auth Components
│       │   │   │   ├── AdminGuard.tsx
│       │   │   │   └── AuthForm.tsx
│       │   │   │
│       │   │   ├── ui/               # UI Components
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Select.tsx
│       │   │   │   ├── Badge.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   ├── Drawer.tsx
│       │   │   │   ├── DropdownMenu.tsx
│       │   │   │   ├── Toast.tsx
│       │   │   │   ├── StatCard.tsx
│       │   │   │   ├── TrafficChart.tsx
│       │   │   │   ├── CopyButton.tsx
│       │   │   │   ├── ConfirmDialog.tsx
│       │   │   │   ├── Skeleton.tsx
│       │   │   │   ├── Grid.tsx
│       │   │   │   ├── Stack.tsx
│       │   │   │   ├── ScrollToTop.tsx
│       │   │   │   ├── FormInput.tsx
│       │   │   │   ├── FormSubmitButton.tsx
│       │   │   │   └── QueryProvider.tsx
│       │   │   │
│       │   │   ├── data/             # Data Components
│       │   │   │   ├── DataTable.tsx
│       │   │   │   ├── EmptyState.tsx
│       │   │   │   └── Pagination.tsx
│       │   │   │
│       │   │   ├── ads/              # Ad Components
│       │   │   │   └── ScrollWall.tsx
│       │   │   │
│       │   │   ├── public/           # Public Components
│       │   │   │   ├── SiteHeader.tsx
│       │   │   │   └── SiteFooter.tsx
│       │   │   │
│       │   │   └── forms/            # Form Components
│       │   │       ├── LoginForm.tsx
│       │   │       ├── SetupForm.tsx
│       │   │       └── ChangePasswordForm.tsx
│       │   │
│       │   ├── lib/                  # Utilities
│       │   │   ├── api.ts            # API client
│       │   │   ├── api-hooks.ts      # React Query hooks
│       │   │   ├── validation.ts     # Zod schemas
│       │   │   └── env.ts           # Environment helpers
│       │   │
│       │   └── styles/              # Styles
│       │       └── globals.css
│       │
│       ├── public/                   # Static assets
│       ├── package.json
│       ├── next.config.js
│       ├── tsconfig.json
│       └── Dockerfile
│
├── infra/                          # Infrastructure
│   ├── docker-compose.yml
│   └── scripts/
│
├── packages/                       # Shared Packages
│   └── shared/
│       ├── constants.ts
│       ├── tiers.json               # Pricing tiers
│       └── README.md
│
├── .gitignore
├── Dockerfile                      # Root Dockerfile (orchestration)
├── example.env                     # Environment variables example
├── Makefile
├── PROJECT_STRUCTURE.md
└── README.md
```

---

## 🌐 Domain-Based Routing (middleware.ts)

### 1. `example.com` - Main Public Site
```
GET  /                     → Landing page (Maintenance)
GET  /pricing              → Pricing page
GET  /faq                  → FAQ page
GET  /contact              → Contact page
GET  /terms                → Terms page
GET  /privacy              → Privacy page
GET  /cookie               → Cookie policy
GET  /support              → Support page
GET  /login                → Redirect to admin.example.com/login
GET  /admin/*              → Redirect to admin.example.com
GET  /step/*              → Redirect to home (blocked)
GET  /verify/*             → Redirect to home (blocked)
POST /api/*               → Proxy to backend API
```

### 2. `admin.example.com` - Admin Dashboard
```
GET  /                     → Dashboard Overview (rewritten to /admin)
GET  /login                → Login page
GET  /links                → List all links (rewritten to /admin/links)
GET  /links/new            → Create new link (rewritten to /admin/links/new)
GET  /profile              → User profile (rewritten to /admin/profile)
GET  /stats                → Analytics (rewritten to /admin/stats)
GET  /settings             → Settings (rewritten to /admin/settings)
GET  /register             → Redirect to /login (disabled)
POST /api/*               → Proxy to backend API
```

### 3. `adsexample.com` - Ad Flow (ScrollWall)
```
GET  /step/1               → Ad step 1
GET  /step/2               → Ad step 2
GET  /step/3               → Ad step 3
...
GET  /_next/*              → Next.js assets
POST /api/*               → Proxy to backend API
GET  /*                   → Redirect to example.com
```

### 4. `exa.com` - Short Links
```
GET  /{code}               → Rewrite to API for redirect
GET  /verify/{session_id}   → Verification page
GET  /_next/*              → Next.js assets
GET  /*                   → Rewrite to API
```

---

## 🔌 API Routers (FastAPI)

### Health
```
GET  /health                → Health check
GET  /api/health           → Health check
```

### Public API
```
GET  /api                   → Create short link (GET method)
POST /api                   → Create short link (POST method)

Query Parameters (GET):
  - api: API token (required)
  - url: Destination URL (required)
  - alias: Custom alias (optional)
  - format: Response format (json/text)

Body Parameters (POST):
  - api: API token (required)
  - url: Destination URL (required)
  - alias: Custom alias (optional)
  - format: Response format (json/text)
```

### Redirect
```
GET  /{code}               → Redirect to short URL destination
                            → Creates click session
                            → Redirects to adsexample.com/step/1
```

### Visitor Flow
```
POST /visitor/step-complete → Complete ad step
Body:
  - session_id: Session UUID
  - step_number: Current step number

GET  /visitor/verify/{session_id} → Get destination URL after completing all steps
```

### Admin Authentication
```
GET  /admin/auth/bootstrap-status → Check if admin initialized
GET  /admin/auth/status         → Check if admin initialized (alias)
POST /admin/auth/setup          → Initial admin setup
POST /admin/auth/login          → Login with email/password
POST /admin/auth/logout         → Logout
GET  /admin/auth/me            → Get current user info
POST /admin/auth/change-password → Change admin password

GET  /admin/auth/developer-token → Get API token info
POST /admin/auth/developer-token/regenerate → Regenerate API token
POST /admin/auth/developer-token/finalize → Finalize token rotation
```

### Admin Links
```
GET  /admin/links            → List all links (paginated)
POST /admin/links            → Create new link
GET  /admin/links/{id}       → Get link by ID
PUT  /admin/links/{id}       → Update link
DELETE /admin/links/{id}    → Delete link
```

### Admin Stats
```
GET  /admin/stats/overview    → Dashboard overview stats
GET  /admin/stats/quality    → Quality metrics
GET  /admin/stats/traffic     → Traffic analytics
```

### Admin Settings
```
GET  /admin/settings         → Get all settings
PUT  /admin/settings         → Update settings
POST /admin/settings/reset   → Reset to defaults
```

### Admin Security Events
```
GET  /admin/security-events  → List security events
```

---

## 🔧 Environment Variables (.env)

### Application
```env
APP_ENV=production                          # Environment: development, production
PROJECT_NAME="URL Shortener"               # App name for branding
```

### Domains (No Protocols)
```env
APP_DOMAIN=example.com                     # Main domain
ADMIN_DOMAIN=admin.example.com             # Admin dashboard domain
AUTH_DOMAIN=auth.example.com              # Auth portal (not used currently)
ADS_DOMAIN=adsexample.com                # Ad flow domain
SHORT_DOMAIN=exa.com                     # Short link domain
```

### API
```env
API_BASE=http://api.example.com           # Backend API URL
INTERNAL_API_HOST=http://api:8000        # Internal API for docker
CORS_ORIGINS=http://example.com,http://admin.example.com,http://adsexample.com,http://exa.com
```

### Database (PostgreSQL)
```env
POSTGRES_DB=paidlink
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql+psycopg://postgres:CHANGE_ME@postgres:5432/paidlink
DATABASE_AUTO_CREATE=true
RUN_MIGRATIONS=true
```

### Redis
```env
REDIS_URL=redis://redis:6379/0
```

### Security
```env
ADMIN_JWT_SECRET=CHANGE_ME_RANDOM_64_CHARS    # JWT secret for admin tokens
JWT_ALG=HS256                              # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=60                # Token expiration time
```

### Flow / Anti-fraud
```env
FIRST_STEP_MIN_SECONDS=8                      # Minimum time for first step
NEXT_STEP_MIN_SECONDS=3                       # Minimum time for subsequent steps
START_RATE_LIMIT_PER_MINUTE=120                # Rate limit: Start flow
STEP_RATE_LIMIT_PER_MINUTE=60                 # Rate limit: Complete step
AUTH_RATE_LIMIT_PER_MINUTE=20                  # Rate limit: Auth
DEV_API_RATE_LIMIT_PER_MINUTE=60               # Rate limit: Developer API
ADMIN_SETUP_RATE_LIMIT_PER_MINUTE=5            # Rate limit: Admin setup
ADMIN_LOGIN_RATE_LIMIT_PER_MINUTE=10           # Rate limit: Login
ADMIN_LOGIN_LOCKOUT_THRESHOLD=10               # Failed attempts before lockout
ADMIN_LOGIN_LOCKOUT_MINUTES=15                 # Lockout duration
ADMIN_LOGIN_PROGRESSIVE_DELAY_MAX_SECONDS=2    # Max delay for progressive delay
REQUIRE_HTTPS_FOR_ADMIN_SETUP=false          # Require HTTPS for setup
CACHE_TTL_SECONDS=300                         # Link cache TTL
```

### Admin Setup
```env
ADMIN_SETUP_TOKEN=CHANGE_ME_BOOTSTRAP_TOKEN    # Token for initial admin setup
```

### Cookies
```env
ADMIN_SESSION_COOKIE_NAME=paidlink_admin_session
COOKIE_SECURE=false                            # HTTPS only cookie
COOKIE_SAMESITE=lax                           # SameSite cookie policy
COOKIE_HTTPONLY=true                           # HTTPOnly cookie
COOKIE_DOMAIN=.example.com                     # Cookie domain (with dot for subdomains)
```

### Admin API Tokens
```env
ADMIN_API_TOKENS=CHANGE_ME_API_TOKEN_1         # Comma-separated API tokens
```

### Misc
```env
TIERS_FILE_PATH=/packages/shared/tiers.json    # Path to pricing tiers
```

---

## 🗄️ Database Models

### User
```python
id: UUID
email: str
password_hash: str
created_at: datetime
```

### Link
```python
id: UUID
user_id: UUID
code: str (unique, indexed)
destination_url: Text
tier: str
web_steps: int
app_steps: int
game_enabled: bool
is_active: bool
created_via: str
created_at: datetime
```

### ClickSession
```python
id: UUID
link_id: UUID
code: str
publisher_id: UUID
ip_hash: str
ua_hash: str
total_steps: int
current_step: int
status: str (pending, ready, completed)
suspicious: bool
payable: bool
step_started_at: datetime
completed_at: datetime
```

### CompletionDedupe
```python
id: UUID
click_session_id: UUID
code: str
ip_hash: str
ua_hash: str
created_at: datetime
```

### Payout
```python
id: UUID
user_id: UUID
amount: Decimal
status: str (pending, paid, rejected)
created_at: datetime
```

### SecurityEvent
```python
id: UUID
event_type: str
actor_user_id: UUID | None
ip_address: str
details: JSON
created_at: datetime
```

### AdminRecoveryCode
```python
id: UUID
user_id: UUID
code: str
is_used: bool
expires_at: datetime
created_at: datetime
```

### AppSetting
```python
id: UUID
key: str (unique)
value: Text
updated_at: datetime
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Nginx / Traefik                       │
│              (Reverse Proxy & SSL Termination)              │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┬────────────────┐
        │               │               │                │
        ▼               ▼               ▼                ▼
┌──────────────┐  ┌───────────┐  ┌──────────────┐  ┌─────────────┐
│  example.com │  │admin.ex... │  │adsexample.. │  │ exa.com    │
│              │  │           │  │              │  │             │
│  Next.js     │  │ Next.js   │  │  Next.js     │  │  Next.js    │
│  (Public)    │  │ (Admin)   │  │  (Ads)       │  │  (Short)    │
│              │  │           │  │              │  │             │
└──────┬───────┘  └─────┬─────┘  └──────┬───────┘  └──────┬──────┘
       │                 │                 │                  │
       └─────────────────┴─────────────────┴──────────────────┘
                          │
                          ▼
                  ┌───────────────┐
                  │  api:8000     │
                  │               │
                  │  FastAPI      │
                  │  (Backend)    │
                  └───────┬───────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
   ┌───────────┐   ┌───────────┐   ┌───────────┐
   │PostgreSQL  │   │  Redis    │   │   File    │
   │ :5432      │   │  :6379    │   │ Storage    │
   └───────────┘   └───────────┘   └───────────┘
```

---

## 📝 Key Files Summary

| File | Purpose |
|------|---------|
| `middleware.ts` | Domain-based routing and API proxying |
| `apps/api/app/main.py` | FastAPI application entry point |
| `apps/api/app/core/config.py` | All configuration settings |
| `apps/web/src/app/globals.css` | All global styles |
| `apps/web/src/lib/api.ts` | API client functions |
| `apps/web/src/lib/api-hooks.ts` | React Query hooks |
| `example.env` | Complete environment variables reference |

---

## 🔄 Request Flow Example

### User Creating Short Link via API:
```
1. POST example.com/api (with token)
   ↓ middleware.ts
2. Rewrites to api:8000/api
   ↓ FastAPI
3. Validates token
4. Creates link in PostgreSQL
5. Caches link in Redis
6. Returns short URL: exa.com/abc123
```

### User Clicking Short Link:
```
1. GET exa.com/abc123
   ↓ middleware.ts
2. Rewrites to api:8000/abc123
   ↓ FastAPI (redirect.py)
3. Validates code in cache/DB
4. Creates ClickSession
5. Redirects to adsexample.com/step/1?session_id=...
```

### User Completing Ad Flow:
```
1. User views ads at adsexample.com/step/1, /step/2, /step/3
2. POST visitor/step-complete for each step
3. GET visitor/verify/{session_id} after final step
4. Redirects to original destination URL
5. ClickSession marked as 'completed'
```

---

**Document Generated:** 2025-02-22
