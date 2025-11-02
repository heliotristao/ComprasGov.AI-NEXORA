import random
import string
import uuid

from sqlalchemy.orm import Session

from app.db.models.etp import ETP, ETPStatus


def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def create_random_etp(db: Session, status: ETPStatus = ETPStatus.draft) -> ETP:
    etp = ETP(
        title=f"Test ETP {random_string()}",
        status=status,
        data={"description": "A test ETP."},
        created_by="test_user",
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp
