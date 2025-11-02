from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.models.etp import ETP, ETPStatus
from app.db.models.tr import TR, TRStatus
from datetime import datetime, timedelta
from app.db.models.market_price import MarketPrice

def get_process_status(db: Session):
    etp_counts = db.query(ETP.status, func.count(ETP.id)).group_by(ETP.status).all()
    tr_counts = db.query(TR.status, func.count(TR.id)).group_by(TR.status).all()

    status_data = {
        "draft": 0,
        "in_review": 0,
        "approved": 0,
    }

    for status, count in etp_counts:
        if status == ETPStatus.draft:
            status_data["draft"] += count
        elif status == ETPStatus.in_review:
            status_data["in_review"] += count
        elif status == ETPStatus.approved:
            status_data["approved"] += count

    for status, count in tr_counts:
        if status == TRStatus.DRAFT:
            status_data["draft"] += count
        elif status == TRStatus.IN_REVIEW:
            status_data["in_review"] += count

    return status_data

def get_trend(db: Session):
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    etp_trend = (
        db.query(
            func.strftime('%Y-%m', ETP.created_at).label('month'),
            func.count(ETP.id).label('count')
        )
        .filter(ETP.created_at >= twelve_months_ago)
        .group_by('month')
        .order_by('month')
        .all()
    )
    tr_trend = (
        db.query(
            func.strftime('%Y-%m', TR.created_at).label('month'),
            func.count(TR.id).label('count')
        )
        .filter(TR.created_at >= twelve_months_ago)
        .group_by('month')
        .order_by('month')
        .all()
    )

    trend_data = {}
    for month, count in etp_trend:
        trend_data.setdefault(month, 0)
        trend_data[month] += count

    for month, count in tr_trend:
        trend_data.setdefault(month, 0)
        trend_data[month] += count

    labels = sorted(trend_data.keys())
    values = [trend_data[label] for label in labels]

    return {"labels": labels, "values": values}

def get_savings(db: Session):
    # This is a placeholder logic. A real implementation would involve
    # joining tables and performing more complex calculations.
    total_contract_value = db.query(func.sum(TR.data['total_value'])).scalar() or 0

    # Assuming market price is an average of all items in the market_prices table
    average_market_price = db.query(func.avg(MarketPrice.unit_value)).scalar() or 0

    # This is a naive calculation and should be replaced with a more
    # accurate model.
    estimated_savings = float(average_market_price) * 100 - float(total_contract_value)

    return {"estimated_savings": estimated_savings, "currency": "BRL"}

# --- Prometheus Wrapper Functions ---

def prometheus_process_status():
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        return get_process_status(db)
    finally:
        db.close()

def prometheus_trend():
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        return get_trend(db)
    finally:
        db.close()

def prometheus_savings():
    from app.db.session import SessionLocal
    db = SessionLocal()
    try:
        return get_savings(db)
    finally:
        db.close()
