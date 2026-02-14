from __future__ import annotations

import re
from typing import Any

from fastapi import APIRouter, Depends, Query, Request, status
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.services.admin_user_service import ensure_admin_user
from app.services.link_service import create_link_record
from app.services.url_safety import validate_public_destination_url

router = APIRouter()

ALIAS_RE = re.compile(r"^[A-Za-z0-9_-]{4,20}$")


def _error(message: str, status_code: int = 400) -> JSONResponse:
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
):
    if not settings.admin_api_token:
        return _error("API is not configured")

    if api_token != settings.admin_api_token:
        return _error("Invalid API token", status_code=status.HTTP_401_UNAUTHORIZED)

    try:
        safe_url = validate_public_destination_url(destination_url)
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    try:
        final_alias = _validate_alias(alias)
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_400_BAD_REQUEST)

    admin_user = ensure_admin_user(db)

    try:
        link = create_link_record(
            db,
            user_id=admin_user.id,
            destination_url=safe_url,
            tier="standard",
            alias=final_alias,
        )
    except ValueError as exc:
        return _error(str(exc), status_code=status.HTTP_409_CONFLICT)
    except RuntimeError as exc:
        return _error(str(exc), status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)

    short_url = f"{settings.public_web_base_url.rstrip('/')}/{link.code}"

    if output_format == "text":
        return PlainTextResponse(content=short_url)

    return {
        "status": "success",
        "message": "Short link created successfully",
        "shortenedUrl": short_url,
        "url": link.destination_url,
        "alias": link.code,
    }


@router.get("/api")
def public_api_get(
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
        return _error("Missing required query param: api")
    if not url:
        return _error("Missing required query param: url")

    return _create_short_link(
        api_token=api,
        destination_url=url,
        alias=alias,
        output_format=output_format,
        db=db,
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
        return _error("Missing required param: api")
    if not destination_url:
        return _error("Missing required param: url")

    return _create_short_link(
        api_token=api_token,
        destination_url=destination_url,
        alias=str(alias) if alias is not None else None,
        output_format=output_format,
        db=db,
    )
