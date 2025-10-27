from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.api.deps import get_db
from app.schemas.plan import DashboardSummaryResponse
from app.models.plan import Plan, PlanStatus
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()


@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Obter resumo do dashboard com métricas principais
    """
    # Contar planos em progresso (draft + pending)
    plans_in_progress = db.query(func.count(Plan.id)).filter(
        Plan.status.in_([PlanStatus.DRAFT, PlanStatus.PENDING])
    ).scalar() or 0
    
    # Calcular valor total estimado
    total_estimated_value = db.query(func.sum(Plan.estimated_value)).filter(
        Plan.status == PlanStatus.APPROVED
    ).scalar() or Decimal("0")
    
    # Por enquanto, licitações e contratos são mockados (podem ser implementados depois)
    open_tenders = 0
    active_contracts = 0
    
    # Economia gerada (mockado por enquanto - pode ser calculado com base em histórico)
    economy_generated = Decimal("2500000.00")  # R$ 2,5M
    
    return {
        "plans_in_progress": plans_in_progress,
        "open_tenders": open_tenders,
        "active_contracts": active_contracts,
        "total_estimated_value": total_estimated_value,
        "economy_generated": economy_generated,
    }

