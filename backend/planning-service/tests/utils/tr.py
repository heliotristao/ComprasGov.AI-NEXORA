from sqlalchemy.orm import Session
from app.db.models.tr import TR, TRType, TRStatus
from tests.utils.etp import create_random_etp
import uuid

import uuid
from typing import Optional

def create_random_tr(db: Session, *, type: TRType = TRType.BEM, template_id: Optional[uuid.UUID] = None) -> TR:
    etp = create_random_etp(db)
    tr = TR(
        etp_id=etp.id,
        type=type,
        title="Test TR",
        status=TRStatus.DRAFT,
        data={},
        created_by="test_user",
        template_id=template_id
    )
    db.add(tr)
    db.commit()
    db.refresh(tr)
    return tr
