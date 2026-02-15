import os

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.deps import get_current_admin
from app.routers import flow, public_api, redirect
from app.routers.admin import auth as admin_auth
from app.routers.admin import links as admin_links
from app.routers.admin import security_events as admin_security_events
from app.routers.admin import stats as admin_stats

app = FastAPI(title="PaidLink API", version="0.1.0")

raw_cors = os.getenv("CORS_ORIGINS", "")
if raw_cors.strip():
    cors_origins = [o.strip().rstrip("/") for o in raw_cors.split(",") if o.strip()]
else:
    cors_origins = [
        settings.public_web_base_url.rstrip("/"),
        f"https://{settings.short_link_domain}",
        f"https://{settings.interstitial_domain}",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
@app.get("/api/health")
def health():
    return {"ok": True}


# Public routes (no auth)
app.include_router(public_api.router, tags=["public-api"])
app.include_router(flow.router, prefix="/flow", tags=["flow"])

# Admin routes (auth required)
app.include_router(admin_auth.router, prefix="/admin/auth", tags=["admin-auth"])
app.include_router(
    admin_links.router,
    prefix="/admin/links",
    tags=["admin-links"],
    dependencies=[Depends(get_current_admin)],
)
app.include_router(
    admin_stats.router,
    prefix="/admin/stats",
    tags=["admin-stats"],
    dependencies=[Depends(get_current_admin)],
)
app.include_router(
    admin_security_events.router,
    prefix="/admin/security-events",
    tags=["admin-security-events"],
    dependencies=[Depends(get_current_admin)],
)

# Redirect hot path
app.include_router(redirect.router, tags=["redirect"])
