from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_role
from app.schemas.role import Role, RoleCreate, RoleUpdate

router = APIRouter()

@router.get("/", response_model=List[Role])
def read_roles(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
):
    roles = crud_role.get_roles(db, skip=skip, limit=limit)
    return roles

@router.post("/", response_model=Role)
def create_role(
    *,
    db: Session = Depends(deps.get_db),
    role_in: RoleCreate,
):
    role = crud_role.get_role_by_name(db, name=role_in.name)
    if role:
        raise HTTPException(
            status_code=400,
            detail="The role with this name already exists in the system.",
        )
    role = crud_role.create_role(db=db, role=role_in)
    return role

@router.get("/{role_id}", response_model=Role)
def read_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
):
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    return role

@router.patch("/{role_id}", response_model=Role)
def update_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
    role_in: RoleUpdate,
):
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role = crud_role.update_role(db=db, db_role=role, role_in=role_in)
    return role

@router.delete("/{role_id}", response_model=Role)
def delete_role(
    *,
    db: Session = Depends(deps.get_db),
    role_id: int,
):
    role = crud_role.get_role(db, role_id=role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    role = crud_role.delete_role(db=db, role_id=role_id)
    return role
