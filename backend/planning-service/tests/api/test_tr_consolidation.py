from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType, TRStatus
from app.tests.utils.tr import create_random_tr

def test_consolidate_tr(client: TestClient, db: Session) -> None:
    # 1. Create a TR of type "bem"
    tr_bem = create_random_tr(db, type=TRType.BEM)
    assert tr_bem.status == TRStatus.DRAFT

    # 2. Call the consolidate endpoint for the "bem" TR
    response_bem = client.post(f"/api/v1/tr/{tr_bem.id}/consolidate")
    assert response_bem.status_code == 202
    assert response_bem.json() == {"message": "TR consolidation process started."}

    # 3. Verify the "bem" TR status and versions
    db.refresh(tr_bem)
    assert tr_bem.status == TRStatus.IN_REVIEW
    assert len(tr_bem.versions) == 2  # One for DOCX, one for PDF

    # 4. Create a TR of type "servico"
    tr_servico = create_random_tr(db, type=TRType.SERVICO)
    assert tr_servico.status == TRStatus.DRAFT

    # 5. Call the consolidate endpoint for the "servico" TR
    response_servico = client.post(f"/api/v1/tr/{tr_servico.id}/consolidate")
    assert response_servico.status_code == 202

    # 6. Verify the "servico" TR status and versions
    db.refresh(tr_servico)
    assert tr_servico.status == TRStatus.IN_REVIEW
    assert len(tr_servico.versions) == 2
