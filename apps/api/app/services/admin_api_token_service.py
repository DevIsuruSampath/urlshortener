from __future__ import annotations

import secrets
from collections import OrderedDict

from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.models.app_setting import AppSetting

ADMIN_API_TOKENS_SETTING_KEY = "admin_api_tokens"


def _parse_tokens(raw: str | None) -> list[str]:
    if not raw:
        return []
    return [token.strip() for token in raw.split(",") if token.strip()]


def _dedupe_preserve_order(values: list[str]) -> list[str]:
    return list(OrderedDict((v, None) for v in values).keys())


def get_admin_api_tokens(db: Session) -> list[str]:
    row = db.get(AppSetting, ADMIN_API_TOKENS_SETTING_KEY)
    if row and row.value.strip():
        return _dedupe_preserve_order(_parse_tokens(row.value))
    return _dedupe_preserve_order(settings.admin_api_tokens)


def set_admin_api_tokens(db: Session, tokens: list[str]) -> list[str]:
    cleaned = _dedupe_preserve_order([t.strip() for t in tokens if t.strip()])

    row = db.get(AppSetting, ADMIN_API_TOKENS_SETTING_KEY)
    if row:
        row.value = ",".join(cleaned)
    else:
        db.add(AppSetting(key=ADMIN_API_TOKENS_SETTING_KEY, value=",".join(cleaned)))

    return cleaned


def generate_admin_api_token() -> str:
    return f"api_{secrets.token_urlsafe(24)}"


def regenerate_admin_api_token(db: Session) -> tuple[str, list[str]]:
    current = get_admin_api_tokens(db)
    new_token = generate_admin_api_token()
    tokens = set_admin_api_tokens(db, [new_token, *current])
    db.commit()
    return new_token, tokens


def finalize_admin_api_token_rotation(db: Session) -> list[str]:
    current = get_admin_api_tokens(db)
    keep = current[:1]
    tokens = set_admin_api_tokens(db, keep)
    db.commit()
    return tokens
