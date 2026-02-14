from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


class SecurityEventOut(BaseModel):
    id: str
    event_type: str
    actor_user_id: str | None = None
    ip_address: str | None = None
    details: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime


class SecurityEventCreateIn(BaseModel):
    event_type: Literal["settings_changed", "link_blocked", "link_unblocked"]
    details: dict[str, Any] = Field(default_factory=dict)
