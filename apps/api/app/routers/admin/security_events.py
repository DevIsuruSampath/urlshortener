from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.security_event import SecurityEventCreateIn, SecurityEventOut
from app.services.security_event_service import list_latest_security_events, log_security_event

router = APIRouter()


def _client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


@router.get("", response_model=list[SecurityEventOut])
def list_security_events(
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    rows = list_latest_security_events(db, limit=limit)
    return [
        SecurityEventOut(
            id=str(row.id),
            event_type=row.event_type,
            actor_user_id=str(row.actor_user_id) if row.actor_user_id else None,
            ip_address=row.ip_address,
            details=row.details or {},
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.post("", response_model=SecurityEventOut)
def create_security_event(
    payload: SecurityEventCreateIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_admin),
):
    row = log_security_event(
        db,
        event_type=payload.event_type,
        actor_user_id=user.id,
        ip_address=_client_ip(request),
        details=payload.details,
        commit=True,
    )

    return SecurityEventOut(
        id=str(row.id),
        event_type=row.event_type,
        actor_user_id=str(row.actor_user_id) if row.actor_user_id else None,
        ip_address=row.ip_address,
        details=row.details or {},
        created_at=row.created_at,
    )
