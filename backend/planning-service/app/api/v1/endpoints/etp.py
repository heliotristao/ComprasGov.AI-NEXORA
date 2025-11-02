import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.schemas.etp import ETPCreate, ETPSchema, ETPUpdate
from app.schemas.etp_schemas import ETPPartialUpdate
from nexora_auth.audit import audited
from fastapi import Header

router = APIRouter()


@router.post(
    "/",
    response_model=ETPSchema,
    status_code=status.HTTP_201_CREATED,
)
@audited(action="ETP_CREATED")
def create_etp(
    etp_in: ETPCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Create new ETP.
    """
    user_id = uuid.UUID(current_user.get("sub"))
    etp = crud.etp.create_with_owner(db=db, obj_in=etp_in, created_by_id=user_id)
    return etp


@router.get("/{id}", response_model=ETPSchema)
def read_etp(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get ETP by ID.
    """
    etp = crud.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    return etp


@router.get("/", response_model=List[ETPSchema])
def read_etps(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
) -> Any:
    """
    Retrieve ETPs.
    """
    etps = crud.etp.get_multi(db, skip=skip, limit=limit)
    return etps


@router.put("/{id}", response_model=ETPSchema)
@audited(action="ETP_UPDATED")
def update_etp(
    id: uuid.UUID,
    etp_in: ETPUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Update an ETP.
    """
    etp = crud.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    etp = crud.etp.update(db=db, db_obj=etp, obj_in=etp_in)
    return etp


from nexora_auth.decorators import require_scope

@router.patch("/{id}", response_model=ETPSchema)
@audited(action="ETP_AUTOSAVED")
@require_scope("etp:write")
async def partial_update_etp(
    id: uuid.UUID,
    etp_in: ETPPartialUpdate,
    if_match: int = Header(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
    request: Request = None,
) -> Any:
    """
    Partially update an ETP for auto-save functionality.
    """
    etp = crud.etp.patch(db=db, id=id, obj_in=etp_in, expected_version=if_match)
    return etp


@router.delete("/{id}", status_code=204)
@audited(action="ETP_DELETED")
def delete_etp(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> None:
    """
    Delete an ETP.
    """
    etp = crud.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    crud.etp.remove(db=db, id=id)
