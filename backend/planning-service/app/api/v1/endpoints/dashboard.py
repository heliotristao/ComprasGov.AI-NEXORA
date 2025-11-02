from fastapi import APIRouter, Depends
from app.db.models.dashboard import DashboardSummary
from app.api.v1.dependencies import get_current_user

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(current_user: dict = Depends(get_current_user)):
    """
    Get dashboard summary data.
    """
    return {
        "plans_in_progress": 5,
        "open_tenders": 2,
        "active_contracts": 15,
    }
