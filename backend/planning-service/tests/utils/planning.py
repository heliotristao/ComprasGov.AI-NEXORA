from sqlalchemy.orm import Session
from app.db.models.planning import Planning

def create_random_planning(db: Session) -> Planning:
    planning = Planning(
        title="Test Planning",
        status="draft",
        created_by="test_user"
    )
    db.add(planning)
    db.commit()
    db.refresh(planning)
    return planning
