from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas
from app.api import deps
from app.crud import crud_plan

router = APIRouter()

@router.get("/", response_model=List[schemas.Plan])
def read_plans(
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Retrieve plans.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    return []


@router.post("/", response_model=schemas.Plan, status_code=201)
def create_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_in: schemas.PlanCreate,
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Create new plan.
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")

    plan = crud_plan.create_plan(db=db, obj_in=plan_in)
    return plan
