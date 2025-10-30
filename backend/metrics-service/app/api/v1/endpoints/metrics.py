import httpx
from fastapi import APIRouter, Depends
from app.schemas.metrics import (
    ProcessStatusMetrics, TrendMetrics, SavingsMetrics
)
from nexora_auth.auth import require_role

from app.core.cache import redis_cache


router = APIRouter()


@router.get(
    "/process-status",
    response_model=ProcessStatusMetrics,
    summary="Get Process Status Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_process_status_metrics():
    """
    Retrieves a count of processes (ETPs, TRs, etc.) grouped by their
    current status.
    """
    response = httpx.get(
        "http://planning-service:8000/api/v1/dashboard/summary"
    )
    data = response.json()

    # This is a simplification, as the actual data structure is not defined.
    # I'm assuming the planning-service returns a compatible structure.
    status_data = {
        "draft": data.get("total_etp_rascunho", 0),
        "in_review": data.get("total_etp_analise", 0),
        "approved": data.get("total_etp_concluido", 0),
    }
    return ProcessStatusMetrics(**status_data)


@router.get(
    "/trend",
    response_model=TrendMetrics,
    summary="Get Process Trend Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_trend_metrics():
    """
    Retrieves a time series of the volume of processes created over the
    last 12 months.
    """
    # The actual endpoint in datahub-service is not defined,
    # so this is a placeholder.
    response = httpx.get(
        "http://datahub-service:8000/api/v1/trends/process-volume"
    )
    data = response.json()
    return TrendMetrics(**data)


@router.get(
    "/savings",
    response_model=SavingsMetrics,
    summary="Get Estimated Savings Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_savings_metrics():
    """
    Retrieves an estimated savings metric.
    """
    # The actual endpoint in collector-service is not defined,
    # so this is a placeholder.
    response = httpx.get(
        "http://collector-service:8000/api/v1/savings/estimated"
    )
    data = response.json()
    return SavingsMetrics(**data)
