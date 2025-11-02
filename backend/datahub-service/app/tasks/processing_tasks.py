from app.tasks.celery_app import celery_app
from app.services.semantic_search import search_service
from app.db.session import SessionLocal
from app.crud import get_artifact_version
from app.core.storage import storage_client
import magic
import io
import PyPDF2
from docx import Document

@celery_app.task
def process_artifact(artifact_version_id: int):
    """
    Asynchronous task to process an artifact version.
    - Downloads the file from storage.
    - Extracts text from the document.
    - Adds the document to the semantic search index.
    """
    print(f"Starting processing for artifact version {artifact_version_id}")

    db = SessionLocal()
    artifact_version = get_artifact_version(db, artifact_version_id)
    db.close()

    if not artifact_version:
        print(f"Error: Artifact version {artifact_version_id} not found.")
        return

    # Download file from S3
    file_obj = storage_client.download_file(artifact_version.file_path)
    file_content = file_obj["Body"].read()

    # Extract text based on file type
    text_content = _extract_text(file_content)

    # In a real implementation, this is where you would call the AIEngine
    # to generate an embedding for the extracted text.
    # For now, the SemanticSearchService uses a dummy embedding generator.

    # Add document to Milvus
    search_service.add_document(
        artifact_version_id=artifact_version_id,
        text_content=text_content
    )

    print(f"Finished processing for artifact version {artifact_version_id}")
    return {"status": "complete", "artifact_version_id": artifact_version_id}

def _extract_text(file_content: bytes) -> str:
    """Extracts text from a file based on its MIME type."""
    mime_type = magic.from_buffer(file_content, mime=True)

    if mime_type == "application/pdf":
        return _extract_text_from_pdf(file_content)
    elif mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return _extract_text_from_docx(file_content)
    else:
        print(f"Unsupported file type: {mime_type}. Falling back to string decoding.")
        try:
            return file_content.decode("utf-8")
        except UnicodeDecodeError:
            return ""

def _extract_text_from_pdf(content: bytes) -> str:
    text = ""
    with io.BytesIO(content) as f:
        reader = PyPDF2.PdfReader(f)
        for page in reader.pages:
            text += page.extract_text()
    return text

def _extract_text_from_docx(content: bytes) -> str:
    text = ""
    with io.BytesIO(content) as f:
        doc = Document(f)
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text
