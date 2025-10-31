from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType, TRStatus
from app.tests.utils.etp import create_random_etp
import uuid

def create_random_tr(db: Session, *, type: TRType = TRType.BEM) -> TR:
    etp = create_random_etp(db)
    tr = TR(
        etp_id=etp.id,
        type=type,
        title="Test TR",
        status=TRStatus.DRAFT,
        data={},
        created_by="test_user"
    )
    db.add(tr)
    db.commit()
    db.refresh(tr)
    return tr
