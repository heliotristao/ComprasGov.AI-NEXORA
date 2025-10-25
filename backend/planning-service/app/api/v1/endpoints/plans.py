from fastapi import APIRouter, Depends
from typing import List
from datetime import datetime
from app.schemas.plan import Plan
from app.api.v1.dependencies import get_current_user

router = APIRouter()

@router.get("/plans", response_model=List[Plan], dependencies=[Depends(get_current_user)])
def list_plans():
    """
    Retrieve a list of plans.
    """
    return [
        {
            "id": "PLAN-2025-001",
            "objective": "Contratação de serviço de limpeza",
            "status": "Em Elaboração",
            "created_at": "2025-10-25T10:00:00Z"
        }
    ]
