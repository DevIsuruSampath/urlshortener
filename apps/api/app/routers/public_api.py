from __future__ import annotations

import re
import secrets
from typing import Any

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse, Response
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import allow_ip_action
from app.db.session import get_db
from app.services.admin_api_token_service import get_admin_api_tokens
from app.services.admin_user_service import get_primary_admin_user, is_admin_initialized
from app.services.link_service import create_link_record
from app.services.security_event_service import log_security_event
from app.services.url_safety import validate_public_destination_url

router = APIRouter()

ALIAS_RE = re.compile(r"^[A-Za-z0-9_-]{4,20}$")


def _client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return request.client.host if request.client else "0.0.0.0"


def _error(message: str, status_code: int = 400, output_format: str = "json") -> Response:
    if output_format == "text":
        # GPLinks-compatible behavior for text clients: empty body on error.
        return Response(status_code=status_code, content="")

    return JSONResponse(status_code=status_code, content={"status": "error", "message": message})


def _normalized_format(value: str | None) -> str:
    fmt = (value or "json").strip().lower()
    if fmt not in {"json", "text"}:
        raise ValueError("format must be 'json' or 'text'")
    return fmt


def _validate_alias(alias: str | None) -> str | None:
    if alias is None:
        return None

    value = alias.strip()
    if not value:
        return None

    if not ALIAS_RE.fullmatch(value):
        raise ValueError("alias must be 4-20 chars: letters, numbers, _ or -")

    return value


def _create_short_link(
    *,
    api_token: str,
    destination_url: str,
    alias: str | None,
    output_format: str,
    db: Session,
    request: Request,
):
    if settings.dev_api_rate_limit_per_minute > 0:
        ip = _client_ip(request)
        if not allow_ip_action(ip, "developer-api", settings.dev_api_rate_limit_per_minute, window_seconds=60):
            return _error("Too many API requests", status_code=status.HTTP_429_TOO_MANY_REQUESTS, output_format=output_format)

    tokens = get_admin_api_tokens(db)
    if not tokens:
        return _error("API is not configured", output_format=output_format)

    if not any(secrets.compare_digest(api_token, token) for token in tokens):
        return _error("Invalid API token", status_code=status.HTTP_401_UNAUTHORIZED, output_format=output_format)

    try:
        safe_url = validate_public_destination_url(destination_url)
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST, output_format=output_format)

    try:
        final_alias = _validate_alias(alias)
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST, output_format=output_format)

    if not is_admin_initialized(db):
        return _error("Admin setup is required", status_code=status.HTTP_403_FORBIDDEN, output_format=output_format)

    admin_user = get_primary_admin_user(db)
    if not admin_user:
        return _error("Admin user not found", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, output_format=output_format)

    try:
        link = create_link_record(
            db,
            user_id=admin_user.id,
            destination_url=safe_url,
            tier="standard",
            alias=final_alias,
        )
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_409_CONFLICT, output_format=output_format)
    except RuntimeError as exc:
        return _error(str(exc), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, output_format=output_format)

    short_url = f"{settings.public_web_base_url.rstrip('/')}/{link.code}"

    try:
        log_security_event(
            db,
            event_type="developer_api_token_used",
            actor_user_id=admin_user.id,
            ip_address=_client_ip(request),
            details={
                "format": output_format,
                "alias": final_alias or "",
                "code": link.code,
                "token_suffix": api_token[-4:] if len(api_token) >= 4 else api_token,
            },
            commit=True,
        )
    except Exception:
        db.rollback()

    if output_format == "text":
        return PlainTextResponse(content=short_url)

    return {"status": "success", "shortenedUrl": short_url}


@router.get("/api")
def public_api_get(
    request: Request,
    api: str = Query(default=""),
    url: str = Query(default=""),
    alias: str | None = Query(default=None),
    format: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    try:
        output_format = _normalized_format(format)
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    if not api:
        return _error("Missing required query param: api", output_format=output_format)
    if not url:
        return _error("Missing required query param: url", output_format=output_format)

    return _create_short_link(
        api_token=api,
        destination_url=url,
        alias=alias,
        output_format=output_format,
        db=db,
        request=request,
    )


async def _parse_post_payload(request: Request) -> dict[str, Any]:
    ctype = (request.headers.get("content-type") or "").lower()

    if "application/json" in ctype:
        try:
            payload = await request.json()
        except ValueError:
            return {}
        return payload if isinstance(payload, dict) else {}

    if "application/x-www-form-urlencoded" in ctype or "multipart/form-data" in ctype:
        form = await request.form()
        return {k: str(v) for k, v in form.items()}

    return {}


@router.post("/api")
async def public_api_post(request: Request, db: Session = Depends(get_db)):
    body = await _parse_post_payload(request)
    query = request.query_params

    api_token = str(query.get("api") or body.get("api") or "").strip()
    destination_url = str(query.get("url") or body.get("url") or "").strip()
    alias = query.get("alias") or body.get("alias")

    try:
        output_format = _normalized_format((query.get("format") or body.get("format") or "json"))
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    if not api_token:
        return _error("Missing required param: api", output_format=output_format)
    if not destination_url:
        return _error("Missing required param: url", output_format=output_format)

    return _create_short_link(
        api_token=api_token,
        destination_url=destination_url,
        alias=str(alias) if alias is not None else None,
        output_format=output_format,
        db=db,
        request=request,
    )
