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


def _encode(payload: dict[str, Any], expires_minutes: int) -> str:
    now = datetime.now(UTC)
    data = payload.copy()
    data.update({"iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=expires_minutes)).timestamp())})
    return jwt.encode(data, settings.jwt_secret, algorithm=settings.jwt_alg)


def _decode(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_alg])


def create_access_token(user_id: str) -> str:
    return _encode({"typ": "access", "sub": user_id}, settings.access_token_expire_minutes)


def decode_access_token(token: str) -> dict[str, Any]:
    payload = _decode(token)
    if payload.get("typ") != "access":
        raise JWTError("invalid token type")
    return payload


def sign_session_token(session_id: str, code: str, publisher_id: str, total_steps: int) -> str:
    return _encode(
        {
            "typ": "session",
            "sid": session_id,
            "code": code,
            "pid": publisher_id,
            "steps": total_steps,
        },
        settings.session_token_expire_minutes,
    )


def verify_session_token(token: str, session_id: str) -> dict[str, Any]:
    payload = _decode(token)
    if payload.get("typ") != "session" or payload.get("sid") != session_id:
        raise JWTError("invalid session token")
    return payload


def sign_redirect_token(session_id: str) -> str:
    return _encode({"typ": "redirect", "sid": session_id}, settings.redirect_token_expire_minutes)


def verify_redirect_token(token: str) -> dict[str, Any]:
    payload = _decode(token)
    if payload.get("typ") != "redirect":
        raise JWTError("invalid redirect token")
    return payload
