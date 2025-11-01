from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType, TRStatus
from tests.utils.tr import create_random_tr
from tests.utils.template import create_random_template
from docx import Document
import os
import tempfile

def test_consolidate_tr_with_multiple_templates(client: TestClient, db: Session) -> None:
    # 1. Create templates
    template_ti = create_random_template(db, name="TI", path="templates/template_ti.docx")
    template_obras = create_random_template(db, name="Obras", path="templates/template_obras.docx")
    template_geral = create_random_template(db, name="Geral", path="templates/template_geral.docx")

    templates = {
        "ti": template_ti,
        "obras": template_obras,
        "geral": template_geral,
    }

    tr_data = {
        "objeto": "Aquisição de Notebooks",
        "justificativa": "Necessidade de novos equipamentos",
        "valor_estimado": "10000.00",
        "local_obra": "Brasília-DF",
        "descricao": "Termo de referência geral"
    }

    for key, template in templates.items():
        # 2. Create a TR linked to the template
        tr = create_random_tr(db, template_id=template.id)
        tr.data = tr_data
        db.commit()

        # 3. Call the consolidate endpoint
        response = client.post(f"/api/v1/tr/{tr.id}/consolidate")
        assert response.status_code == 202

        # 4. Verify TR status and versions
        db.refresh(tr)
        assert tr.status == TRStatus.IN_REVIEW
        assert len(tr.versions) == 2  # One for DOCX, one for PDF

        # 5. Verify the generated DOCX
        temp_dir = tempfile.gettempdir()
        docx_path = os.path.join(temp_dir, f"tr_{tr.id}.docx")

        assert os.path.exists(docx_path), f"File not found for template {key}"

        doc = Document(docx_path)

        full_text = "\\n".join([p.text for p in doc.paragraphs])

        assert tr_data["objeto"] in full_text
        assert "{{objeto}}" not in full_text

        os.remove(docx_path)

def test_consolidate_tr_template_not_found(client: TestClient, db: Session) -> None:
    # 1. Create a TR without a template
    tr = create_random_tr(db)

    # 2. Call the consolidate endpoint
    response = client.post(f"/api/v1/tr/{tr.id}/consolidate")

    # 3. Verify the response
    assert response.status_code == 404
    assert response.json() == {"detail": "TEMPLATE_NOT_FOUND"}
