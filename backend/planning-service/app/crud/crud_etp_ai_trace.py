from sqlalchemy.orm import Session
from app.models.etp_ai_trace import ETPAITrace
from app.schemas.etp_ai_trace_schemas import ETPAITraceCreate


def create_trace(db: Session, *, trace_in: ETPAITraceCreate) -> ETPAITrace:
    """
    Create a new ETP AI trace.
    """
    db_obj = ETPAITrace(**trace_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_last_trace(db: Session, *, etp_id: int, field: str) -> ETPAITrace:
    """
    Get the last ETP AI trace for a specific field.
    """
    return db.query(ETPAITrace).filter(ETPAITrace.etp_id == etp_id, ETPAITrace.field == field).order_by(ETPAITrace.created_at.desc()).first()
