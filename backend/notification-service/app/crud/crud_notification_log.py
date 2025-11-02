from sqlalchemy.orm import Session
from app.db.models.notification_log import NotificationLog
from app.schemas.notification_log import NotificationLogCreate

def create_notification_log(db: Session, *, obj_in: NotificationLogCreate) -> NotificationLog:
    db_obj = NotificationLog(**obj_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
