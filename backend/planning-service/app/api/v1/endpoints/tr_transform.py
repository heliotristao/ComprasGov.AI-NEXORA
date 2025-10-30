from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app import schemas
from app.api import deps
from app.db.models.tr import TRType
from app.services.etp_to_tr_transformer import build_tr_from_etp
from typing import Dict, Any

router = APIRouter()


@router.post("/from-etp/{etp_id}", response_model=schemas.tr.TR)
def create_tr_from_etp(
    etp_id: uuid.UUID,
    tipo: TRType,
    db: Session = Depends(deps.get_db),
    current_user: Dict[str, Any] = Depends(deps.get_current_user),
):
    """
    Create a new TR from an existing ETP.
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
    tr = build_tr_from_etp(db=db, etp_id=etp_id, tipo=tipo, user_id=user_id)
    return tr
