# app/services/etp_accept_ia_service.py
from uuid import UUID
from sqlalchemy.orm import Session
from app import crud
from app.db import models
from app.core.exceptions import ETPNotFoundException, TraceNotFoundException
from app.schemas.etp_accept_ia import ETPAcceptanceLogSchema
from sqlalchemy.orm import Session, joinedload
from app.db.models.etp_section_accepts import ETPSectionAccepts
from app.db.models.etp import ETP
from app.db.models.etp_ai_trace import ETPAITrace


def accept_suggestion(
    db: Session,
    etp_id: UUID,
    section: str,
    trace_id: UUID,
    if_match: str,
    user_id: str,
):
    """
    Accepts an AI suggestion for a specific section of an ETP,
    logs the acceptance, and updates the ETP's data and version.
    """
    # ... (rest of the function)
    pass


def list_acceptances(
    db: Session,
    etp_id: UUID,
    section: str,
    page: int,
    size: int
):
    """
    Lists the AI suggestion acceptances for a given ETP section with pagination.
    """
    # ... (rest of the function)
    pass
