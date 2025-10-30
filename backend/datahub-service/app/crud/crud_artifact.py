import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.artifact import Artifact, DocType
from app.schemas.artifact import ArtifactCreate


def get(db: Session, id: uuid.UUID) -> Optional[Artifact]:
    return db.query(Artifact).filter(Artifact.id == id).first()


def get_latest_version(
    db: Session, process_id: str, doc_type: DocType
) -> int:
    latest_artifact = (
        db.query(Artifact)
        .filter(
            Artifact.process_id == process_id, Artifact.doc_type == doc_type
        )
        .order_by(Artifact.version.desc())
        .first()
    )
    return latest_artifact.version if latest_artifact else 0


def create(
    db: Session, obj_in: ArtifactCreate, version: int, s3_key: str
) -> Artifact:
    db_obj = Artifact(
        **obj_in.dict(),
        version=version,
        s3_key=s3_key,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def search(
    db: Session,
    process_id: Optional[str] = None,
    doc_type: Optional[DocType] = None,
    org_id: Optional[str] = None,
) -> List[Artifact]:
    query = db.query(Artifact)
    if process_id:
        query = query.filter(Artifact.process_id == process_id)
    if doc_type:
        query = query.filter(Artifact.doc_type == doc_type)
    if org_id:
        query = query.filter(Artifact.org_id == org_id)
    return query.all()
