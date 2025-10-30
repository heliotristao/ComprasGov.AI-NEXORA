import uuid
from datetime import datetime
from pydantic import BaseModel
from app.models.artifact import DocType


class ArtifactBase(BaseModel):
    process_id: str
    doc_type: DocType
    org_id: str
    author_id: str
    filename: str


class ArtifactCreate(ArtifactBase):
    pass


class Artifact(ArtifactBase):
    id: uuid.UUID
    version: int
    s3_key: str
    created_at: datetime

    class Config:
        from_attributes = True
