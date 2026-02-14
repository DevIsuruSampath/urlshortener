from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.db.models.link import Link
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.link import LinkCreateIn
from app.services.link_service import create_link_record
from app.services.url_safety import validate_public_destination_url

router = APIRouter()


@router.post("")
def create_link(
    payload: LinkCreateIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        destination_url = validate_public_destination_url(str(payload.destination_url))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        link = create_link_record(
            db,
            user_id=user.id,
            destination_url=destination_url,
            tier=payload.tier,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "id": str(link.id),
        "code": link.code,
        "short_url": f"{settings.public_web_base_url.rstrip('/')}/{link.code}",
        "destination_url": link.destination_url,
        "tier": link.tier,
        "web_steps": link.web_steps,
        "app_steps": link.app_steps,
        "is_active": link.is_active,
    }


@router.get("")
def list_links(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(select(Link).where(Link.user_id == user.id).order_by(Link.created_at.desc())).scalars().all()
    return [
        {
            "id": str(r.id),
            "code": r.code,
            "short_url": f"{settings.public_web_base_url.rstrip('/')}/{r.code}",
            "destination_url": r.destination_url,
            "tier": r.tier,
            "web_steps": r.web_steps,
            "app_steps": r.app_steps,
            "is_active": r.is_active,
            "created_at": r.created_at,
        }
        for r in rows
    ]
