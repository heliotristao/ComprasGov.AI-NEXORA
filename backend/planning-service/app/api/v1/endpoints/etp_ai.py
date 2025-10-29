from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.api.v1.dependencies import get_current_user
from app.services.etp_ai_service import generate_field

router = APIRouter()


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
        result = generate_field(db=db, etp_id=etp_id, field=field)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
