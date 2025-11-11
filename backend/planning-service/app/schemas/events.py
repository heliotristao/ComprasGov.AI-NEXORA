from datetime import datetime
from typing import Any, Dict
from uuid import UUID

from pydantic import BaseModel

from app.db.models.tr import TRStatus, TRType


PLANEJAMENTO_TR_CRIADO_TOPIC = "planejamento.tr.criado"


class TRCreatedEvent(BaseModel):
    id: UUID
    etp_id: UUID
    title: str
    type: TRType
    status: TRStatus
    step: int
    data: Dict[str, Any]
    gaps: Dict[str, Any]
    created_by: str
    created_at: datetime

    def to_message(self) -> Dict[str, Any]:
        """Return a JSON-serializable representation."""
        return self.model_dump(mode="json")
