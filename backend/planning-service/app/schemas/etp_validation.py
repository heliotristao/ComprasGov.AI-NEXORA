from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from app.db.models.etp_validation import Severity


class ETPValidationBase(BaseModel):
    rule_code: str
    description: str
    severity: Severity
    passed: bool
    suggestion: Optional[str] = None


class ETPValidationCreate(ETPValidationBase):
    etp_id: UUID


class ETPValidationInDB(ETPValidationBase):
    id: int
    etp_id: UUID

    class Config:
        from_attributes = True


class ETPValidationResponse(BaseModel):
    errors: int
    warnings: int
    infos: int
    results: list[ETPValidationInDB]
