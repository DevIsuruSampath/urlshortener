# URL Shortener - Project Structure

## Overview
Monorepo structure with separate API (FastAPI) and Web (Next.js) applications.

## Root Structure
```
urlshortener/
├── apps/                    # Application packages
│   ├── api/                # FastAPI backend
│   └── web/                # Next.js frontend
├── infra/                  # Infrastructure & deployment
├── packages/               # Shared packages
└── README.md
```

## 1. API Backend (`apps/api/`)
**FastAPI application for URL shortening, analytics, and admin API.**

### Core Structure
```
apps/api/
├── app/
│   ├── __init__.py
│   ├── main.py            # FastAPI app entry point
│   ├── init.py            # Application initialization
│   ├── cli.py             # CLI commands
│   │
│   ├── core/              # Core application logic
│   │   ├── config.py      # Configuration management
│   │   ├── security.py    # Authentication & security
│   │   ├── bootstrap.py   # Admin bootstrap
│   │   ├── rate_limit.py  # Rate limiting
│   │   └── redis_client.py
│   │
│   ├── db/                # Database layer
│   │   ├── base.py        # SQLAlchemy base
│   │   ├── session.py     # Database session
│   │   ├── bootstrap.py   # DB initialization
│   │   │
│   │   ├── models/        # SQLAlchemy models
│   │   │   ├── link.py
│   │   │   ├── user.py
│   │   │   ├── click_session.py
│   │   │   ├── completion_dedupe.py
│   │   │   ├── payout.py
│   │   │   ├── security_event.py
│   │   │   ├── admin_recovery_code.py
│   │   │   └── app_setting.py
│   │   │
│   │   └── migrations/    # Alembic migrations
│   │       ├── env.py
│   │       └── versions/
│   │
│   ├── routers/           # API endpoints
│   │   ├── admin/         # Admin API (protected)
│   │   │   ├── auth.py
│   │   │   ├── links.py
│   │   │   ├── stats.py
│   │   │   ├── settings.py
│   │   │   └── security_events.py
│   │   │
│   │   ├── public_api.py  # Public API
│   │   ├── redirect.py    # URL redirection
│   │   └── visitor.py     # Visitor tracking
│   │
│   ├── schemas/           # Pydantic schemas
│   │   ├── admin_auth.py
│   │   ├── link.py
│   │   └── security_event.py
│   │
│   ├── services/          # Business logic
│   │   ├── link_service.py
│   │   ├── admin_user_service.py
│   │   ├── admin_api_token_service.py
│   │   ├── admin_recovery_service.py
│   │   ├── fraud_service.py
│   │   ├── security_event_service.py
│   │   └── url_safety.py
│   │
│   └── tests/             # Tests
│       └── test_health.py
│
├── .env.example           # Environment variables
├── requirements.txt       # Python dependencies
└── Dockerfile            # Docker configuration
```

## 2. Web Frontend (`apps/web/`)
**Next.js 16 application with App Router for admin dashboard and public pages.**

### Core Structure
```
apps/web/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Root layout
│   │   │
│   │   ├── admin/        # Admin dashboard
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx  # Dashboard home
│   │   │   │
│   │   │   ├── links/    # Links management
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/
│   │   │   │   └── old-page.tsx
│   │   │   │
│   │   │   ├── profile/  # User profile
│   │   │   ├── settings/ # System settings
│   │   │   └── stats/    # Analytics
│   │   │
│   │   ├── (public)/     # Public marketing pages
│   │   │   ├── page.tsx  # Homepage
│   │   │   ├── pricing/
│   │   │   ├── faq/
│   │   │   ├── contact/
│   │   │   ├── terms/
│   │   │   ├── privacy/
│   │   │   ├── cookie/
│   │   │   └── support/
│   │   │
│   │   ├── login/        # Login page
│   │   ├── verify/       # Link verification
│   │   ├── step/[step]/  # Ad flow steps
│   │   ├── [code]/       # Short URL redirects
│   │   │
│   │   └── api/          # API routes (proxies to backend)
│   │       └── admin/links/
│   │
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   │   ├── AppShell.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── Container.tsx
│   │   │   ├── dashboard-nav-items.ts
│   │   │   └── nav-utils.ts
│   │   │
│   │   ├── auth/         # Authentication
│   │   │   ├── AdminGuard.tsx
│   │   │   └── AuthForm.tsx
│   │   │
│   │   ├── ui/           # UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Drawer.tsx
│   │   │   ├── DropdownMenu.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── StatCard.tsx
│   │   │   ├── TrafficChart.tsx
│   │   │   ├── CopyButton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Grid.tsx
│   │   │   ├── Stack.tsx
│   │   │   └── ...
│   │   │
│   │   ├── data/         # Data components
│   │   │   ├── DataTable.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── Pagination.tsx
│   │   │
│   │   ├── ads/          # Ad components
│   │   │   └── ScrollWall.tsx
│   │   │
│   │   └── public/       # Public components
│   │       ├── SiteHeader.tsx
│   │       └── SiteFooter.tsx
│   │
│   ├── lib/              # Utilities
│   │   ├── api.ts        # API client
│   │   └── env.ts        # Environment helpers
│   │
│   ├── middleware.ts     # Next.js middleware (domain routing)
│   │
│   └── styles/           # Styles
│       └── globals.css   # Global CSS
│
├── public/               # Static assets
├── package.json          # Node.js dependencies
├── next.config.js       # Next.js configuration
├── tsconfig.json        # TypeScript configuration
└── Dockerfile           # Docker configuration
```

