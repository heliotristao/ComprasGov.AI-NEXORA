"""
PDF Exporter for converting DOCX files.
"""
from io import BytesIO
from docx import Document
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch

def convert_to_pdf(docx_stream: BytesIO) -> BytesIO:
    """
    Converts a DOCX file stream to a text-only PDF file stream.

    This implementation extracts the text from the DOCX and renders it
    into a simple PDF, sacrificing formatting for functionality.

    Args:
        docx_stream: A BytesIO stream of the DOCX file.

    Returns:
        A BytesIO stream of the converted PDF file.
    """
    docx_stream.seek(0)
    doc = Document(docx_stream)

    pdf_stream = BytesIO()
    c = canvas.Canvas(pdf_stream, pagesize=letter)
    width, height = letter

    y_position = height - inch
    margin = inch

    for para in doc.paragraphs:
        # Simple text extraction
        text = para.text
        if not text.strip():
            continue

        # Add text to PDF
        text_object = c.beginText(margin, y_position)
        text_object.setFont("Helvetica", 10)

        # Basic line wrapping
        lines = [text[i:i+90] for i in range(0, len(text), 90)]
        for line in lines:
            text_object.textLine(line)
            y_position -= 12
            if y_position < margin:
                c.drawText(text_object)
                c.showPage()
                y_position = height - inch
                text_object = c.beginText(margin, y_position)
                text_object.setFont("Helvetica", 10)

        c.drawText(text_object)

    c.save()
    pdf_stream.seek(0)
    return pdf_stream
