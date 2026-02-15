from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.models.app_setting import AppSetting
from app.db.models.user import User
from app.db.session import get_db
from app.services.security_event_service import log_security_event

router = APIRouter()


def _client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


def _get_settings(db: Session, keys: list[str], defaults: dict[str, str]) -> dict[str, str]:
    result = {}
    for key in keys:
        row = db.get(AppSetting, key)
        result[key] = row.value if row else defaults.get(key, "")
    return result


def _put_settings(db: Session, data: dict[str, str]) -> None:
    for key, value in data.items():
        row = db.get(AppSetting, key)
        if row:
            row.value = str(value)
        else:
            db.add(AppSetting(key=key, value=str(value)))
    db.commit()


# ── Flow Defaults ────────────────────────────────────────────────────────

FLOW_KEYS = [
    "default_web_steps",
    "default_app_steps",
    "first_step_min_seconds",
    "next_step_min_seconds",
    "captcha_mode",
]

FLOW_DEFAULTS = {
    "default_web_steps": "3",
    "default_app_steps": "5",
    "first_step_min_seconds": "8",
    "next_step_min_seconds": "3",
    "captcha_mode": "suspicious_only",
}


class FlowSettingsIn(BaseModel):
    default_web_steps: str
    default_app_steps: str
    first_step_min_seconds: str
    next_step_min_seconds: str
    captcha_mode: str


@router.get("/flow")
def get_flow_settings(db: Session = Depends(get_db), _user: User = Depends(get_current_admin)):
    return _get_settings(db, FLOW_KEYS, FLOW_DEFAULTS)


@router.put("/flow")
def put_flow_settings(
    payload: FlowSettingsIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    data = payload.model_dump()
    _put_settings(db, data)

    try:
        log_security_event(
            db,
            event_type="settings_changed",
            actor_user_id=user.id,
            ip_address=_client_ip(request),
            details={"section": "flow", **data},
            commit=True,
        )
    except Exception:
        db.rollback()

    return {"ok": True}


# ── Anti-Abuse Settings ──────────────────────────────────────────────────

ANTI_ABUSE_KEYS = [
    "dedupe_hours",
    "start_rate_limit_per_minute",
    "step_rate_limit_per_minute",
    "auth_rate_limit_per_minute",
]

ANTI_ABUSE_DEFAULTS = {
    "dedupe_hours": "24",
    "start_rate_limit_per_minute": "120",
    "step_rate_limit_per_minute": "60",
    "auth_rate_limit_per_minute": "20",
}


class AntiAbuseSettingsIn(BaseModel):
    dedupe_hours: str
    start_rate_limit_per_minute: str
    step_rate_limit_per_minute: str
    auth_rate_limit_per_minute: str


@router.get("/anti-abuse")
def get_anti_abuse_settings(db: Session = Depends(get_db), _user: User = Depends(get_current_admin)):
    return _get_settings(db, ANTI_ABUSE_KEYS, ANTI_ABUSE_DEFAULTS)


@router.put("/anti-abuse")
def put_anti_abuse_settings(
    payload: AntiAbuseSettingsIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    data = payload.model_dump()
    _put_settings(db, data)

    try:
        log_security_event(
            db,
            event_type="settings_changed",
            actor_user_id=user.id,
            ip_address=_client_ip(request),
            details={"section": "anti_abuse", **data},
            commit=True,
        )
    except Exception:
        db.rollback()

    return {"ok": True}


# ── Monetization Settings ────────────────────────────────────────────────

MONETIZATION_KEYS = [
    "payout_threshold_usd",
    "rotation_enabled",
    "primary_ad_network",
    "secondary_ad_network",
    "global_mobile_rpm",
    "global_desktop_rpm",
    "lk_mobile_rpm",
    "in_mobile_rpm",
]

MONETIZATION_DEFAULTS = {
    "payout_threshold_usd": "250",
    "rotation_enabled": "true",
    "primary_ad_network": "monetag",
    "secondary_ad_network": "adsterra",
    "global_mobile_rpm": "1.20",
    "global_desktop_rpm": "1.80",
    "lk_mobile_rpm": "1.55",
    "in_mobile_rpm": "0.95",
}


class MonetizationSettingsIn(BaseModel):
    payout_threshold_usd: str
    rotation_enabled: str
    primary_ad_network: str
    secondary_ad_network: str
    global_mobile_rpm: str
    global_desktop_rpm: str
    lk_mobile_rpm: str
    in_mobile_rpm: str


@router.get("/monetization")
def get_monetization_settings(db: Session = Depends(get_db), _user: User = Depends(get_current_admin)):
    return _get_settings(db, MONETIZATION_KEYS, MONETIZATION_DEFAULTS)


@router.put("/monetization")
def put_monetization_settings(
    payload: MonetizationSettingsIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    data = payload.model_dump()
    _put_settings(db, data)

    try:
        log_security_event(
            db,
            event_type="settings_changed",
            actor_user_id=user.id,
            ip_address=_client_ip(request),
            details={"section": "monetization", **data},
            commit=True,
        )
    except Exception:
        db.rollback()

    return {"ok": True}
