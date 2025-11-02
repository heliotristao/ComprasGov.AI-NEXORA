from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.metrics import (
    ProcessStatusMetrics, TrendMetrics, SavingsMetrics
)
from nexora_auth.decorators import require_role

from app.core.cache import redis_cache
from app.services import metrics_calculator

router = APIRouter()


@router.get(
    "/process-status",
    response_model=ProcessStatusMetrics,
    summary="Get Process Status Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_process_status_metrics(db: Session = Depends(get_db)):
    """
    Retrieves a count of processes (ETPs, TRs, etc.) grouped by their
    current status.
    """
    status_data = metrics_calculator.get_process_status(db)
    return ProcessStatusMetrics(**status_data)


@router.get(
    "/trend",
    response_model=TrendMetrics,
    summary="Get Process Trend Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_trend_metrics(db: Session = Depends(get_db)):
    """
    Retrieves a time series of the volume of processes created over the
    last 12 months.
    """
    trend_data = metrics_calculator.get_trend(db)
    return TrendMetrics(**trend_data)


@router.get(
    "/savings",
    response_model=SavingsMetrics,
    summary="Get Estimated Savings Metrics",
    dependencies=[Depends(require_role(["GESTOR"]))],
)
@redis_cache(ttl=300)
def get_savings_metrics(db: Session = Depends(get_db)):
    """
    Retrieves an estimated savings metric.
    """
    savings_data = metrics_calculator.get_savings(db)
    return SavingsMetrics(**savings_data)
