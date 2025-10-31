from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.services.tr_consolidation_service import TRConsolidationService
from nexora.auth import require_scope

router = APIRouter()

@router.post("/tr/{tr_id}/consolidate", status_code=status.HTTP_202_ACCEPTED)
@require_scope("tr:consolidate")
def consolidate_tr(
    tr_id: int,
    db: Session = Depends(get_db),
):
    """
    Consolidates a Termo de Referência (TR) and generates its artifacts.
    """
    try:
        service = TRConsolidationService(db)
        service.consolidate(tr_id)
        return {"message": "TR consolidation process started."}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
