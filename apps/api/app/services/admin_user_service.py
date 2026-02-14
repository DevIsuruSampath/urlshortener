from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.models.user import User


def admin_email() -> str:
    username = (settings.admin_username or "admin").strip().lower().replace(" ", "_")
    if not username:
        username = "admin"
    return f"{username}@admin.local"


def _resolved_admin_password_hash() -> str:
    if settings.admin_password_hash:
        return settings.admin_password_hash
    if settings.admin_password:
        return hash_password(settings.admin_password)
    return hash_password("change_this_admin_password")


def ensure_admin_user(db: Session) -> User:
    email = admin_email()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user:
        return user

    user = User(email=email, password_hash=_resolved_admin_password_hash())
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    else:
        db.refresh(user)
        return user

    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not existing:
        raise RuntimeError("Failed to provision admin user")
    return existing
