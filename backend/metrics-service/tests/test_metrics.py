from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from unittest.mock import patch

patch('app.api.v1.endpoints.metrics.require_role', lambda role: lambda func: func).start()

def mock_cache_decorator(ttl):
    def decorator(func):
        return func
    return decorator

patch('app.api.v1.endpoints.metrics.redis_cache', mock_cache_decorator).start()
from app.db.models.etp import ETP, ETPStatus
from app.db.models.tr import TR, TRStatus, TRType
from app.db.models.market_price import MarketPrice
from datetime import date
import uuid

def test_get_process_status_metrics(client: TestClient, db: Session):
    # Setup
    etp1 = ETP(status=ETPStatus.draft, title="Test ETP 1", created_by="test")
    etp2 = ETP(status=ETPStatus.in_review, title="Test ETP 2", created_by="test")
    etp3 = ETP(status=ETPStatus.approved, title="Test ETP 3", created_by="test")
    db.add_all([etp1, etp2, etp3])
    db.commit()
    db.add(TR(status=TRStatus.DRAFT, title="Test TR 1", created_by="test", etp_id=etp1.id, type=TRType.BEM))
    db.commit()

    # Test
    response = client.get("/api/v1/metrics/process-status")
    assert response.status_code == 200
    data = response.json()
    assert data["draft"] == 2
    assert data["in_review"] == 1
    assert data["approved"] == 1

    # Teardown
    db.query(ETP).delete()
    db.query(TR).delete()
    db.commit()

def test_get_trend_metrics(client: TestClient, db: Session):
    # Setup
    db.add(ETP(title="Test ETP 1", created_by="test"))
    db.add(ETP(title="Test ETP 2", created_by="test"))
    db.commit()

    # Test
    response = client.get("/api/v1/metrics/trend")
    assert response.status_code == 200
    data = response.json()
    assert len(data["labels"]) > 0
    assert len(data["values"]) > 0

    # Teardown
    db.query(ETP).delete()
    db.commit()

def test_get_savings_metrics(client: TestClient, db: Session):
    # Setup
    etp = ETP(title="Test ETP", created_by="test")
    db.add(etp)
    db.commit()
    db.add(MarketPrice(item_description="Test Item", quantity=1, unit_value=100.0, purchase_date=date(2023, 1, 1), source="test"))
    db.add(TR(title="Test TR 1", created_by="test", data={"total_value": 50.0}, etp_id=etp.id, type=TRType.BEM))
    db.commit()

    # Test
    response = client.get("/api/v1/metrics/savings")
    assert response.status_code == 200
    data = response.json()
    assert data["estimated_savings"] is not None
    assert data["currency"] == "BRL"

    # Teardown
    db.query(MarketPrice).delete()
    db.query(TR).delete()
    db.commit()
