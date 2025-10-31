import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.schemas.etp import ETPCreate, ETPSchema
from app.schemas.compliance import ComplianceReport
from app.core.compliance import compliance_engine
from app.services import etp_auto_save_service
from nexora_auth.decorators import require_scope

router = APIRouter()


@router.post(
    "",
    response_model=ETPSchema,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(require_scope("etp:write"))],
)
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


@router.post(
    "/{etp_id}/validate",
    response_model=ComplianceReport,
    dependencies=[Depends(require_scope("etp:read"))],
)
def validate_etp(
    etp_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    """
    Validate an ETP and return a compliance report.
    Requires scope: etp:read
    """
    etp = crud.etp.get_etp(db=db, etp_id=etp_id)
    if not etp or etp.deleted_at:
        raise HTTPException(status_code=404, detail="ETP not found")

    report = compliance_engine.validate_etp(etp)
    return report


@router.patch(
    "/{etp_id}",
    response_model=ETPSchema,
    dependencies=[Depends(require_scope("etp:write"))],
)
def patch_etp_auto_save(
    etp_id: uuid.UUID,
    patch_data: Dict[str, Any],
    db: Session = Depends(get_db),
    if_match: Optional[str] = Header(None, alias="If-Match"),
    validate_step: Optional[str] = Query(None, alias="validate_step"),
):
    """
    Perform a partial update (auto-save) on an ETP, with version control.
    - Requires scope: `etp:write`
    - Requires `If-Match` header for concurrency control.
    - Optionally validates payload against a step schema via `validate_step` query param.
    """
    updated_etp = etp_auto_save_service.orchestrate_etp_auto_save(
        db=db,
        etp_id=etp_id,
        patch_data=patch_data,
        if_match=if_match,
        validate_step=validate_step,
    )
    return updated_etp


@router.delete(
    "/{etp_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(require_scope("etp:delete"))],
)
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
