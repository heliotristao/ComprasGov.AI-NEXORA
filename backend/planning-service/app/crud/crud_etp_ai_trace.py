from sqlalchemy.orm import Session
from app.db.models.etp_ai_trace import ETPAITrace
from app.schemas.etp_ai_trace_schemas import ETPAITraceCreate

def create_trace(db: Session, trace_in: ETPAITraceCreate) -> ETPAITrace:
    """
    Creates a new ETP AI trace record in the database.
    """
    trace = ETPAITrace(**trace_in.dict())
    db.add(trace)
    db.commit()
    db.refresh(trace)
    return trace
