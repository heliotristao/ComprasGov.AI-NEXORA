from sqlalchemy.orm import Session
from app.db import models
from app.schemas import ArtifactCreate, ArtifactVersionCreate

def create_artifact(db: Session, artifact: ArtifactCreate) -> models.Artifact:
    db_artifact = models.Artifact(**artifact.dict())
    db.add(db_artifact)
    db.commit()
    db.refresh(db_artifact)
    return db_artifact

def get_artifact(db: Session, artifact_id: str) -> models.Artifact | None:
    return db.query(models.Artifact).filter(models.Artifact.id == artifact_id).first()

def create_artifact_version(db: Session, version: ArtifactVersionCreate, artifact_id: str) -> models.ArtifactVersion:
    artifact = get_artifact(db, artifact_id)
    if not artifact:
        raise ValueError("Artifact not found")

    latest_version = max([v.version for v in artifact.versions], default=0)

    db_version = models.ArtifactVersion(
        **version.dict(),
        artifact_id=artifact_id,
        version=latest_version + 1,
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version

def get_artifact_version(db: Session, artifact_id: str, version_num: int | None = None):
    query = db.query(models.ArtifactVersion).filter(models.ArtifactVersion.artifact_id == artifact_id)
    if version_num:
        return query.filter(models.ArtifactVersion.version == version_num).first()
    return query.order_by(models.ArtifactVersion.version.desc()).first()
