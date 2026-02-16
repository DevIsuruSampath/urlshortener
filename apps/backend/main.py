"""
Multi-Step URL Shortener API
FastAPI + SQLAlchemy + SQLite
"""

from __future__ import annotations

import string
import random
import uuid
from datetime import datetime, UTC
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from sqlalchemy import Column, String, Integer, Boolean, DateTime, create_engine, event
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


# ── Database Setup ──────────────────────────────────────────────

DATABASE_URL = "sqlite:///./shortener.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Enable WAL mode + foreign keys for SQLite
@event.listens_for(engine, "connect")
def _set_sqlite_pragma(dbapi_conn, _):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


# ── Models ──────────────────────────────────────────────────────

class Link(Base):
    __tablename__ = "links"

    short_code = Column(String(6), primary_key=True, index=True)
    original_url = Column(String(2048), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(UTC), nullable=False)


class VisitorSession(Base):
    __tablename__ = "visitor_sessions"

    session_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    short_code = Column(String(6), nullable=False, index=True)
    current_step = Column(Integer, default=0, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)


# ── Schemas ─────────────────────────────────────────────────────

class LinkCreateIn(BaseModel):
    url: HttpUrl


class LinkCreateOut(BaseModel):
    short_code: str
    original_url: str
    short_url: str
    created_at: datetime


class SessionStartOut(BaseModel):
    session_id: str
    short_code: str
    current_step: int
    message: str


class StepCompleteIn(BaseModel):
    session_id: str
    step_number: int


class StepCompleteOut(BaseModel):
    session_id: str
    current_step: int
    message: str


class VerifyOut(BaseModel):
    session_id: str
    original_url: str
    is_verified: bool
    message: str


class ErrorOut(BaseModel):
    detail: str


# ── Dependencies ────────────────────────────────────────────────

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Helpers ─────────────────────────────────────────────────────

ALPHABET = string.ascii_letters + string.digits
TOTAL_STEPS = 3


def generate_short_code(db: Session, length: int = 6, max_attempts: int = 20) -> str:
    """Generate a unique 6-char code. Retries on collision."""
    for _ in range(max_attempts):
        code = "".join(random.choices(ALPHABET, k=length))
        existing = db.query(Link).filter(Link.short_code == code).first()
        if not existing:
            return code
    raise RuntimeError("Failed to generate unique short code after max attempts")


def get_session_or_404(db: Session, session_id: str) -> VisitorSession:
    """Fetch a visitor session or raise 404."""
    session = db.query(VisitorSession).filter(VisitorSession.session_id == session_id).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session '{session_id}' not found",
        )
    return session


def get_link_or_404(db: Session, short_code: str) -> Link:
    """Fetch a link or raise 404."""
    link = db.query(Link).filter(Link.short_code == short_code).first()
    if not link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Short code '{short_code}' not found",
        )
    return link


# ── App ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Multi-Step URL Shortener",
    version="1.0.0",
    description="A multi-step URL shortener with visitor session tracking and step-by-step verification.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ───────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"ok": True}


@app.post("/create", response_model=LinkCreateOut, status_code=status.HTTP_201_CREATED)
def create_link(payload: LinkCreateIn, db: Session = Depends(get_db)):
    """
    Create a shortened link.
    
    Accepts a URL and generates a unique 6-character short code.
    """
    short_code = generate_short_code(db)
    original_url = str(payload.url)

    link = Link(short_code=short_code, original_url=original_url)
    db.add(link)
    db.commit()
    db.refresh(link)

    return LinkCreateOut(
        short_code=link.short_code,
        original_url=link.original_url,
        short_url=f"http://localhost:8000/start/{link.short_code}",
        created_at=link.created_at,
    )


@app.get("/start/{short_code}", response_model=SessionStartOut)
def start_session(short_code: str, db: Session = Depends(get_db)):
    """
    Start a new visitor session for a short code.
    
    Creates a VisitorSession with current_step=0 and returns the session_id.
    The visitor must complete steps 1 → 2 → 3 sequentially before verification.
    """
    link = get_link_or_404(db, short_code)

    visitor = VisitorSession(
        session_id=str(uuid.uuid4()),
        short_code=link.short_code,
        current_step=0,
        is_verified=False,
    )
    db.add(visitor)
    db.commit()
    db.refresh(visitor)

    return SessionStartOut(
        session_id=visitor.session_id,
        short_code=visitor.short_code,
        current_step=visitor.current_step,
        message=f"Session started. Complete steps 1 through {TOTAL_STEPS} to access the link.",
    )


@app.post("/step-complete", response_model=StepCompleteOut)
def step_complete(payload: StepCompleteIn, db: Session = Depends(get_db)):
    """
    Complete a step in the visitor flow.
    
    Rules:
    - Steps must be completed sequentially (1 → 2 → 3).
    - You can only advance to step N if your current_step is N-1.
    - No skipping allowed.
    - Once all steps are complete (step 3), the session is marked as verified.
    """
    visitor = get_session_or_404(db, payload.session_id)

    # Already verified — no more steps
    if visitor.is_verified:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Session already verified. All steps completed.",
        )

    # Step must be within valid range
    if payload.step_number < 1 or payload.step_number > TOTAL_STEPS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid step. Must be between 1 and {TOTAL_STEPS}.",
        )

    # Prevent skipping: only allow advancing by exactly 1
    expected_step = visitor.current_step + 1
    if payload.step_number != expected_step:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot complete step {payload.step_number}. "
                   f"You are on step {visitor.current_step}, expected step {expected_step}.",
        )

    # Advance the step
    visitor.current_step = payload.step_number

    # If final step reached, mark as verified
    if visitor.current_step >= TOTAL_STEPS:
        visitor.is_verified = True
        message = "All steps completed! Session verified. Use /verify to get the original URL."
    else:
        message = f"Step {payload.step_number} completed. Next: step {payload.step_number + 1}."

    db.commit()
    db.refresh(visitor)

    return StepCompleteOut(
        session_id=visitor.session_id,
        current_step=visitor.current_step,
        message=message,
    )


@app.get(
    "/verify/{session_id}",
    response_model=VerifyOut,
    responses={403: {"model": ErrorOut}},
)
def verify_session(session_id: str, db: Session = Depends(get_db)):
    """
    Verify a session and retrieve the original URL.
    
    Only succeeds if the visitor has completed all 3 steps (current_step == 3).
    Otherwise returns a 403 error.
    """
    visitor = get_session_or_404(db, session_id)

    if visitor.current_step < TOTAL_STEPS or not visitor.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Verification failed. You are on step {visitor.current_step}/{TOTAL_STEPS}. "
                   f"Complete all steps first.",
        )

    link = get_link_or_404(db, visitor.short_code)

    return VerifyOut(
        session_id=visitor.session_id,
        original_url=link.original_url,
        is_verified=True,
        message="Verified! Here is your original URL.",
    )


# ── Run ─────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
