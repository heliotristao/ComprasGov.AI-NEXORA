from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.services import etp_ai_service

router = APIRouter()


@router.post(
    "/etp/{etp_id}/generate-section/{section_name}",
    response_model=schemas.ETPGenerateSectionOut,
)
def generate_etp_section(
    *,
    db: Session = Depends(get_db),
    etp_id: int,
    section_name: str,
    payload: schemas.ETPGenerateSectionIn,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate content for a specific ETP section using AI.
    """
    try:
        result = etp_ai_service.generate_section_content(
            db=db,
            etp_id=etp_id,
            section_name=section_name,
            keywords=payload.keywords,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/etp/{etp_id}/generate/{field}")
def generate_etp_field(
    *,
    db: Session = Depends(get_db),
    etp_id: int,
    field: str,
    current_user: dict = Depends(get_current_user),
):
    """
    Generate content for a specific ETP field using AI.
    """
    try:
        result = etp_ai_service.generate_field(db=db, etp_id=etp_id, field=field)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
