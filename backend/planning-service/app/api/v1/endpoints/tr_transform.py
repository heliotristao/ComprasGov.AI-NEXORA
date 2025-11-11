from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import uuid

from app import schemas
from app.api import deps
from app.db.models.tr import TRType
from app.services.etp_to_tr_transformer import build_tr_from_etp
from app.services.event_publisher import publish_tr_created
from typing import Dict, Any

router = APIRouter()


@router.post("/from-etp/{etp_id}", response_model=schemas.tr.TR)
async def create_tr_from_etp(
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
    await publish_tr_created(tr)
    return tr


@router.post("/tr/criar-de-etp/{etp_id}", response_model=Dict[str, uuid.UUID], status_code=201)
async def criar_tr_de_etp(
    etp_id: uuid.UUID,
    db: Session = Depends(deps.get_db),
    current_user: Dict[str, Any] = Depends(deps.get_current_user),
):
    """
    Cria um novo Termo de Referência (TR) a partir de um Estudo Técnico Preliminar (ETP).
    """
    user_id = current_user.get("sub")
    if not user_id:
        raise HTTPException(status_code=403, detail="Could not validate credentials")

    # Por padrão, o tipo de TR criado a partir de um ETP será 'BEM'
    # TODO: Permitir que o tipo seja especificado na requisição
    tipo_tr = TRType.BEM

    tr = build_tr_from_etp(db=db, etp_id=etp_id, tipo=tipo_tr, user_id=user_id)
    await publish_tr_created(tr)
    return {"id": tr.id}
