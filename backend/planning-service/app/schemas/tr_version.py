from pydantic import BaseModel
from datetime import datetime

class TRVersionBase(BaseModel):
    tr_id: int
    version: int
    filename: str
    filetype: str
    sha256: str
    path: str

class TRVersionCreate(TRVersionBase):
    pass

class TRVersionUpdate(BaseModel):
    pass

class TRVersionInDBBase(TRVersionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class TRVersion(TRVersionInDBBase):
    pass
