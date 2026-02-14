from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.redis_client import redis_client
from app.db.models.link import Link
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.link import LinkCreateIn
from app.services.link_service import cache_payload, generate_code, resolve_tier
from app.services.url_safety import validate_public_destination_url

router = APIRouter()


def _unique_code(db: Session) -> str:
    for _ in range(20):
        code = generate_code(7)
        exists = db.execute(select(Link).where(Link.code == code)).scalar_one_or_none()
        if not exists:
            return code
    raise HTTPException(status_code=500, detail="failed to generate unique code")


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

    tier_data = resolve_tier(payload.tier)
    code = _unique_code(db)

    link = Link(
        user_id=user.id,
        code=code,
        destination_url=destination_url,
        tier=payload.tier,
        web_steps=int(tier_data.get("web_steps", 3)),
        app_steps=int(tier_data.get("app_steps", 5)),
        game_enabled=bool(tier_data.get("game_enabled", False)),
    )
    db.add(link)
    db.commit()
    db.refresh(link)

    redis_client.setex(
        f"link:{code}",
        settings.cache_ttl_seconds,
        cache_payload(link.destination_url, str(link.user_id), link.web_steps),
    )

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
