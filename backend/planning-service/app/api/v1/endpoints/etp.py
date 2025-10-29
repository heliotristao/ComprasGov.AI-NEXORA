from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.schemas.etp_schemas import ETPCreate, ETPUpdate, ETPOut

router = APIRouter()


@router.post("/etp", response_model=ETPOut, status_code=status.HTTP_201_CREATED)
def create_etp(
    *,
    db: Session = Depends(get_db),
    etp_in: ETPCreate,
    current_user: dict = Depends(get_current_user),
):
    """
    Create new ETP.
    """
    created_by = current_user.get("sub")
    etp = crud.etp.create_etp(db=db, etp_in=etp_in, created_by=created_by)
    # TODO: Add audit log
    return etp


@router.get("/etp/{etp_id}", response_model=ETPOut)
def read_etp(
    *,
    db: Session = Depends(get_db),
    etp_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Get ETP by ID.
    """
    etp = crud.etp.get_etp(db=db, etp_id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    return etp


@router.patch("/etp/{etp_id}", response_model=ETPOut)
def update_etp(
    *,
    db: Session = Depends(get_db),
    etp_id: UUID,
    etp_in: ETPUpdate,
    current_user: dict = Depends(get_current_user),
):
    """
    Update an ETP.
    """
    etp = crud.etp.get_etp(db=db, etp_id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    etp = crud.etp.update_etp(db=db, db_obj=etp, obj_in=etp_in)
    # TODO: Add audit log
    return etp


@router.delete("/etp/{etp_id}", response_model=ETPOut)
def delete_etp(
    *,
    db: Session = Depends(get_db),
    etp_id: UUID,
    current_user: dict = Depends(get_current_user),
):
    """
    Soft delete an ETP.
    """
    etp = crud.etp.get_etp(db=db, etp_id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    etp = crud.etp.soft_delete_etp(db=db, db_obj=etp)
    return etp
