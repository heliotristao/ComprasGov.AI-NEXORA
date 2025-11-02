from app.crud.base import CRUDBase
from app.db.models.ai_execution import AIExecution
from app.schemas.ai_execution import AIExecutionCreate, AIExecutionUpdate

class CRUDAIExecution(CRUDBase[AIExecution, AIExecutionCreate, AIExecutionUpdate]):
    pass

ai_execution = CRUDAIExecution(AIExecution)
