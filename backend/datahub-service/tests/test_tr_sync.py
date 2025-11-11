import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.db.models.tr_sync_record import TRSyncRecord
from app.services.tr_sync_service import TRSyncService


def _sample_event() -> dict:
    return {
        "id": str(uuid.uuid4()),
        "etp_id": str(uuid.uuid4()),
        "title": "TR Example",
        "type": "bem",
        "status": "draft",
        "step": 1,
        "data": {"foo": "bar"},
        "gaps": {},
        "created_by": "user-123",
        "created_at": datetime.now(tz=timezone.utc).isoformat(),
    }


def test_tr_sync_service_upserts_records(db: Session) -> None:
    service = TRSyncService(session_factory=lambda: db, close_session=False)
    event = _sample_event()

    service.sync_from_event(event)

    record = db.get(TRSyncRecord, uuid.UUID(event["id"]))
    assert record is not None
    assert record.title == "TR Example"
    assert record.data == {"foo": "bar"}

    event["title"] = "TR Updated"
    event["data"] = {"foo": "baz"}

    service.sync_from_event(event)

    db.refresh(record)
    assert record.title == "TR Updated"
    assert record.data == {"foo": "baz"}
