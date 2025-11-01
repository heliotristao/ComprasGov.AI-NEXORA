import uuid
from datetime import datetime
from fastapi import APIRouter, status, Response, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.planning import PlanningCreate, Planning, PlanningUpdate
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


@router.patch("/plannings/{planning_id}", response_model=Planning)
def update_planning(
    *,
    planning_id: int,
    planning_in: PlanningUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a planning.
    """
    db_planning = db.query(PlanningModel).get(planning_id)
    if not db_planning:
        raise HTTPException(status_code=404, detail="Planning not found")

    update_data = planning_in.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_planning, key, value)

    db.add(db_planning)
    db.commit()
    db.refresh(db_planning)
    return db_planning