## 3. Infrastructure (`infra/`)
```
infra/
├── docker-compose.yml    # Docker Compose for development
└── scripts/             # Deployment scripts
```

## 4. Shared Packages (`packages/`)
```
packages/
└── shared/              # Shared code between apps
    ├── constants.ts     # Shared constants
    ├── tiers.json       # Pricing tiers
    └── README.md
```

## 5. Root Configuration
```
├── Dockerfile           # Root Dockerfile (orchestration)
├── .env.example         # Global environment example
├── .gitignore          # Git ignore rules
└── README.md           # Project documentation
```

## Key Architectural Patterns

### 1. **Domain-Based Routing**
- `example.com` → Public marketing site
- `admin.example.com` → Admin dashboard
- `adsexample.com` → Ad flow pages
- `exa.com` → Short links
- `api.example.com` → Backend API

### 2. **Authentication Flow**
- JWT tokens with HTTPOnly cookies
- Cross-domain auth with `.example.com` domain
- Admin-only endpoints with role-based access

### 3. **Database Schema**
- PostgreSQL with SQLAlchemy ORM
- Alembic for migrations
- Models: Links, Users, Clicks, Security Events

### 4. **Frontend Architecture**
- Next.js 16 with App Router
- Server Components by default
- Client Components for interactivity
- Custom CSS (no UI framework)
- Radix UI for accessibility primitives
- Recharts for data visualization

### 5. **API Design**
- FastAPI with automatic OpenAPI docs
- RESTful endpoints with JSON responses
- Rate limiting and security headers
- Structured error responses

### 6. **Deployment**
- Docker containers for each service
- Docker Compose for local development
- Designed for Dokploy deployment
- Environment-based configuration

## Development Workflow

### Local Development
```bash
# Start all services
docker-compose up -d

# Or run separately
cd apps/api && uvicorn app.main:app --reload
cd apps/web && npm run dev
```

### Building for Production
```bash
# Build Docker images
docker build -t urlshortener-api -f apps/api/Dockerfile .
docker build -t urlshortener-web -f apps/web/Dockerfile .

# Or use root Dockerfile
docker build -t urlshortener .
```

### Database Migrations
```bash
cd apps/api
alembic upgrade head
alembic revision --autogenerate -m "description"
```

## Environment Variables

### API (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost/db
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=initial-password
```

### Web (.env)
```env
NEXT_PUBLIC_API_URL=http://api.example.com
NEXT_PUBLIC_APP_DOMAIN=example.com
NEXT_PUBLIC_PROJECT_NAME=URL Shortener
```

## Technology Stack

### Backend
- **Python 3.11+** with FastAPI
- **PostgreSQL** with SQLAlchemy
- **Redis** for caching/sessions
- **Alembic** for migrations
- **Pydantic** for validation

### Frontend
- **Next.js 16** with TypeScript
- **React 18** with Server Components
- **Radix UI** for primitives
- **Recharts** for visualization
- **Custom CSS** with CSS variables

### DevOps
- **Docker** containerization
- **Docker Compose** for orchestration
- **Dokploy** for deployment
- **GitHub** for version control