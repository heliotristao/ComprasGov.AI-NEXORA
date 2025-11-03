import uuid
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.orm import Session

from app.crud import crud_etp
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
import json
from app.core.rule_engine_wrapper import RuleEngineWrapper
from app.schemas.etp import ETPCreate, ETPSchema, ETPUpdate, ETPPatch
from nexora_auth.audit import audited

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
    etp = crud_etp.etp.create_with_owner(db=db, obj_in=etp_in, created_by_id=user_id)
    return etp


@router.get("/{id}", response_model=ETPSchema)
def read_etp(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get ETP by ID.
    """
    etp = crud_etp.etp.get(db=db, id=id)
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
    etps = crud_etp.etp.get_multi(db, skip=skip, limit=limit)
    return etps


@router.patch("/{id}", response_model=ETPSchema)
@audited(action="ETP_AUTOSAVED")
def patch_etp(
    id: uuid.UUID,
    etp_in: ETPPatch,
    if_match: int = Header(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
) -> Any:
    """
    Patch an ETP for auto-save functionality.
    """
    etp = crud_etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    etp = crud_etp.etp.patch(db=db, db_obj=etp, obj_in=etp_in, version=if_match)
    return etp


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
    etp = crud_etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    etp = crud_etp.etp.update(db=db, db_obj=etp, obj_in=etp_in)
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
    etp = crud_etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    crud_etp.etp.remove(db=db, id=id)


from app.utils.pdf_utils import generate_pdf_response

@router.get("/{id}/pdf", response_model=None)
def download_etp_pdf(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Generate and download ETP as PDF.
    """
    etp = crud_etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")
    return generate_pdf_response(doc_id=id, doc_type="etp", db=db)


@router.get("/{id}/validar", response_model=List[dict])
def validate_etp(
    id: uuid.UUID,
    db: Session = Depends(get_db),
) -> Any:
    """
    Validate an ETP against a set of rules.
    """
    etp = crud_etp.etp.get(db=db, id=id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    with open("app/rules/etp_rules.json") as f:
        rules = json.load(f)

    etp_data = ETPSchema.model_validate(etp).dict()

    # The `data` field is a JSON string in the database, so we need to parse it
    if isinstance(etp_data.get("data"), str):
        etp_data["data"] = json.loads(etp_data["data"])

    # Flatten the data structure to match the rules
    etp_data.update(etp_data.pop("data", {}))

    engine = RuleEngineWrapper(rules)
    result = engine.run(etp_data)

    return result
