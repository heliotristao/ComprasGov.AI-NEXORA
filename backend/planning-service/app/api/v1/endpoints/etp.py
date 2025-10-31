import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.schemas.etp import ETPSchema, ETPCreate, ETPUpdate
from nexora_auth.decorators import require_scope
from nexora_auth.audit import audit as audited
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.post(
    "",
    response_model=ETPSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_scope("etp:write"))],
)
@audited("etp:create")
def create_etp(
    etp_in: ETPCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Create a new ETP.
    Requires scope: etp:write
    """
    etp_in.created_by = current_user.get("sub")
    etp = crud.etp.create(db=db, obj_in=etp_in)
    return etp


@router.get(
    "/{etp_id}",
    response_model=ETPSchema,
    dependencies=[Depends(require_scope("etp:read"))],
)
def read_etp(
    etp_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Get an ETP by ID.
    Requires scope: etp:read
    """
    etp = crud.etp.get(db=db, id=etp_id)
    if not etp or etp.deleted_at:
        raise HTTPException(status_code=404, detail="ETP not found")
    return etp


@router.patch(
    "/{etp_id}",
    response_model=ETPSchema,
    dependencies=[Depends(require_scope("etp:write"))],
)
@audited("etp:update")
def update_etp(
    etp_id: uuid.UUID,
    etp_in: ETPUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Update an ETP incrementally.
    Requires scope: etp:write
    """
    etp = crud.etp.get(db=db, id=etp_id)
    if not etp or etp.deleted_at:
        raise HTTPException(status_code=404, detail="ETP not found")

    etp_in.updated_by = current_user.get("sub")
    update_data = etp_in.dict(exclude_unset=True)

    updated_etp = crud.etp.update(db=db, db_obj=etp, obj_in=update_data)
    return updated_etp


@router.delete(
    "/{etp_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_scope("etp:delete"))],
)
@audited("etp:delete")
def delete_etp(
    etp_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Soft delete an ETP.
    Requires scope: etp:delete
    """
    etp = crud.etp.get(db=db, id=etp_id)
    if not etp or etp.deleted_at:
        raise HTTPException(status_code=404, detail="ETP not found")

    crud.etp.remove(db=db, id=etp_id)
    return None
