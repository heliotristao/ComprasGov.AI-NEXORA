import uuid
from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.services.document_generator import DocumentGenerator

def generate_pdf_response(doc_id: uuid.UUID, doc_type: str, db: Session):
    """
    Generates a PDF response for a given document.
    """
    doc_generator = DocumentGenerator(db)
    try:
        if doc_type == "etp":
            docx_path = doc_generator.gerar_etp_docx(documento_id=doc_id)
        elif doc_type == "tr":
            docx_path = doc_generator.gerar_tr_docx(documento_id=doc_id)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document type",
            )

        pdf_path = doc_generator.converter_para_pdf(docx_path)

        def file_iterator(file_path):
            with open(file_path, "rb") as f:
                yield from f

        return StreamingResponse(
            file_iterator(pdf_path),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename={doc_type}_{doc_id}.pdf"
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate PDF: {e}",
        )
