import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ArtifactVersionBase(BaseModel):
    version: int
    file_path: str
    file_hash: str

class ArtifactVersionCreate(ArtifactVersionBase):
    pass

class ArtifactVersionSchema(ArtifactVersionBase):
    id: int
    artifact_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True

class ArtifactBase(BaseModel):
    process_id: str
    doc_type: str
    created_by: str

class ArtifactCreate(ArtifactBase):
    pass

class ArtifactSchema(ArtifactBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: Optional[datetime]
    versions: list[ArtifactVersionSchema] = []

    class Config:
        from_attributes = True
