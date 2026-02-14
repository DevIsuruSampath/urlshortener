from __future__ import annotations

import secrets

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_admin
from app.core.rate_limit import allow_ip_action
from app.core.security import create_access_token, hash_password, verify_password
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.admin_auth import AdminLoginIn, AdminMeOut, DeveloperTokenOut, TokenOut
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


def _resolved_admin_password_hash() -> str:
    if settings.admin_password_hash:
        return settings.admin_password_hash

    if settings.admin_password:
        return hash_password(settings.admin_password)

    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Admin password hash is not configured")


def _mask_token(token: str) -> str:
    if not token:
        return "not-configured"
    if len(token) <= 8:
        return token
    return f"{token[:4]}...{token[-4:]}"


@router.post("/login", response_model=TokenOut)
def admin_login(payload: AdminLoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    _enforce_auth_rate_limit(request, "login")

    username_ok = secrets.compare_digest(payload.username.strip(), settings.admin_username)
    password_ok = verify_password(payload.password, _resolved_admin_password_hash())

    if not (username_ok and password_ok):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")

    user = ensure_admin_user(db)
    token = create_access_token(str(user.id))

    response.set_cookie(
        key=settings.admin_session_cookie_name,
        value=token,
        httponly=settings.cookie_httponly,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=settings.access_token_expire_minutes * 60,
        path="/",
    )

    return TokenOut(access_token=token)


@router.post("/logout")
def admin_logout(response: Response):
    response.delete_cookie(settings.admin_session_cookie_name, path="/", domain=settings.cookie_domain)
    return {"ok": True}


@router.get("/me", response_model=AdminMeOut)
def admin_me(user: User = Depends(get_current_admin)):
    return AdminMeOut(username=settings.admin_username, user_id=str(user.id))


@router.get("/developer-token", response_model=DeveloperTokenOut)
def developer_token_info(_: User = Depends(get_current_admin)):
    current = settings.admin_api_tokens[0] if settings.admin_api_tokens else ""
    return DeveloperTokenOut(masked_token=_mask_token(current))
