from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.schemas.tr_version import TRVersionRead
from app.services.tr_consolidation_service import consolidate_tr

router = APIRouter()


@router.post(
    "/{tr_id}/consolidar",
    response_model=List[TRVersionRead],
    summary="Consolidate TR and Generate Documents",
    dependencies=[Depends(deps.get_current_user)],
)
def consolidate_tr_endpoint(
    tr_id: int,
    db: Session = Depends(deps.get_db),
):
    """
    Consolidates a Termo de Referência (TR), generates DOCX and PDF documents,
    versions them, and updates the TR's status.

    - **tr_id**: The ID of the TR to consolidate.
    """
    try:
        versions = consolidate_tr(db=db, tr_id=tr_id)
        return versions
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        # A broad exception to catch unexpected errors during the process
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")
