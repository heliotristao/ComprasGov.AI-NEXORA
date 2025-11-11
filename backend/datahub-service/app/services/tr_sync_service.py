import logging
from datetime import datetime
from typing import Any, Dict
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.tr_sync_record import TRSyncRecord
from app.db.session import SessionLocal

logger = logging.getLogger(__name__)


class TRSyncService:
    """Persist TR snapshots received from external services."""

    def __init__(self, session_factory=SessionLocal, *, close_session: bool = True):
        self._session_factory = session_factory
        self._close_session = close_session

    def sync_from_event(self, payload: Dict[str, Any]) -> None:
        session: Session = self._session_factory()
        try:
            tr_id = UUID(str(payload["id"]))
            record = session.get(TRSyncRecord, tr_id)
            if record is None:
                record = TRSyncRecord(id=tr_id)
                session.add(record)

            record.etp_id = UUID(str(payload["etp_id"]))
            record.title = payload.get("title", "")
            record.type = payload.get("type", "")
            record.status = payload.get("status", "")
            record.step = int(payload.get("step", 0))
            record.data = payload.get("data", {})
            record.gaps = payload.get("gaps", {})
            record.created_by = payload.get("created_by", "")
            created_at_raw = payload.get("created_at")
            if created_at_raw:
                record.source_created_at = _parse_datetime(created_at_raw)

            session.commit()
        except Exception:
            session.rollback()
            logger.exception("Failed to sync TR event", extra={"payload": payload})
            raise
        finally:
            if self._close_session:
                session.close()


def _parse_datetime(value: Any) -> datetime:
    if isinstance(value, datetime):
        return value
    value = str(value)
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    return datetime.fromisoformat(value)
