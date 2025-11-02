import hashlib
import os
import shutil
import tempfile
from reportlab.pdfgen import canvas
from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRStatus
from app.schemas.tr_version import TRVersionCreate
from app.services.tr_docx_builder import TRDocxBuilder
import app.crud as crud

class TemplateNotFoundError(ValueError):
    pass

class TRConsolidationService:
    def __init__(self, db: Session):
        self.db = db

    def consolidate(self, tr_id: int) -> None:
        """
        Orchestrates the consolidation of a TR into DOCX and PDF artifacts.
        """
        tr = self.db.query(TR).filter(TR.id == tr_id).with_for_update().first()
        if not tr:
            raise ValueError("TR not found")

        if not tr.template:
            raise TemplateNotFoundError("TEMPLATE_NOT_FOUND")

        # 1. Generate DOCX
        template_path = os.path.join(
            os.getcwd(), "backend/planning-service/app", tr.template.path
        )
        docx_builder = TRDocxBuilder(tr, template_path=template_path)
        docx_path = docx_builder.build()

        # 2. Generate PDF (placeholder)
        pdf_path = self._generate_pdf(tr)

        # 3. Process and store artifacts
        self._process_artifact(tr, docx_path, "docx")
        self._process_artifact(tr, pdf_path, "pdf")

        # 4. Update TR status
        tr.status = TRStatus.IN_REVIEW
        self.db.add(tr)
        self.db.commit()
        self.db.refresh(tr)

    def _process_artifact(self, tr: TR, file_path: str, file_type: str):
        """
        Calculates hash, stores file, and creates a version record.
        """
        # Calculate hash
        sha256 = self._calculate_sha256(file_path)

        # Store file (placeholder: move to a 'storage' directory)
        stored_path = self._store_file(file_path, f"tr_{tr.id}_{file_type}_{sha256[:8]}.{file_type}")

        # Get the current version number
        current_version = len(tr.versions)

        # Create version metadata
        version_data = TRVersionCreate(
            tr_id=tr.id,
            version=current_version + 1,
            filename=os.path.basename(stored_path),
            filetype=file_type,
            sha256=sha256,
            path=stored_path
        )
        crud.tr_version.create(self.db, obj_in=version_data)

    def _generate_pdf(self, tr: TR) -> str:
        """
        Generates a placeholder PDF.
        """
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, f"tr_{tr.id}.pdf")
        c = canvas.Canvas(file_path)
        c.drawString(100, 750, f"Termo de Referência - {tr.title}")
        c.save()
        return file_path

    def _calculate_sha256(self, file_path: str) -> str:
        """
        Calculates the SHA256 hash of a file.
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def _store_file(self, source_path: str, filename: str) -> str:
        """
        Placeholder for file storage. Moves file to a local 'storage' dir.
        """
        storage_dir = os.path.join(os.getcwd(), "storage")
        os.makedirs(storage_dir, exist_ok=True)
        destination_path = os.path.join(storage_dir, filename)
        shutil.move(source_path, destination_path)
        return destination_path
