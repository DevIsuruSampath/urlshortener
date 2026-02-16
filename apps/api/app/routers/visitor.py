"""
Visitor flow endpoints for the new ScrollWall-based interstitial.

Endpoints:
    POST /visitor/step-complete  — Complete a step (anti-skip)
    GET  /visitor/verify/{session_id} — Get original URL if all steps done
"""

from __future__ import annotations

from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.rate_limit import allow_ip_action
from app.db.models.click_session import ClickSession
from app.db.models.link import Link
from app.db.session import get_db
from app.services.fraud_service import has_recent_dedupe, insert_dedupe

router = APIRouter()


# ── Schemas ─────────────────────────────────────────────────────

class StepCompleteIn(BaseModel):
    session_id: str
    step_number: int


class StepCompleteOut(BaseModel):
    session_id: str
    current_step: int
    total_steps: int
    done: bool
    message: str


class VerifyOut(BaseModel):
    session_id: str
    original_url: str
    is_verified: bool
    message: str


# ── Helpers ─────────────────────────────────────────────────────

def _client_ip(request: Request) -> str:
    xfwd = request.headers.get("x-forwarded-for")
    if xfwd:
        return xfwd.split(",")[0].strip()
    return (request.client.host if request.client else "0.0.0.0")


def _get_session_or_404(db: Session, session_id: str) -> ClickSession:
    session = db.get(ClickSession, session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found",
        )
    return session


# ── Endpoints ───────────────────────────────────────────────────

@router.post("/step-complete", response_model=StepCompleteOut)
def step_complete(payload: StepCompleteIn, request: Request, db: Session = Depends(get_db)):
    """
    Complete a step in the visitor flow.
    
    Rules:
    - Steps must be completed sequentially (1 → 2 → 3).
    - You can only advance to step N if current_step is N-1.
    - No skipping allowed.
    """
    ip = _client_ip(request)
    if not allow_ip_action(ip, "step-complete", settings.step_rate_limit_per_minute, window_seconds=60):
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Rate limit exceeded")

    session = _get_session_or_404(db, payload.session_id)

    # Already completed
    if session.status == "completed":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session already completed.",
        )

    # Validate step range
    if payload.step_number < 1 or payload.step_number > session.total_steps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid step. Must be between 1 and {session.total_steps}.",
        )

    # Anti-skip: only allow advancing by exactly 1
    expected_step = session.current_step + 1
    if payload.step_number != expected_step:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot complete step {payload.step_number}. "
                   f"You are on step {session.current_step}, expected step {expected_step}.",
        )

    # Enforce minimum wait time
    now = datetime.now(UTC)
    min_wait = settings.first_step_min_seconds if expected_step == 1 else settings.next_step_min_seconds
    elapsed = (now - session.step_started_at).total_seconds()
    if elapsed < min_wait:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum wait not met ({min_wait}s). Please wait before continuing.",
        )

    # Advance step
    session.current_step = payload.step_number
    session.step_started_at = now

    # Check if all steps done
    if session.current_step >= session.total_steps:
        # Dedupe check
        deduped = has_recent_dedupe(db, session.code, session.ip_hash, session.ua_hash, hours=24)
        session.payable = not deduped
        session.status = "ready"

        db.commit()
        db.refresh(session)

        return StepCompleteOut(
            session_id=str(session.id),
            current_step=session.current_step,
            total_steps=session.total_steps,
            done=True,
            message="All steps completed! Session verified.",
        )

    db.commit()
    db.refresh(session)

    return StepCompleteOut(
        session_id=str(session.id),
        current_step=session.current_step,
        total_steps=session.total_steps,
        done=False,
        message=f"Step {payload.step_number} completed. Next: step {payload.step_number + 1}.",
    )


@router.get("/verify/{session_id}", response_model=VerifyOut)
def verify_session(session_id: str, db: Session = Depends(get_db)):
    """
    Verify a session and return the original URL.
    
    Only succeeds if all steps have been completed.
    """
    session = _get_session_or_404(db, session_id)

    if session.current_step < session.total_steps or session.status not in {"ready", "completed"}:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Verification failed. You are on step {session.current_step}/{session.total_steps}. "
                   f"Complete all steps first.",
        )

    link = db.get(Link, session.link_id)
    if not link or not link.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Link not found or inactive")

    # Mark as completed if not already
    if session.status != "completed":
        if session.payable:
            if not has_recent_dedupe(db, session.code, session.ip_hash, session.ua_hash, hours=24):
                insert_dedupe(db, session.id, session.code, session.ip_hash, session.ua_hash)
            else:
                session.payable = False

        session.status = "completed"
        session.completed_at = datetime.now(UTC)
        db.commit()

    return VerifyOut(
        session_id=str(session.id),
        original_url=link.destination_url,
        is_verified=True,
        message="Verified! Redirecting to your destination.",
    )
