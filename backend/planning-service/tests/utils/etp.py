from sqlalchemy.orm import Session
from app.db.models.etp import ETP
from app.tests.utils.planning import create_random_planning
import uuid

def create_random_etp(db: Session) -> ETP:
    planning = create_random_planning(db)
    etp = ETP(
        planning_id=planning.id,
        title="Test ETP",
        status="draft",
        data={},
        created_by="test_user"
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp
