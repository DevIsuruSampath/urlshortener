from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.models.app_setting import AppSetting
from app.db.models.user import User

ADMIN_INITIALIZED_KEY = "admin_initialized"


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


def _set_admin_initialized(db: Session, initialized: bool = True) -> None:
    value = "true" if initialized else "false"
    row = db.get(AppSetting, ADMIN_INITIALIZED_KEY)
    if row:
        row.value = value
    else:
        db.add(AppSetting(key=ADMIN_INITIALIZED_KEY, value=value))

    try:
        db.commit()
    except IntegrityError:
        db.rollback()


def is_admin_initialized(db: Session) -> bool:
    try:
        setting = db.get(AppSetting, ADMIN_INITIALIZED_KEY)
    except SQLAlchemyError:
        # Compatibility fallback for databases not yet migrated.
        existing = db.execute(select(User).where(User.email == admin_email())).scalar_one_or_none()
        return existing is not None

    if setting:
        return setting.value.strip().lower() == "true"

    existing = db.execute(select(User).where(User.email == admin_email())).scalar_one_or_none()
    return existing is not None


def ensure_admin_user(db: Session) -> User:
    email = admin_email()
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if user:
        _set_admin_initialized(db, True)
        return user

    user = User(email=email, password_hash=_resolved_admin_password_hash())
    db.add(user)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    else:
        db.refresh(user)
        _set_admin_initialized(db, True)
        return user

    existing = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
    if not existing:
        raise RuntimeError("Failed to provision admin user")

    _set_admin_initialized(db, True)
    return existing
