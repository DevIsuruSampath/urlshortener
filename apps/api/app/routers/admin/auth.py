from __future__ import annotations

import secrets
import time

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_admin
from app.core.rate_limit import allow_ip_action
from app.core.redis_client import redis_client
from app.core.security import create_access_token, verify_password
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.admin_auth import (
    AdminBootstrapStatusOut,
    AdminLoginIn,
    AdminLoginOut,
    AdminMeOut,
    AdminSetupIn,
    AdminSetupOut,
    DeveloperTokenOut,
)
from app.services.admin_recovery_service import consume_recovery_code
from app.services.admin_user_service import create_admin_user_once, get_primary_admin_user, is_admin_initialized

router = APIRouter()


def client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


def _is_https_request(request: Request) -> bool:
    xf_proto = (request.headers.get("x-forwarded-proto") or "").split(",")[0].strip().lower()
    if xf_proto:
        return xf_proto == "https"
    return request.url.scheme == "https"


def _require_https_for_setup(request: Request) -> None:
    if not settings.require_https_for_admin_setup:
        return
    if _is_https_request(request):
        return
    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="HTTPS is required for admin setup")


def _require_setup_token(request: Request) -> None:
    required = settings.admin_setup_token.strip()
    if not required:
        return

    provided = (
        request.query_params.get("token")
        or request.headers.get("x-admin-setup-token")
        or request.headers.get("x-setup-token")
        or ""
    ).strip()

    if provided and secrets.compare_digest(provided, required):
        return

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid setup token")


def _enforce_action_rate_limit(request: Request, action: str, per_minute: int) -> None:
    ip = client_ip(request)
    limit = per_minute if per_minute > 0 else settings.auth_rate_limit_per_minute
    ok = allow_ip_action(ip, f"admin-auth:{action}", limit, window_seconds=60)
    if not ok:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many authentication attempts. Please try again in a minute.",
        )


def _login_fail_key(ip: str) -> str:
    return f"admin-auth:login-fail:{ip}"


def _login_lock_key(ip: str) -> str:
    return f"admin-auth:login-lock:{ip}"


def _check_login_lockout(ip: str) -> None:
    if settings.admin_login_lockout_threshold <= 0:
        return

    key = _login_lock_key(ip)
    if not redis_client.exists(key):
        return

    ttl = redis_client.ttl(key)
    if ttl is None or ttl < 0:
        ttl = settings.admin_login_lockout_minutes * 60

    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=f"Login temporarily locked. Retry in {ttl} seconds.",
    )


def _record_login_failure(ip: str) -> int:
    fail_key = _login_fail_key(ip)
    fail_count = redis_client.incr(fail_key)
    if fail_count == 1:
        redis_client.expire(fail_key, 60)

    if settings.admin_login_lockout_threshold > 0 and fail_count >= settings.admin_login_lockout_threshold:
        redis_client.setex(_login_lock_key(ip), settings.admin_login_lockout_minutes * 60, "1")
        redis_client.delete(fail_key)

    return fail_count


def _apply_progressive_login_delay(fail_count: int) -> None:
    max_delay = settings.admin_login_progressive_delay_max_seconds
    if max_delay <= 0:
        return

    delay_seconds = min(max_delay, max(0, fail_count - 1))
    if delay_seconds > 0:
        time.sleep(delay_seconds)


def _clear_login_failures(ip: str) -> None:
    redis_client.delete(_login_fail_key(ip))
    redis_client.delete(_login_lock_key(ip))


def _reject_invalid_credentials(ip: str) -> None:
    fail_count = _record_login_failure(ip)
    _apply_progressive_login_delay(fail_count)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin credentials")


def _mask_token(token: str) -> str:
    if not token:
        return "not-configured"
    if len(token) <= 8:
        return token
    return f"{token[:4]}...{token[-4:]}"


@router.get("/bootstrap-status", response_model=AdminBootstrapStatusOut)
@router.get("/status", response_model=AdminBootstrapStatusOut)
def admin_bootstrap_status(db: Session = Depends(get_db)):
    return AdminBootstrapStatusOut(initialized=is_admin_initialized(db))


@router.post("/setup", response_model=AdminSetupOut)
def admin_setup(payload: AdminSetupIn, request: Request, db: Session = Depends(get_db)):
    _require_https_for_setup(request)
    _require_setup_token(request)
    _enforce_action_rate_limit(request, "setup", settings.admin_setup_rate_limit_per_minute)

    if is_admin_initialized(db):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Admin already initialized")

    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password confirmation does not match")

    if len(payload.password) < 8:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password must be at least 8 characters")

    try:
        _, recovery_codes = create_admin_user_once(db, email=str(payload.email), password=payload.password)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    return AdminSetupOut(initialized=True, recovery_codes=recovery_codes)


@router.post("/login", response_model=AdminLoginOut)
def admin_login(payload: AdminLoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    ip = client_ip(request)
    _check_login_lockout(ip)
    _enforce_action_rate_limit(request, "login", settings.admin_login_rate_limit_per_minute)

    if not is_admin_initialized(db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin setup is required")

    user = get_primary_admin_user(db)
    if not user:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Admin user not found")

    email_ok = payload.email.strip().lower() == user.email.strip().lower()

    password = (payload.password or "").strip()
    recovery_code = (payload.recovery_code or "").strip()
    if not password and not recovery_code:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provide password or recovery code")

    if not email_ok:
        _reject_invalid_credentials(ip)

    credential_ok = False
    if recovery_code:
        credential_ok = consume_recovery_code(db, user, recovery_code)
        if credential_ok:
            db.commit()
    else:
        credential_ok = verify_password(password, user.password_hash)

    if not credential_ok:
        _reject_invalid_credentials(ip)

    _clear_login_failures(ip)

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

    return AdminLoginOut(ok=True)


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
