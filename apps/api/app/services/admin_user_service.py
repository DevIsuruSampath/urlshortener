from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password
from app.db.models.app_setting import AppSetting
from app.db.models.user import User
from app.services.admin_recovery_service import issue_recovery_codes

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


def get_primary_admin_user(db: Session) -> User | None:
    return db.execute(select(User).order_by(User.created_at.asc())).scalars().first()


def is_admin_initialized(db: Session) -> bool:
    try:
        setting = db.get(AppSetting, ADMIN_INITIALIZED_KEY)
    except SQLAlchemyError:
        # Compatibility fallback for databases not yet migrated.
        return get_primary_admin_user(db) is not None

    if setting:
        return setting.value.strip().lower() == "true"

    return get_primary_admin_user(db) is not None


def create_admin_user_once(db: Session, *, email: str, password: str) -> tuple[User, list[str]]:
    if is_admin_initialized(db) or get_primary_admin_user(db):
        raise ValueError("Admin already initialized")

    normalized_email = email.strip().lower()
    if not normalized_email:
        raise ValueError("Email is required")

    user = User(email=normalized_email, password_hash=hash_password(password))
    db.add(user)
    db.flush()

    recovery_codes = issue_recovery_codes(db, user, count=10)
    _set_admin_initialized(db, True)

    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise ValueError("Admin already initialized") from exc

    db.refresh(user)
    return user, recovery_codes


def ensure_admin_user(db: Session) -> User:
    user = get_primary_admin_user(db)
    if user:
        _set_admin_initialized(db, True)
        try:
            db.commit()
        except IntegrityError:
            db.rollback()
        return user

    # Compatibility path for old env-only setups.
    fallback_email = admin_email()
    user = User(email=fallback_email, password_hash=_resolved_admin_password_hash())
    db.add(user)
    _set_admin_initialized(db, True)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
    else:
        db.refresh(user)
        return user

    existing = get_primary_admin_user(db)
    if not existing:
        raise RuntimeError("Failed to provision admin user")
    return existing
