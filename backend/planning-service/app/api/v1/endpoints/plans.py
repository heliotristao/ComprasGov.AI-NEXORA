from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app import schemas
from app.api import deps
from app.crud import crud_plan
from nexora_auth.decorators import require_role
from nexora_auth.audit import AuditLogger

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
@require_role({"Admin", "Planejador"})
def create_plan(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
    plan_in: schemas.PlanCreate,
    current_user: dict = Depends(deps.get_current_user),
    audit_logger: AuditLogger = Depends(deps.get_audit_logger)
):
    """
    Create new plan.
    """
    plan = crud_plan.create_plan(db=db, obj_in=plan_in)
    audit_logger.log(
        action="CREATE_PLAN",
        request=request,
        details={"plan_id": str(plan.id), "title": plan.title}
    )
    return plan


@router.get("/{plan_id}", response_model=schemas.Plan)
def read_plan(
    *,
    db: Session = Depends(deps.get_db),
    plan_id: str,
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Get plan by ID.
    """
    plan = crud_plan.get_plan(db=db, plan_id=plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.put("/{plan_id}", response_model=schemas.Plan)
@require_role({"Admin", "Planejador"})
def update_plan(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
    plan_id: str,
    plan_in: schemas.PlanUpdate,
    current_user: dict = Depends(deps.get_current_user),
    audit_logger: AuditLogger = Depends(deps.get_audit_logger)
):
    """
    Update a plan.
    """
    plan = crud_plan.get_plan(db=db, plan_id=plan_id)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    plan = crud_plan.update_plan(db=db, db_obj=plan, obj_in=plan_in)
    audit_logger.log(
        action="UPDATE_PLAN",
        request=request,
        details={"plan_id": str(plan.id), "updated_fields": plan_in.dict(exclude_unset=True)}
    )
    return plan
