from sqlalchemy.orm import Session
from app.db.models.etp_modular import DocumentoETP
from typing import Optional


def get_documento_etp(db: Session, *, etp_id: int) -> Optional[DocumentoETP]:
    """
    Get a DocumentoETP by ID.
    """
    return db.query(DocumentoETP).filter(DocumentoETP.id == etp_id).first()
