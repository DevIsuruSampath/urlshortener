import uuid
from datetime import datetime

from sqlalchemy import DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CompletionDedupe(Base):
    __tablename__ = "completion_dedupes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    click_session_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), unique=True, index=True)
    link_code: Mapped[str] = mapped_column(String(32), index=True)
    ip_hash: Mapped[str] = mapped_column(String(64), index=True)
    ua_hash: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)


Index("ix_dedupe_lookup", CompletionDedupe.link_code, CompletionDedupe.ip_hash, CompletionDedupe.ua_hash)
