from sqlalchemy.orm import Session
from app.db.models.etp import ETP
from tests.utils.planning import create_random_planning
import uuid
import random
import string

def random_string(length: int = 10) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))

def create_random_etp(db: Session) -> ETP:
    etp = ETP(
        process_id=random_string(),
        status="DRAFT",
        data={"title": "Test ETP"},
        created_by="test_user",
        org_id="test_org"
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp
