"""Pydantic schemas for SLA endpoints."""
from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class NotificationChannel(str, Enum):
    email = "email"
    webhook = "webhook"


class SLAStateEnum(str, Enum):
    ok = "ok"
    warn = "warn"
    breach = "breach"


class SLASettingBase(BaseModel):
    process_type: str = Field(..., min_length=1, max_length=100)
    stage: str = Field(..., min_length=1, max_length=100)
    target_hours: int = Field(..., ge=1)
    warn_threshold_hours: Optional[int] = Field(default=None, ge=1)
    breach_threshold_hours: Optional[int] = Field(default=None, ge=1)
    escalation_role: Optional[str] = Field(default=None, max_length=100)
    notification_channel: NotificationChannel = NotificationChannel.email
    webhook_url: Optional[str] = Field(default=None, max_length=255)


class SLASettingCreate(SLASettingBase):
    pass


class SLASettingRead(SLASettingBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SLAStatusRead(BaseModel):
    id: int
    process_id: str
    process_type: str
    stage: str
    state: SLAStateEnum
    started_at: datetime
    due_at: Optional[datetime] = None
    last_transition_at: Optional[datetime] = None
    last_notified_state: Optional[SLAStateEnum] = None
    primary_contact: Optional[str] = None
    escalation_contact: Optional[str] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SLARunResponse(BaseModel):
    evaluated: int
    states: list[SLAStatusRead]
