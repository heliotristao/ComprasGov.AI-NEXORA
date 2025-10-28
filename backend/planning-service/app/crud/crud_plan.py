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

def get_plan(db: Session, *, plan_id: str) -> Plan | None:
    return db.query(Plan).filter(Plan.id == plan_id).first()


def update_plan(db: Session, *, db_obj: Plan, obj_in: dict) -> Plan:
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.dict(exclude_unset=True)
    for field in update_data:
        if hasattr(db_obj, field):
            setattr(db_obj, field, update_data[field])
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
