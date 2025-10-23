import uuid
from datetime import datetime
from fastapi import APIRouter, status, Response, Depends
from sqlalchemy.orm import Session
from app.models.planning import PlanningCreate, Planning
from app.db.models.planning import Planning as PlanningModel
from app.db.session import SessionLocal
from typing import List

router = APIRouter()

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/plannings",
    response_model=Planning,
    status_code=status.HTTP_201_CREATED
)
def create_planning(
    *,
    planning_in: PlanningCreate,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Create new planning.
    """
    db_planning = PlanningModel(**planning_in.dict())
    db.add(db_planning)
    db.commit()
    db.refresh(db_planning)
    response.headers["Location"] = f"/api/v1/plannings/{db_planning.id}"
    return db_planning


@router.get("/plannings", response_model=List[Planning])
def list_plannings(db: Session = Depends(get_db)):
    """
    List all plannings.
    """
    return db.query(PlanningModel).all()
