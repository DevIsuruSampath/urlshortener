from __future__ import annotations

import hashlib
from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models.completion_dedupe import CompletionDedupe


def hash_value(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def suspicious_request(ua: str) -> bool:
    ua_l = (ua or "").lower()
    return ("bot" in ua_l) or ("crawler" in ua_l)


def has_recent_dedupe(db: Session, code: str, ip_hash: str, ua_hash: str, hours: int = 24) -> bool:
    since = datetime.now(UTC) - timedelta(hours=hours)
    stmt = (
        select(CompletionDedupe)
        .where(CompletionDedupe.link_code == code)
        .where(CompletionDedupe.ip_hash == ip_hash)
        .where(CompletionDedupe.ua_hash == ua_hash)
        .where(CompletionDedupe.created_at >= since)
        .limit(1)
    )
    return db.execute(stmt).scalar_one_or_none() is not None


def insert_dedupe(db: Session, click_session_id, code: str, ip_hash: str, ua_hash: str) -> None:
    row = CompletionDedupe(
        click_session_id=click_session_id,
        link_code=code,
        ip_hash=ip_hash,
        ua_hash=ua_hash,
    )
    db.add(row)
