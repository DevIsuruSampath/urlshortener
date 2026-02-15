from __future__ import annotations

import base64
import json
import random
import string
from functools import lru_cache
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import load_tiers, settings
from app.core.redis_client import redis_client
from app.db.models.link import Link

ALPHABET = string.ascii_letters + string.digits


@lru_cache(maxsize=1)
def get_tiers() -> dict:
    return load_tiers()


def resolve_tier(tier_key: str) -> dict:
    tiers = get_tiers()
    return tiers.get(tier_key) or tiers.get("standard") or {"name": "Standard", "web_steps": 3, "app_steps": 5, "game_enabled": False}


def generate_code(length: int = 7) -> str:
    return "".join(random.choice(ALPHABET) for _ in range(length))


def b64u_encode(value: str) -> str:
    return base64.urlsafe_b64encode(value.encode()).decode().rstrip("=")


def cache_payload(destination_url: str, publisher_id: str, web_steps: int) -> str:
    return json.dumps({"destination_url": destination_url, "publisher_id": publisher_id, "web_steps": web_steps})


def ensure_unique_code(db: Session, alias: str | None = None, *, length: int = 7) -> str:
    if alias:
        exists = db.execute(select(Link).where(Link.code == alias)).scalar_one_or_none()
        if exists:
            raise ValueError("Alias already exists")
        return alias

    for _ in range(20):
        code = generate_code(length)
        exists = db.execute(select(Link).where(Link.code == code)).scalar_one_or_none()
        if not exists:
            return code

    raise RuntimeError("failed to generate unique code")


def create_link_record(
    db: Session,
    *,
    user_id: Any,
    destination_url: str,
    tier: str = "standard",
    alias: str | None = None,
    created_via: str = "dashboard",
) -> Link:
    code = ensure_unique_code(db, alias)
    tier_data = resolve_tier(tier)

    link = Link(
        user_id=user_id,
        code=code,
        destination_url=destination_url,
        tier=tier,
        web_steps=int(tier_data.get("web_steps", 3)),
        app_steps=int(tier_data.get("app_steps", 5)),
        game_enabled=bool(tier_data.get("game_enabled", False)),
        created_via=created_via,
    )

    db.add(link)
    db.commit()
    db.refresh(link)

    redis_client.setex(
        f"link:{code}",
        settings.cache_ttl_seconds,
        cache_payload(link.destination_url, str(link.user_id), link.web_steps),
    )

    return link
