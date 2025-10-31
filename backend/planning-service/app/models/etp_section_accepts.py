import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    Index,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class ETPSectionAccepts(Base):
    __tablename__ = 'etp_section_accepts'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), ForeignKey('etp.id'), nullable=False, index=True)
    section = Column(String, nullable=False)
    trace_id = Column(String, nullable=False, index=True)
    diff_short = Column(Text, nullable=False)
    created_by = Column(String, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    __table_args__ = (
        Index('ix_etp_section_accepts_etp_id_section', 'etp_id', 'section'),
    )
