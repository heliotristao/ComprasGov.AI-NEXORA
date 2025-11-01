from typing import Any, Dict, Optional, Union
import uuid
from sqlalchemy.orm import Session
from app.crud.base import CRUDBase
from app.models.etp_consolidation_job import ETPConsolidationJob
from app.schemas.etp_consolidation import ETPConsolidationJobCreate

class CRUDETPConsolidationJob(CRUDBase[ETPConsolidationJob, ETPConsolidationJobCreate, ETPConsolidationJobCreate]):
    def get_by_job_id(self, db: Session, *, job_id: uuid.UUID) -> Optional[ETPConsolidationJob]:
        return db.query(self.model).filter(self.model.job_id == job_id).first()

etp_consolidation_job = CRUDETPConsolidationJob(ETPConsolidationJob)
