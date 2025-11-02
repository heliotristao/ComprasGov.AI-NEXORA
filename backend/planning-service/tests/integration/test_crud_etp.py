import uuid
import pytest
from sqlalchemy.orm import Session
from app.crud.crud_etp import increment_version, create_etp
from app.db.models.etp import ETP
from app.schemas.etp_schemas import ETPCreate
from app.db.session import SessionLocal
from fastapi import HTTPException


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_increment_version(db_session: Session):
    # Create a dummy ETP
    etp_in = ETPCreate(title="test etp")
    etp = create_etp(db=db_session, etp_in=etp_in, created_by="test_user")

    assert etp.version == 1

    # Increment the version
    updated_etp = increment_version(db=db_session, etp_id=etp.id)

    assert updated_etp.version == 2
    assert updated_etp.id == etp.id

    # Verify the version was updated in the database
    refreshed_etp = db_session.query(ETP).filter(ETP.id == etp.id).first()
    assert refreshed_etp.version == 2


def test_increment_version_not_found(db_session: Session):
    # Try to increment the version of a non-existent ETP
    non_existent_uuid = uuid.uuid4()
    with pytest.raises(HTTPException) as excinfo:
        increment_version(db=db_session, etp_id=non_existent_uuid)
    assert excinfo.value.status_code == 404
