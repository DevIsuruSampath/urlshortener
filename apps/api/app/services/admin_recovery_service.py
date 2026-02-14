from __future__ import annotations

import secrets
import string
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password
from app.db.models.admin_recovery_code import AdminRecoveryCode
from app.db.models.user import User

RECOVERY_CODE_ALPHABET = string.ascii_uppercase + string.digits
RECOVERY_CODE_SEGMENT_LEN = 4
RECOVERY_CODE_SEGMENTS = 3


def _normalize_code(code: str) -> str:
    return "".join((code or "").strip().upper().split("-"))


def _format_code(raw: str) -> str:
    size = RECOVERY_CODE_SEGMENT_LEN
    return "-".join(raw[i : i + size] for i in range(0, len(raw), size))


def generate_recovery_code() -> str:
    raw_len = RECOVERY_CODE_SEGMENT_LEN * RECOVERY_CODE_SEGMENTS
    raw = "".join(secrets.choice(RECOVERY_CODE_ALPHABET) for _ in range(raw_len))
    return _format_code(raw)


def generate_recovery_codes(count: int = 10) -> list[str]:
    seen: set[str] = set()
    codes: list[str] = []
    while len(codes) < count:
        code = generate_recovery_code()
        if code in seen:
            continue
        seen.add(code)
        codes.append(code)
    return codes


def issue_recovery_codes(db: Session, user: User, count: int = 10) -> list[str]:
    codes = generate_recovery_codes(count)

    rows = [
        AdminRecoveryCode(user_id=user.id, code_hash=hash_password(_normalize_code(code)))
        for code in codes
    ]
    db.add_all(rows)
    return codes


def consume_recovery_code(db: Session, user: User, provided_code: str) -> bool:
    normalized = _normalize_code(provided_code)
    if not normalized:
        return False

    rows = db.execute(
        select(AdminRecoveryCode)
        .where(AdminRecoveryCode.user_id == user.id)
        .where(AdminRecoveryCode.used_at.is_(None))
        .order_by(AdminRecoveryCode.created_at.asc())
    ).scalars().all()

    for row in rows:
        if verify_password(normalized, row.code_hash):
            row.used_at = datetime.now(UTC)
            return True

    return False
