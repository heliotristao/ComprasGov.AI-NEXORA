import hashlib
import uuid
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api import deps
from app.core.storage import storage_client
from app.tasks.processing_tasks import process_artifact

router = APIRouter()

@router.post("/", response_model=schemas.ArtifactSchema)
def create_artifact(
    *,
    db: Session = Depends(deps.get_db),
    artifact_in: schemas.ArtifactCreate,
    file: UploadFile = File(...),
):
    artifact = crud.create_artifact(db=db, artifact=artifact_in)
    file_path, file_hash = _save_upload_file(file, artifact.id)

    version_in = schemas.ArtifactVersionCreate(
        file_path=file_path, file_hash=file_hash, version=1
    )
    version = crud.create_artifact_version(db=db, version=version_in, artifact_id=artifact.id)

    process_artifact.delay(version.id)
    db.refresh(artifact)
    return artifact

@router.post("/{artifact_id}/versions", response_model=schemas.ArtifactVersionSchema)
def create_artifact_version(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
    file: UploadFile = File(...),
):
    artifact = crud.get_artifact(db=db, artifact_id=str(artifact_id))
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")

    file_path, file_hash = _save_upload_file(file, artifact.id)
    version_in = schemas.ArtifactVersionCreate(
        file_path=file_path, file_hash=file_hash, version=0
    )
    version = crud.create_artifact_version(db=db, version=version_in, artifact_id=str(artifact_id))

    process_artifact.delay(version.id)
    return version

@router.get("/{artifact_id}", response_model=schemas.ArtifactSchema)
def get_artifact(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
):
    artifact = crud.get_artifact(db=db, artifact_id=str(artifact_id))
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact

@router.get("/{artifact_id}/versions/{version_num}", response_model=schemas.ArtifactVersionSchema)
def get_artifact_version(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
    version_num: int,
):
    version = crud.get_artifact_version(db=db, artifact_id=str(artifact_id), version_num=version_num)
    if not version:
        raise HTTPException(status_code=404, detail="Artifact version not found")
    return version

@router.get("/{artifact_id}/versions/{version_num}/download")
def download_artifact_version(
    *,
    db: Session = Depends(deps.get_db),
    artifact_id: uuid.UUID,
    version_num: int,
):
    version = crud.get_artifact_version(db=db, artifact_id=str(artifact_id), version_num=version_num)
    if not version:
        raise HTTPException(status_code=404, detail="Artifact version not found")

    file_obj = storage_client.download_file(version.file_path)
    return StreamingResponse(file_obj["Body"], media_type=file_obj["ContentType"])

def _save_upload_file(upload_file: UploadFile, artifact_id: uuid.UUID) -> tuple[str, str]:
    file_content = upload_file.file.read()

    file_hash = hashlib.sha256(file_content).hexdigest()

    upload_file.file.seek(0)

    file_extension = upload_file.filename.split(".")[-1] if "." in upload_file.filename else "bin"
    object_name = f"{artifact_id}/{file_hash}.{file_extension}"

    storage_client.upload_file(upload_file.file, object_name)

    return object_name, file_hash
