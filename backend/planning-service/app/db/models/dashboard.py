from pydantic import BaseModel


class DashboardSummary(BaseModel):
    """
    Schema for the summary data on the dashboard.
    """
    plans_in_progress: int
    open_tenders: int
    active_contracts: int
