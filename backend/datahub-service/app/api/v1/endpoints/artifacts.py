import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks, Request
from sqlalchemy.orm import Session

from app.api import deps
from app.api.v1 import dependencies
from app.crud import crud_artifact
from app.schemas import artifact as artifact_schema
from app.tasks.catalog_job import add_artifact_to_index
from app.core.storage import (
    upload_file_to_s3,
    get_presigned_download_url,
    generate_s3_key,
)
from app.models.artifact import DocType
from nexora_auth.decorators import require_role
from nexora_auth.audit import AuditLogger

router = APIRouter()


@router.post("/", response_model=artifact_schema.Artifact)
@require_role({"Admin", "Planejador"})
def upload_artifact(
    *,
    request: Request,
    db: Session = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(dependencies.get_current_user),
    audit_logger: AuditLogger = Depends(deps.get_audit_logger),
    process_id: str = Form(...),
    doc_type: DocType = Form(...),
    org_id: str = Form(...),
    author_id: str = Form(...),
    file: UploadFile = File(...),
):
    """
    Upload an artifact, store it in S3, and save its metadata in the database.
    """
    # 1. Get the latest version for this artifact type
    latest_version = crud_artifact.get_latest_version(
        db, process_id=process_id, doc_type=doc_type
    )
    new_version = latest_version + 1

    # 2. Generate S3 key
    s3_key = generate_s3_key(
        org_id, process_id, doc_type.value, new_version, file.filename
    )

    # 3. Upload file to S3
    if not upload_file_to_s3(file.file, s3_key):
        raise HTTPException(
            status_code=500, detail="Failed to upload file to S3"
        )

    # 4. Create artifact metadata in the database
    artifact_in = artifact_schema.ArtifactCreate(
        process_id=process_id,
        doc_type=doc_type,
        org_id=org_id,
        author_id=author_id,
        filename=file.filename,
    )
    artifact = crud_artifact.create(
        db, obj_in=artifact_in, version=new_version, s3_key=s3_key
    )

    # 5. Log the audit event
    audit_logger.log(
        action="UPLOAD_ARTIFACT",
        request=request,
        details={"artifact_id": str(artifact.id), "s3_key": artifact.s3_key},
    )

    # 6. Trigger background task to index the artifact
    add_artifact_to_index(background_tasks, artifact.id)

    return artifact


@router.get("/{artifact_id}", response_model=artifact_schema.Artifact)
def get_artifact(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
    current_user: dict = Depends(dependencies.get_current_user),
):
    """
    Get artifact metadata by ID.
    """
    artifact = crud_artifact.get(db, id=artifact_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact


@router.get("/{artifact_id}/download-url")
def get_artifact_download_url(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
    current_user: dict = Depends(dependencies.get_current_user),
):
    """
    Get a pre-signed download URL for an artifact.
    """
    artifact = crud_artifact.get(db, id=artifact_id)
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")

    download_url = get_presigned_download_url(artifact.s3_key)
    if not download_url:
        raise HTTPException(
            status_code=500, detail="Failed to generate download URL"
        )
    return {"url": download_url}


@router.get("/search/", response_model=List[artifact_schema.Artifact])
def search_artifacts(
    *,
    db: Session = Depends(deps.get_db),
    current_user: dict = Depends(dependencies.get_current_user),
    process_id: Optional[str] = None,
    doc_type: Optional[DocType] = None,
    org_id: Optional[str] = None,
):
    """
    Search for artifacts with optional filters.
    """
    artifacts = crud_artifact.search(
        db, process_id=process_id, doc_type=doc_type, org_id=org_id
    )
    return artifacts
