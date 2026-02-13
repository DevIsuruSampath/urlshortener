from __future__ import annotations

from fastapi import Cookie, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import decode_access_token
from app.db.models.user import User
from app.db.session import get_db

bearer = HTTPBearer(auto_error=False)


def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer),
    admin_session: str | None = Cookie(default=None, alias=settings.admin_session_cookie_name),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials if credentials else admin_session
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing admin session")

    try:
        payload = decode_access_token(token)
        user_id = payload.get("sub")
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid admin token") from exc

    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Admin user not found")
    return user


# Compatibility alias for existing routers.
get_current_user = get_current_admin
