from __future__ import annotations

from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

# Keep bcrypt support for existing hashes, but default to pbkdf2_sha256 for stability.
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def _encode(payload: dict[str, Any], expires_minutes: int, secret: str) -> str:
    now = datetime.now(UTC)
    data = payload.copy()
    data.update({"iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=expires_minutes)).timestamp())})
    return jwt.encode(data, secret, algorithm=settings.jwt_alg)


def _decode(token: str, secret: str) -> dict[str, Any]:
    return jwt.decode(token, secret, algorithms=[settings.jwt_alg])


def create_access_token(user_id: str) -> str:
    return _encode({"typ": "access", "sub": user_id}, settings.access_token_expire_minutes, settings.admin_jwt_secret)


def decode_access_token(token: str) -> dict[str, Any]:
    payload = _decode(token, settings.admin_jwt_secret)
    if payload.get("typ") != "access":
        raise JWTError("invalid token type")
    return payload
