from fastapi import APIRouter, Depends
from app.db.models.dashboard import DashboardSummary
from app.api import deps
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(deps.get_current_user)
):
    """
    Get dashboard summary.
    """
    # In a real application, you would fetch this data from the database
    return DashboardSummary(
        total_plans=10,
        completed_plans=5,
        in_progress_plans=5
    )
