from fastapi import APIRouter, UploadFile, File, HTTPException
from app.rag.ingestor import ingest_document
import tempfile
import os

router = APIRouter()

@router.post("/rag/ingest")
async def ingest_pdf(file: UploadFile = File(...)):
    """
    Endpoint to upload a PDF file and ingest it into the vector store.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs are accepted.")

    try:
        # Create a temporary file to store the uploaded PDF
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name

        # Ingest the document from the temporary file path
        ingest_document(tmp_path)

    finally:
        # Clean up the temporary file
        if 'tmp_path' in locals() and os.path.exists(tmp_path):
            os.remove(tmp_path)

    return {"message": "Document ingested successfully."}
