from __future__ import annotations

import base64
import json
import random
import string
from functools import lru_cache

from app.core.config import load_tiers

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
