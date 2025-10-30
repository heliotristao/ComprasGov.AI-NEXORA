from typing import Generator
from fastapi import Depends, Request
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from nexora_auth.audit import AuditLogger
from app.db.models.audit_log import AuditLog

def get_db() -> Generator:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_audit_logger(db: Session = Depends(get_db)) -> AuditLogger:
    """
    Dependency to provide an AuditLogger instance.
    """
    logger = AuditLogger(db)
    
    def _log_to_db(action: str, request: Request, details: dict = None):
        user = getattr(request.state, "user", {})
        user_id = user.get("sub")
        org_id = user.get("org_id")

        audit_log = AuditLog(
            user_id=user_id,
            org_id=org_id,
            action=action,
            details=details
        )
        db.add(audit_log)
        db.commit()

    logger.log = _log_to_db
    return logger
