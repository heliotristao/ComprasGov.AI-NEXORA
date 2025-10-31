import os
import tempfile
from docx import Document
from app.db.models.tr import TR, TRType

class TRDocxBuilder:
    def __init__(self, tr: TR):
        self.tr = tr
        self.document = Document()

    def build(self) -> str:
        """
        Builds a DOCX document from a TR object.
        """
        if self.tr.type == TRType.BEM:
            self._build_from_template("Bem")
        elif self.tr.type == TRType.SERVICO:
            self._build_from_template("Serviço")
        else:
            raise ValueError("Invalid TR type")

        self._add_gap_report()
        self._add_watermark()

        return self._save_document()

    def _build_from_template(self, template_type: str):
        """
        Populates the document using a template.
        """
        self.document.add_heading(f"Termo de Referência ({template_type}) - {self.tr.title}", level=1)
        self.document.add_paragraph(f"ID do ETP: {self.tr.etp_id}")
        self.document.add_paragraph(f"Número do EDOCS: {self.tr.edocs_number}")
        self.document.add_heading("Dados do TR", level=2)

        for key, value in self.tr.data.items():
            self.document.add_paragraph(f"{key}: {value}")

    def _add_gap_report(self):
        """
        Adds a gap report to the document.
        """
        self.document.add_heading("Relatório de Gaps", level=2)
        if self.tr.gaps:
            for key, value in self.tr.gaps.items():
                self.document.add_paragraph(f"- {key}: {value}")
        else:
            self.document.add_paragraph("Nenhum gap encontrado.")

    def _add_watermark(self):
        """
        Adds a watermark to the document.
        """
        # Placeholder for watermark logic
        pass

    def _save_document(self) -> str:
        """
        Saves the document to a temporary file and returns the path.
        """
        temp_dir = tempfile.gettempdir()
        file_path = os.path.join(temp_dir, f"tr_{self.tr.id}.docx")
        self.document.save(file_path)
        return file_path
