from app.crud.base import CRUDBase
from app.db.models.planning import Planning
from app.schemas.plan import PlanningCreate, PlanningUpdate


class CRUDPlan(CRUDBase[Planning, PlanningCreate, PlanningUpdate]):
    ...


crud_plan = CRUDPlan(Planning)
