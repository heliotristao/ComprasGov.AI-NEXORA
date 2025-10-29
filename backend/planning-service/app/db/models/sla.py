"""SQLAlchemy models for SLA settings and status tracking."""
from __future__ import annotations

import enum

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Index,
    Integer,
    String,
    UniqueConstraint,
    func,
)

from app.db.base import Base


class SLAState(enum.Enum):
    ok = "ok"
    warn = "warn"
    breach = "breach"


class SLASetting(Base):
    __tablename__ = "sla_settings"

    id = Column(Integer, primary_key=True, index=True)
    process_type = Column(String(100), nullable=False)
    stage = Column(String(100), nullable=False)
    target_hours = Column(Integer, nullable=False)
    warn_threshold_hours = Column(Integer, nullable=True)
    breach_threshold_hours = Column(Integer, nullable=True)
    escalation_role = Column(String(100), nullable=True)
    notification_channel = Column(String(32), nullable=False, default="email")
    webhook_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        UniqueConstraint("process_type", "stage", name="uq_sla_settings_process_stage"),
    )


class SLAStatus(Base):
    __tablename__ = "sla_status"

    id = Column(Integer, primary_key=True, index=True)
    process_id = Column(String(64), nullable=False)
    process_type = Column(String(100), nullable=False)
    stage = Column(String(100), nullable=False)
    state = Column(Enum(SLAState, name="sla_state"), nullable=False, default=SLAState.ok)
    started_at = Column(DateTime(timezone=True), nullable=False)
    due_at = Column(DateTime(timezone=True), nullable=True)
    last_transition_at = Column(DateTime(timezone=True), nullable=True)
    last_notified_state = Column(Enum(SLAState, name="sla_notified_state"), nullable=True)
    primary_contact = Column(String(255), nullable=True)
    escalation_contact = Column(String(255), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    __table_args__ = (
        Index("ix_sla_status_process", "process_type", "process_id", "stage"),
        Index("ix_sla_status_state", "state"),
    )
