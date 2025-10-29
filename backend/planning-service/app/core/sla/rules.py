"""Pure helper functions for SLA calculations."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from app.db.models.sla import SLAState


DEFAULT_WARN_RATIO = 0.8


def _ensure_timezone(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def compute_due(started_at: datetime, target_hours: int) -> datetime:
    """Return the due date for the SLA window.

    Args:
        started_at: When the SLA tracking started.
        target_hours: Number of hours granted to complete the stage.
    """
    if target_hours is None:
        raise ValueError("target_hours is required to compute due date")
    normalized_start = _ensure_timezone(started_at)
    return normalized_start + timedelta(hours=target_hours)


def classify(
    now: datetime,
    started_at: datetime,
    due_at: datetime,
    warn_threshold_hours: Optional[int] = None,
    breach_threshold_hours: Optional[int] = None,
) -> SLAState:
    """Classify the SLA state based on elapsed time.

    The algorithm compares the elapsed hours against warning and breach
    thresholds. When thresholds are not provided, reasonable defaults are
    derived from the computed due date.
    """
    normalized_now = _ensure_timezone(now)
    normalized_start = _ensure_timezone(started_at)
    normalized_due = _ensure_timezone(due_at)

    elapsed_hours = (normalized_now - normalized_start).total_seconds() / 3600
    total_hours = (normalized_due - normalized_start).total_seconds() / 3600

    breach_limit = breach_threshold_hours or total_hours
    warn_limit = warn_threshold_hours or int(total_hours * DEFAULT_WARN_RATIO)

    if elapsed_hours >= breach_limit or normalized_now >= normalized_due:
        return SLAState.breach
    if elapsed_hours >= warn_limit:
        return SLAState.warn
    return SLAState.ok
