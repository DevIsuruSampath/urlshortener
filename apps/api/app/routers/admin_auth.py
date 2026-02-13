from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_admin
from app.core.rate_limit import allow_ip_action
from app.core.security import create_access_token
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.admin_auth import AdminLoginIn, AdminMeOut, TokenOut
from app.services.admin_user_service import ensure_admin_user

router = APIRouter()


def client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


def _enforce_auth_rate_limit(request: Request, action: str) -> None:
    ip = client_ip(request)
    ok = allow_ip_action(ip, f"admin-auth:{action}", settings.auth_rate_limit_per_minute, window_seconds=60)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again in a minute.",
        )


@router.post("/login", response_model=TokenOut)
def admin_login(payload: AdminLoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _enforce_auth_rate_limit(request, "login")

    username_ok = secrets.compare_digest(payload.username.strip(), settings.admin_username)
    password_ok = secrets.compare_digest(payload.password, settings.admin_password)

    if not (username_ok and password_ok):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    user = ensure_admin_user(db)
    token = create_access_token(str(user.id))

    secure_cookie = settings.app_env.lower() == "production"
    response.set_cookie(
        key=settings.admin_session_cookie_name,
        value=token,
        httponly=True,
        secure=secure_cookie,
        samesite="lax",
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )

    return TokenOut(access_token=token)


@router.post("/logout")
def admin_logout(response: Response):
    response.delete_cookie(settings.admin_session_cookie_name, path="/")
    return {"ok": True}


@router.get("/me", response_model=AdminMeOut)
def admin_me(user: User = Depends(get_current_admin)):
    return AdminMeOut(username=settings.admin_username, user_id=str(user.id))
