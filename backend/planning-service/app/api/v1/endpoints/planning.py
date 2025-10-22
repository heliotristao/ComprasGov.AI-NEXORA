import uuid
from datetime import datetime
from fastapi import APIRouter, status, Response
from app.models.planning import PlanningCreate, Planning

router = APIRouter()


@router.post(
    "/plannings",
    response_model=Planning,
    status_code=status.HTTP_201_CREATED
)
def create_planning(*, planning_in: PlanningCreate, response: Response):
    """
    Create new planning.
    """
    new_id = uuid.uuid4()
    created_at = datetime.utcnow()
    planning = Planning(
        id=new_id,
        created_at=created_at,
        **planning_in.dict()
    )
    response.headers["Location"] = f"/api/v1/plannings/{new_id}"
    return planning
