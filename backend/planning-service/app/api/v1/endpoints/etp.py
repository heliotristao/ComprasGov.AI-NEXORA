import uuid
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status, Request, File, UploadFile
from sqlalchemy.orm import Session

from app import crud
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.schemas.etp import ETPCreate, ETPSchema, ETPStatus
from app.schemas.signed_document import SignedDocumentCreate, SignedDocumentSchema
from app.schemas.compliance import ComplianceReport
from app.core.compliance import compliance_engine
from app.services import etp_auto_save_service
from nexora_auth.decorators import require_scope, require_role
from app.schemas.etp import ETPAcceptIA
from app.services import etp_accept_ia_service
from nexora_auth.audit import audited
from app.core.exceptions import TraceNotFoundException, ETPNotFoundException
from app.schemas.pagination import PaginatedResponse
from app.schemas.etp_accept_ia import ETPAcceptanceLogSchema


router = APIRouter()


@router.post(
    "",
    response_model=ETPSchema,
    status_code=status.HTTP_201_CREATED,
)
@audited(action="CREATE_ETP")
@require_role(required_roles={"Planejador"})
def create_etp(
    etp_in: ETPCreate,
    request: Request,
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
)
@require_scope("etp:write")
def patch_etp_auto_save(
    request: Request,
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
    - Optionally validates payload against a step schema via `validate_step`
      query param.
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


@router.post(
    "/{etp_id}/accept-ia/{section}",
    response_model=ETPSchema,
    status_code=status.HTTP_200_OK,
)
@audited(action="ETP_AI_ACCEPT")
@require_scope("etp:write")
def accept_etp_ia(
    etp_id: uuid.UUID,
    section: str,
    payload: ETPAcceptIA,
    db: Session = Depends(get_db),
    if_match: str = Header(..., alias="If-Match"),
    current_user: dict = Depends(get_current_user),
):
    """
    Accept an AI suggestion for an ETP section.
    - Requires scope: `etp:write`
    - Requires `If-Match` header for concurrency control.
    """
    try:
        updated_etp = etp_accept_ia_service.accept_suggestion(
            db=db,
            etp_id=etp_id,
            section=section,
            trace_id=payload.trace_id,
            if_match=if_match,
            user_id=current_user.get("sub"),
        )
        return updated_etp
    except ETPNotFoundException:
        raise HTTPException(status_code=404, detail="ETP not found")
    except TraceNotFoundException:
        raise HTTPException(status_code=404, detail="Trace not found")
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


# Legacy endpoint alias for frontend compatibility
@router.post(
    "/{etp_id}/aceitar-ia/{campoId}",
    response_model=ETPSchema,
    status_code=status.HTTP_200_OK,
    deprecated=True,
)
@audited(action="ETP_AI_ACCEPT")
@require_scope("etp:write")
def accept_etp_ia_legacy(
    etp_id: uuid.UUID,
    campoId: str,
    payload: ETPAcceptIA,
    db: Session = Depends(get_db),
    if_match: str = Header(..., alias="If-Match"),
    current_user: dict = Depends(get_current_user),
):
    """
    (Legacy) Accept an AI suggestion for an ETP section.
    """
    return accept_etp_ia(
        etp_id=etp_id,
        section=campoId,
        payload=payload,
        db=db,
        if_match=if_match,
        current_user=current_user,
    )


@router.get(
    "/{etp_id}/sections/{section}/accepts",
    response_model=PaginatedResponse[ETPAcceptanceLogSchema],
    dependencies=[Depends(require_scope("etp:read"))],
)
def list_etp_ia_accepts(
    etp_id: uuid.UUID,
    section: str,
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
):
    """
    List AI suggestion acceptances for an ETP section.
    Requires scope: etp:read
    """
    total, accepts = etp_accept_ia_service.list_acceptances(
        db=db,
        etp_id=etp_id,
        section=section,
        page=page,
        size=size,
    )
    return {
        "items": accepts,
        "total": total,
        "page": page,
        "size": size,
        "pages": (total + size - 1) // size,
    }

@router.post(
    "/{etp_id}/upload-signed",
    response_model=SignedDocumentSchema,
    status_code=status.HTTP_201_CREATED,
)
@audited(action="ETP_SIGNED")
@require_scope("etp:sign")
async def upload_signed_etp(
    etp_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Upload a signed ETP document.
    - Requires scope: `etp:sign`
    """
    etp = crud.etp.get(db=db, id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    if etp.status != ETPStatus.approved:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"ETP must be in 'approved' status to upload a signed document. Current status: {etp.status}",
        )

    # Mock datahub-service interaction
    # In a real implementation, this would be an HTTP client call
    # that uploads the file.content and returns a real artifact_id.
    artifact_id = uuid.uuid4()

    signed_doc_in = SignedDocumentCreate(
        document_id=etp_id,
        document_type="etp",
        signed_by_id=current_user.get("sub"),
        artifact_id=artifact_id,
    )
    signed_document = crud.signed_document.create(db=db, obj_in=signed_doc_in)

    # Update ETP status
    crud.etp.update(db=db, db_obj=etp, obj_in={"status": ETPStatus.signed})

    return signed_document
