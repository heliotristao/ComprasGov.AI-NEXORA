from pydantic import BaseModel
from app.db.models.tr_version import FileType


class TRVersionBase(BaseModel):
    version: int
    filename: str
    filetype: FileType
    sha256: str
    path: str


class TRVersionCreate(TRVersionBase):
    tr_id: int


class TRVersionRead(TRVersionBase):
    id: int
    tr_id: int

    class Config:
        from_attributes = True
