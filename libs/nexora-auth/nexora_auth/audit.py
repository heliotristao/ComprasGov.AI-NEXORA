# nexora_auth/audit.py
import os
from functools import wraps
from fastapi import Request, HTTPException, status
from typing import Callable, Any, Dict
from celery import Celery
from sqlalchemy.orm import Session

# --- Celery Setup ---
# The service using this library is responsible for configuring the Celery broker.
# It should set the 'CELERY_BROKER_URL' environment variable.
# Example: os.environ['CELERY_BROKER_URL'] = 'redis://localhost:6379/0'
celery_app = Celery("nexora_audit_worker")
celery_app.conf.update(
    broker_url=os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    result_backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0"),
    task_ignore_result=True,
    task_track_started=True,
)

@celery_app.task(name="log_audit_event")
def log_audit_event_task(audit_data: Dict[str, Any]):
    """
    Celery task to write an audit log to the database.
    This runs in a separate worker process.
    """
    # Each task needs its own database session.
    from app.db.session import SessionLocal
    from app.db.models.audit_log import AuditLog

    db = SessionLocal()
    try:
        audit_log_entry = AuditLog(**audit_data)
        db.add(audit_log_entry)
        db.commit()
        print(f"[AUDIT WORKER] Successfully logged action: {audit_data.get('action')}")
    except Exception as e:
        print(f"[AUDIT WORKER] ERROR: Failed to write audit log. Cause: {e}")
        db.rollback()
    finally:
        db.close()

def audited(action: str):
    """
    Decorator for FastAPI endpoints to asynchronously log an audit trail event.
    It expects 'request: Request' to be available in the endpoint's keyword arguments.
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any):
            request: Request = kwargs.get("request")
            if not isinstance(request, Request):
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Audited endpoint is missing 'request' argument.",
                )

            # Execute the original endpoint function first.
            response = await func(*args, **kwargs)

            try:
                user_info = getattr(request.state, "user", {})
                client_ip = request.client.host if request.client else "unknown"

                audit_data = {
                    "user_id": user_info.get("sub"),
                    "org_id": user_info.get("org_id"),
                    "action": action,
                    "details": {
                        "user_agent": request.headers.get("user-agent"),
                        "client_ip": client_ip,
                        "request_path": request.url.path,
                        "request_method": request.method,
                    },
                }

                # Dispatch the audit task to the Celery worker.
                log_audit_event_task.delay(audit_data)

            except Exception as e:
                # IMPORTANT: Prevent any failure in dispatching the task from breaking the main request.
                print(f"ERROR: Failed to dispatch audit log task. Cause: {e}")

            return response
        return wrapper
    return decorator


class AuditLogger:
    """
    A class to provide manual audit logging within service logic.
    """
    def __init__(self, db: Session):
        self.db = db

    def log(self, action: str, request: Request, details: Dict[str, Any] = None):
        """
        Logs an audit event to the database.
        This requires the service's AuditLog model to be available.
        """
        try:
            from app.db.models.audit_log import AuditLog

            user = getattr(request.state, "user", {})
            user_id = user.get("sub")
            org_id = user.get("org_id")

            audit_log = AuditLog(
                user_id=user_id,
                org_id=org_id,
                action=action,
                details=details
            )
            self.db.add(audit_log)
            self.db.commit()
            print(f"[AUDIT LOG] DB-LOG: Action: {action}, User: {user_id}, Org: {org_id}, Details: {details}")
        except ImportError:
            print("ERROR: AuditLog model not found at 'app.db.models.audit_log'. Auditing is disabled.")
        except Exception as e:
            print(f"ERROR: Failed to write audit log via AuditLogger. Cause: {e}")
            self.db.rollback()
