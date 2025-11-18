import random
import string
import uuid

from sqlalchemy.orm import Session

from app.db.models.etp import ETP, ETPStatus
from tests.utils.user import create_random_user


def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def create_random_etp(db: Session, status: ETPStatus = ETPStatus.draft, data: dict = None) -> ETP:
    final_data = {"description": "A test ETP."}
    if data:
        final_data.update(data)

    user = create_random_user(db)

    etp = ETP(
        title=f"Test ETP {random_string()}",
        status=status,
        data=final_data,
        created_by=user,
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp
