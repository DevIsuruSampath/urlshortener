from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from jose import JWTError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import allow_ip_action
from app.core.security import sign_redirect_token, verify_redirect_token, verify_session_token
from app.db.models.click_session import ClickSession
from app.db.models.link import Link
from app.db.session import get_db
from app.schemas.flow import StepCompleteIn, StepCompleteOut
from app.services.fraud_service import has_recent_dedupe, insert_dedupe
from app.services.session_service import build_interstitial_url

router = APIRouter()


def client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


@router.post("/step-complete", response_model=StepCompleteOut)
def step_complete(payload: StepCompleteIn, request: Request, db: Session = Depends(get_db)):
    ip = client_ip(request)
    if not allow_ip_action(ip, "step-complete", settings.step_rate_limit_per_minute, window_seconds=60):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")

    try:
        token_payload = verify_session_token(payload.token, payload.session_id)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token") from exc

    session = db.get(ClickSession, payload.session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    if payload.step < 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Step must be >= 1")

    try:
        token_steps = int(token_payload.get("steps") or 0)
    except (TypeError, ValueError):
        token_steps = 0

    if (
        token_payload.get("code") != session.code
        or str(token_payload.get("pid")) != str(session.publisher_id)
        or token_steps != int(session.total_steps)
    ):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session token")

    if session.status != "pending":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Session already completed")

    expected_step = session.current_step + 1
    if payload.step != expected_step:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Invalid step progression. Expected step {expected_step}")

    if expected_step > session.total_steps:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Step out of range")

    now = datetime.now(UTC)
    min_wait = settings.first_step_min_seconds if expected_step == 1 else settings.next_step_min_seconds
    elapsed = (now - session.step_started_at).total_seconds()
    if elapsed < min_wait:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Minimum wait not met ({min_wait}s)")

    requires_captcha = bool(session.suspicious or expected_step >= session.total_steps)
    if requires_captcha and not payload.captcha_token:
        return StepCompleteOut(done=False, requires_captcha=True, message="Captcha required")

    session.current_step = expected_step
    session.step_started_at = now

    if expected_step < session.total_steps:
        db.add(session)
        db.commit()
        next_step = expected_step + 1
        next_url = build_interstitial_url(
            code=session.code,
            publisher_id=str(session.publisher_id),
            session_id=str(session.id),
            total_steps=session.total_steps,
            st=payload.token,
            step=next_step,
        )
        return StepCompleteOut(done=False, next_step=next_step, next_step_url=next_url)

    # last step completed
    deduped = has_recent_dedupe(db, session.code, session.ip_hash, session.ua_hash, hours=24)
    session.payable = not deduped
    session.status = "ready"

    db.add(session)
    db.commit()

    rt = sign_redirect_token(str(session.id))
    redirect_url = f"{settings.public_api_base_url.rstrip('/')}/flow/go?rt={rt}"
    return StepCompleteOut(done=True, redirect_url=redirect_url)


@router.get("/go")
def go(rt: str, db: Session = Depends(get_db)):
    try:
        payload = verify_redirect_token(rt)
    except JWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid redirect token") from exc

    session_id = payload.get("sid")
    session = db.get(ClickSession, session_id)
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    link = db.get(Link, session.link_id)
    if not link or not link.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found")

    if session.status not in {"ready", "completed"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Session is not ready for redirect")

    if session.status != "completed":
        if session.payable:
            # Insert dedupe marker at finalization to prevent future payable duplicates
            if not has_recent_dedupe(db, session.code, session.ip_hash, session.ua_hash, hours=24):
                insert_dedupe(db, session.id, session.code, session.ip_hash, session.ua_hash)
            else:
                session.payable = False

        session.status = "completed"
        session.completed_at = datetime.now(UTC)
        db.add(session)
        db.commit()

    return RedirectResponse(url=link.destination_url, status_code=302)
