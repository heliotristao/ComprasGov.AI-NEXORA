import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

class ETPConsolidationJobBase(BaseModel):
    etp_id: uuid.UUID
    status: str = "queued"

class ETPConsolidationJobCreate(ETPConsolidationJobBase):
    job_id: uuid.UUID

class ETPConsolidationJobRead(ETPConsolidationJobBase):
    id: uuid.UUID
    job_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ETPConsolidationJobStatus(BaseModel):
    job_id: uuid.UUID
    status: str
    artifact_id: Optional[uuid.UUID] = None
    checksum_sha1: Optional[str] = None
    download_url: Optional[str] = Field(None, description="URL to download the artifact from DataHub")

    class Config:
        from_attributes = True
