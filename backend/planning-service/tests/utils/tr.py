from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType
from app.schemas.tr import TRCreate

def create_random_tr(db: Session, *, type: TRType = TRType.BEM) -> TR:
    """
    Creates a random TR for testing purposes.
    """
    tr_in = TRCreate(
        dados={"objeto": "Test Object", "justificativa": "Test Justification"},
        type=type,
        plan_id=1,
    )
    return TR.create(db, obj_in=tr_in)
