"""
Service for consolidating Termo de Referência (TR) documents.
"""
from sqlalchemy.orm import Session
from app.crud import tr as crud_tr
from app.db.models.tr import TR, TRStatus
from app.db.models.tr_version import TRVersion, FileType
from app.utils.tr_docx_builder import generate_docx
from app.utils.pdf_exporter import convert_to_pdf
from app.core.file_storage import store_file


def consolidate_tr(db: Session, tr_id: int) -> list[TRVersion]:
    """
    Orchestrates the consolidation of a TR.

    - Fetches the TR.
    - Determines the next version number.
    - Generates DOCX and PDF documents.
    - Stores the files and calculates their hashes.
    - Creates `TRVersion` records in the database.
    - Updates the TR status to "in_review".

    Args:
        db: The SQLAlchemy database session.
        tr_id: The ID of the TR to consolidate.

    Returns:
        A list of the created TRVersion objects.
    """
    tr = db.query(TR).filter(TR.id == tr_id).first()
    if not tr:
        raise ValueError(f"TR with id {tr_id} not found.")

    # 1. Determine the next version number
    last_version = (
        db.query(TRVersion.version)
        .filter(TRVersion.tr_id == tr_id)
        .order_by(TRVersion.version.desc())
        .first()
    )
    next_version = (last_version[0] if last_version else 0) + 1

    # 2. Generate documents (using a mock template for now)
    mock_template = {"header_text": f"Processo {tr.id}", "footer_text": "Documento Oficial"}
    docx_stream = generate_docx(tr, mock_template, watermark=f"VERSÃO {next_version}")
    pdf_stream = convert_to_pdf(docx_stream)

    # 3. Store files and create version records
    generated_versions = []

    # Store DOCX
    docx_filename = f"TR_{tr_id}_v{next_version}.docx"
    docx_path, docx_sha256 = store_file(docx_stream, docx_filename)
    docx_version = TRVersion(
        tr_id=tr_id,
        version=next_version,
        filename=docx_filename,
        filetype=FileType.docx,
        sha256=docx_sha256,
        path=docx_path,
    )
    generated_versions.append(docx_version)

    # Store PDF
    pdf_filename = f"TR_{tr_id}_v{next_version}.pdf"
    pdf_path, pdf_sha256 = store_file(pdf_stream, pdf_filename)
    pdf_version = TRVersion(
        tr_id=tr_id,
        version=next_version,
        filename=pdf_filename,
        filetype=FileType.pdf,
        sha256=pdf_sha256,
        path=pdf_path,
    )
    generated_versions.append(pdf_version)

    # 4. Persist changes
    db.add_all(generated_versions)
    tr.status = TRStatus.EM_REVISAO
    db.commit()

    for v in generated_versions:
        db.refresh(v)

    return generated_versions
