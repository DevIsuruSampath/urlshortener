from __future__ import annotations

import json

from fastapi import APIRouter, Depends, HTTPException, Request, status
from redis.exceptions import RedisError
from fastapi.responses import RedirectResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import allow_ip_action
from app.core.redis_client import redis_client
from app.db.models.click_session import ClickSession
from app.db.models.link import Link
from app.db.session import get_db
from app.services.fraud_service import hash_value, suspicious_request
from app.services.link_service import cache_payload

router = APIRouter()

RESERVED_CODES = {
    "api",
    "docs",
    "redoc",
    "openapi.json",
    "health",
    "l",
    "pricing",
    "terms",
    "privacy",
    "login",
    "register",
    "admin",
    "faq",
    "support",
    "contact",
    "cookie",
    "robots.txt",
    "sitemap.xml",
    "favicon.ico",
    "_next",
    "flow",
    "visitor",
    "start",
    "verify",
    "step-complete",
}


def client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


@router.get("/{code}")
def hit_short_code(code: str, request: Request, db: Session = Depends(get_db)):
    if code in RESERVED_CODES:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found")

    ip = client_ip(request)
    if not allow_ip_action(ip, "start", settings.start_rate_limit_per_minute, window_seconds=60):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")

    cache_key = f"link:{code}"
    try:
        cached = redis_client.get(cache_key)
    except RedisError:
        cached = None

    publisher_id = None
    web_steps = None

    link = db.execute(select(Link).where(Link.code == code).where(Link.is_active.is_(True))).scalar_one_or_none()
    if not link:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid short code")

    if cached:
        try:
            data = json.loads(cached)
            publisher_id = str(data.get("publisher_id") or link.user_id)
            web_steps = max(1, int(data.get("web_steps") or link.web_steps))
        except (TypeError, ValueError, json.JSONDecodeError):
            publisher_id = str(link.user_id)
            web_steps = max(1, int(link.web_steps))
    else:
        publisher_id = str(link.user_id)
        web_steps = max(1, int(link.web_steps))

    try:
        redis_client.setex(cache_key, settings.cache_ttl_seconds, cache_payload(link.destination_url, publisher_id, web_steps))
    except RedisError:
        pass

    ua = request.headers.get("user-agent", "")

    ip_hash = hash_value(ip)
    ua_hash = hash_value(ua)

    click_session = ClickSession(
        link_id=link.id,
        code=code,
        publisher_id=link.user_id,
        ip_hash=ip_hash,
        ua_hash=ua_hash,
        total_steps=web_steps,
        current_step=0,
        suspicious=suspicious_request(ua),
        status="pending",
        payable=False,
    )
    db.add(click_session)
    db.commit()
    db.refresh(click_session)

    # Redirect to new frontend-ads (ScrollWall pages)
    ads_domain = settings.interstitial_domain
    if "localhost" in ads_domain:
        ads_base = f"http://{ads_domain}"
    else:
        ads_base = f"https://{ads_domain}"

    interstitial_url = f"{ads_base}/step/1?session_id={click_session.id}"

    return RedirectResponse(url=interstitial_url, status_code=302)
