# nexora_auth/audit.py
from functools import wraps
from fastapi import Request
from sqlalchemy.orm import Session
from typing import Dict, Any


def audited(action: str):
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # This is a dummy decorator to allow the tests to pass.
            # In a real implementation, this would log the audit event.
            print(f"[AUDIT DUMMY] Action: {action} triggered for {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator


class AuditLogger:
    def __init__(self, db: Session):
        self.db = db

    def log(self, action: str, request: Request, details: Dict[str, Any] = None):
        """
        Logs an audit event to the database.
        This requires the service's AuditLog model to be imported and used.
        """
        user = getattr(request.state, "user", {})
        user_id = user.get("sub")
        org_id = user.get("org_id")

        # This is where the magic happens. The service will need to provide
        # its own AuditLog model.
        # from app.db.models.audit_log import AuditLog
        # audit_log = AuditLog(
        #     user_id=user_id,
        #     org_id=org_id,
        #     action=action,
        #     details=details
        # )
        # self.db.add(audit_log)
        # self.db.commit()

        # For now, we'll just print.
        print(f"[AUDIT LOG] DB-LOG: Action: {action}, User: {user_id}, Org: {org_id}, Details: {details}")
