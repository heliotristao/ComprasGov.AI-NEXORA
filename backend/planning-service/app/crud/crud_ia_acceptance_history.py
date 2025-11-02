from app.crud.base import CRUDBase
from app.db.models.ia_acceptance_history import IAAcceptanceHistory
from app.schemas.ia_acceptance import IAAcceptanceHistorySchema


class CRUDIAAcceptanceHistory(CRUDBase[IAAcceptanceHistory, IAAcceptanceHistorySchema, IAAcceptanceHistorySchema]):
    pass


ia_acceptance_history = CRUDIAAcceptanceHistory(IAAcceptanceHistory)
