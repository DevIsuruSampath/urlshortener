from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.deps import get_current_user
from app.core.redis_client import redis_client
from app.db.models.link import Link
from app.db.models.user import User
from app.db.session import get_db
from app.schemas.link import LinkCreateIn
from app.services.link_service import create_link_record
from app.services.security_event_service import log_security_event
from app.services.url_safety import validate_public_destination_url

router = APIRouter()


class LinkEditIn(BaseModel):
    destination_url: Optional[str] = None
    tier: Optional[str] = None
    web_steps: Optional[int] = None
    app_steps: Optional[int] = None


class LinkBlockIn(BaseModel):
    block: bool


def _clear_link_cache(code: str) -> None:
    try:
        redis_client.delete(f"link:{code}")
    except Exception:
        pass


def _client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


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
            created_via="dashboard",
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    # Determine protocol
    base_domain = settings.short_link_domain or settings.public_web_base_url.rstrip('/').replace("https://", "").replace("http://", "")
    if "localhost" in base_domain:
        base_url = f"http://{base_domain}"
    else:
        base_url = f"https://{base_domain}"

    return {
        "id": str(link.id),
        "code": link.code,
        "short_url": f"{base_url}/{link.code}",
        "destination_url": link.destination_url,
        "tier": link.tier,
        "web_steps": link.web_steps,
        "app_steps": link.app_steps,
        "is_active": link.is_active,
        "created_via": link.created_via,
    }


@router.get("")
def list_links(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.execute(select(Link).where(Link.user_id == user.id).order_by(Link.created_at.desc())).scalars().all()
    
    # Determine protocol
    base_domain = settings.short_link_domain or settings.public_web_base_url.rstrip('/').replace("https://", "").replace("http://", "")
    if "localhost" in base_domain:
        base_url = f"http://{base_domain}"
    else:
        base_url = f"https://{base_domain}"

    return [
        {
            "id": str(r.id),
            "code": r.code,
            "short_url": f"{base_url}/{r.code}",
            "destination_url": r.destination_url,
            "tier": r.tier,
            "web_steps": r.web_steps,
            "app_steps": r.app_steps,
            "is_active": r.is_active,
            "created_via": r.created_via,
            "created_at": r.created_at,
        }
        for r in rows
    ]


def _get_link_or_404(db: Session, link_id: str, user: User) -> Link:
    link = db.get(Link, link_id)
    if not link or link.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")
    return link


def _build_base_url() -> str:
    base_domain = settings.short_link_domain or settings.public_web_base_url.rstrip('/').replace("https://", "").replace("http://", "")
    if "localhost" in base_domain:
        return f"http://{base_domain}"
    return f"https://{base_domain}"


def _link_response(link: Link) -> dict:
    base_url = _build_base_url()
    return {
        "id": str(link.id),
        "code": link.code,
        "short_url": f"{base_url}/{link.code}",
        "destination_url": link.destination_url,
        "tier": link.tier,
        "web_steps": link.web_steps,
        "app_steps": link.app_steps,
        "is_active": link.is_active,
        "created_via": link.created_via,
        "created_at": link.created_at,
    }


@router.patch("/{link_id}")
def edit_link(
    link_id: str,
    payload: LinkEditIn,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = _get_link_or_404(db, link_id, user)

    if payload.destination_url is not None:
        try:
            validated = validate_public_destination_url(payload.destination_url)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        link.destination_url = validated

    if payload.tier is not None:
        link.tier = payload.tier
    if payload.web_steps is not None:
        link.web_steps = payload.web_steps
    if payload.app_steps is not None:
        link.app_steps = payload.app_steps

    db.commit()
    db.refresh(link)

    _clear_link_cache(link.code)

    return _link_response(link)


@router.delete("/{link_id}")
def delete_link(
    link_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = _get_link_or_404(db, link_id, user)
    code = link.code

    db.delete(link)
    db.commit()

    _clear_link_cache(code)

    return {"ok": True}


@router.patch("/{link_id}/toggle")
def toggle_link(
    link_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = _get_link_or_404(db, link_id, user)
    link.is_active = not link.is_active
    db.commit()
    db.refresh(link)

    _clear_link_cache(link.code)

    return _link_response(link)


@router.patch("/{link_id}/block")
def block_link(
    link_id: str,
    payload: LinkBlockIn,
    request: Request,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    link = _get_link_or_404(db, link_id, user)
    link.is_active = not payload.block
    db.commit()
    db.refresh(link)

    _clear_link_cache(link.code)

    event_type = "link_blocked" if payload.block else "link_unblocked"
    try:
        log_security_event(
            db,
            event_type=event_type,
            actor_user_id=user.id,
            ip_address=_client_ip(request),
            details={"link_id": str(link.id), "code": link.code},
            commit=True,
        )
    except Exception:
        db.rollback()

    return _link_response(link)
