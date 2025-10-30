from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType, TRStatus
from app.tests.utils.tr import create_random_tr


def test_consolidate_tr_bem(client: TestClient, db: Session):
    """
    Tests the consolidation of a 'bem' type TR.
    """
    tr = create_random_tr(db, type=TRType.BEM)
    response = client.post(f"/api/v1/tr/{tr.id}/consolidar")

    assert response.status_code == 200
    versions = response.json()
    assert len(versions) == 2
    assert versions[0]["version"] == 1
    assert versions[0]["filetype"] == "docx"
    assert versions[1]["filetype"] == "pdf"

    db.refresh(tr)
    assert tr.status == TRStatus.EM_REVISAO


def test_consolidate_tr_servico(client: TestClient, db: Session):
    """
    Tests the consolidation of a 'servico' type TR.
    """
    tr = create_random_tr(db, type=TRType.SERVICO)
    response = client.post(f"/api/v1/tr/{tr.id}/consolidar")

    assert response.status_code == 200
    versions = response.json()
    assert len(versions) == 2
    assert versions[0]["version"] == 1


def test_consolidate_tr_increments_version(client: TestClient, db: Session):
    """
    Tests that consolidating a TR twice increments the version number.
    """
    tr = create_random_tr(db)

    # First consolidation
    response1 = client.post(f"/api/v1/tr/{tr.id}/consolidar")
    assert response1.status_code == 200
    versions1 = response1.json()
    assert versions1[0]["version"] == 1

    # Second consolidation
    response2 = client.post(f"/api/v1/tr/{tr.id}/consolidar")
    assert response2.status_code == 200
    versions2 = response2.json()
    assert versions2[0]["version"] == 2


def test_consolidate_tr_not_found(client: TestClient, db: Session):
    """
    Tests that consolidating a non-existent TR returns a 404 error.
    """
    response = client.post("/api/v1/tr/999/consolidar")
    assert response.status_code == 404
