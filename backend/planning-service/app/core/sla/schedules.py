"""Background scheduler configuration for SLA evaluation."""
from __future__ import annotations

import os
from typing import Optional

try:
    from apscheduler.schedulers.background import BackgroundScheduler
except ModuleNotFoundError:  # pragma: no cover
    class BackgroundScheduler:  # type: ignore[override]
        """Minimal fallback scheduler used when APScheduler is unavailable."""

        def __init__(self) -> None:
            self.jobs = []
            self.running = False

        def add_job(self, func, *_, **__):
            self.jobs.append(func)

        def start(self) -> None:
            self.running = True

        def shutdown(self) -> None:
            self.running = False

from app.core.sla.engine import evaluate_sla_for_open_processes
from app.db.session import SessionLocal


_scheduler: Optional[BackgroundScheduler] = None


def _run_sla_job() -> None:
    db = SessionLocal()
    try:
        evaluate_sla_for_open_processes(db)
    finally:
        db.close()


def start_sla_scheduler() -> None:
    """Start the SLA scheduler if not disabled via environment variable."""
    global _scheduler
    if os.getenv("DISABLE_SLA_SCHEDULER") == "1":
        return

    if _scheduler and _scheduler.running:
        return

    _scheduler = BackgroundScheduler()
    _scheduler.add_job(
        _run_sla_job,
        "interval",
        minutes=5,
        id="sla-evaluation",
        replace_existing=True,
    )
    _scheduler.start()


def shutdown_sla_scheduler() -> None:
    global _scheduler
    if _scheduler and _scheduler.running:
        _scheduler.shutdown()
        _scheduler = None
