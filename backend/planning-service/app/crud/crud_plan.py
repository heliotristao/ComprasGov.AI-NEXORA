from sqlalchemy.orm import Session
from app.models.plan import Plan
from app.schemas.plan import PlanCreate
import datetime

def create_plan(db: Session, *, obj_in: PlanCreate) -> Plan:
    year = datetime.datetime.now().year
    # This is a simplification. In a real system, we'd need a more robust way to generate unique IDs.
    db_obj = Plan(
        id=f"PLAN-{year}-{db.query(Plan).count() + 1:03}",
        objective=obj_in.objective,
        justification=obj_in.justification,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
