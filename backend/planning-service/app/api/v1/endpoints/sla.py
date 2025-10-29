"""Endpoints for SLA configuration and monitoring."""
from __future__ import annotations

from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.sla.engine import evaluate_sla_for_open_processes
from app.db.models.sla import SLASetting, SLAState, SLAStatus
from app.schemas.sla import (
    SLASettingCreate,
    SLASettingRead,
    SLAStateEnum,
    SLAStatusRead,
    SLARunResponse,
)

router = APIRouter(prefix="/sla", tags=["sla"])


def _require_management_role(user: dict) -> None:
    allowed = {"Admin", "Gestor"}
    roles = set()

    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    primary_role = user.get("role")
    if isinstance(primary_role, str):
        roles.add(primary_role)

    user_roles = user.get("roles")
    if isinstance(user_roles, str):
        roles.add(user_roles)
    elif isinstance(user_roles, list):
        roles.update(r for r in user_roles if isinstance(r, str))

    if not roles.intersection(allowed):
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not enough permissions")


@router.get("/settings", response_model=List[SLASettingRead])
def list_sla_settings(
    process_type: Optional[str] = Query(default=None, min_length=1),
    db: Session = Depends(get_db),
) -> List[SLASetting]:
    query = db.query(SLASetting)
    if process_type:
        query = query.filter(SLASetting.process_type == process_type)
    return query.order_by(SLASetting.process_type, SLASetting.stage).all()


@router.post("/settings", response_model=SLASettingRead)
def create_or_update_sla_setting(
    payload: SLASettingCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> SLASetting:
    _require_management_role(current_user)

    existing = (
        db.query(SLASetting)
        .filter(
            SLASetting.process_type == payload.process_type,
            SLASetting.stage == payload.stage,
        )
        .one_or_none()
    )

    data = payload.model_dump()
    data["notification_channel"] = payload.notification_channel.value

    if existing:
        for key, value in data.items():
            setattr(existing, key, value)
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing

    new_setting = SLASetting(**data)
    db.add(new_setting)
    db.commit()
    db.refresh(new_setting)
    return new_setting


@router.get("/status", response_model=List[SLAStatusRead])
def list_sla_status(
    process_id: Optional[str] = Query(default=None, min_length=1),
    state: Optional[SLAStateEnum] = Query(default=None),
    db: Session = Depends(get_db),
) -> List[SLAStatus]:
    query = db.query(SLAStatus)

    if process_id:
        query = query.filter(SLAStatus.process_id == process_id)
    if state:
        query = query.filter(SLAStatus.state == SLAState(state.value))

    return query.order_by(SLAStatus.updated_at.desc()).all()


@router.post("/run-check", response_model=SLARunResponse)
def run_sla_check(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> SLARunResponse:
    _require_management_role(current_user)
    results = evaluate_sla_for_open_processes(db)
    return SLARunResponse(evaluated=len(results), states=results)
