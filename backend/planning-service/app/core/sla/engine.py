"""SLA evaluation engine."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Iterable, List

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.notifications.service import send_state_change_notification
from app.core.sla.rules import compute_due, classify
from app.db.models.sla import SLASetting, SLAStatus


def _now() -> datetime:
    return datetime.now(timezone.utc)


def evaluate_sla_for_open_processes(db: Session) -> List[SLAStatus]:
    """Evaluate SLA state for all in-flight processes and persist the result."""
    results: List[SLAStatus] = []
    open_statuses: Iterable[SLAStatus] = db.scalars(
        select(SLAStatus).where(SLAStatus.completed_at.is_(None))
    )

    current_time = _now()

    for status in open_statuses:
        setting = db.scalar(
            select(SLASetting).where(
                SLASetting.process_type == status.process_type,
                SLASetting.stage == status.stage,
            )
        )
        if not setting:
            continue

        due_at = compute_due(status.started_at, setting.target_hours)
        status.due_at = due_at

        new_state = classify(
            now=current_time,
            started_at=status.started_at,
            due_at=due_at,
            warn_threshold_hours=setting.warn_threshold_hours,
            breach_threshold_hours=setting.breach_threshold_hours,
        )

        if new_state != status.state:
            status.state = new_state
            status.last_transition_at = current_time
            status.updated_at = current_time
            if send_state_change_notification(status, setting):
                status.last_notified_state = status.state
        else:
            status.updated_at = current_time

        results.append(status)
        db.add(status)

    db.commit()
    return results
