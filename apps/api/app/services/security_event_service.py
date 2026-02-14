from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.security_event import SecurityEvent


def _normalized_details(details: Mapping[str, Any] | None) -> dict[str, Any]:
    if not details:
        return {}

    cleaned: dict[str, Any] = {}
    for key, value in details.items():
        k = str(key)[:64]
        if isinstance(value, (str, int, float, bool)) or value is None:
            cleaned[k] = value
        else:
            cleaned[k] = str(value)
    return cleaned


def log_security_event(
    db: Session,
    *,
    event_type: str,
    actor_user_id: Any | None = None,
    ip_address: str | None = None,
    details: Mapping[str, Any] | None = None,
    commit: bool = False,
) -> SecurityEvent:
    row = SecurityEvent(
        event_type=event_type.strip()[:64],
        actor_user_id=actor_user_id,
        ip_address=(ip_address or "").strip()[:64] or None,
        details=_normalized_details(details),
    )
    db.add(row)

    if commit:
        db.commit()
        db.refresh(row)

    return row


def list_latest_security_events(db: Session, limit: int = 50) -> list[SecurityEvent]:
    final_limit = max(1, min(limit, 200))
    return db.execute(select(SecurityEvent).order_by(SecurityEvent.created_at.desc()).limit(final_limit)).scalars().all()
