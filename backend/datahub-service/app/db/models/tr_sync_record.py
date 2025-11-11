import uuid

from sqlalchemy import Column, DateTime, Integer, JSON, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from app.db.base_class import Base


class TRSyncRecord(Base):
    __tablename__ = "tr_sync_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    etp_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)
    step = Column(Integer, nullable=False)
    data = Column(JSON, nullable=False, default=dict)
    gaps = Column(JSON, nullable=False, default=dict)
    created_by = Column(String, nullable=False)
    source_created_at = Column(DateTime(timezone=True), nullable=False)
    synced_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self) -> str:
        return (
            f"<TRSyncRecord(id={self.id}, etp_id={self.etp_id}, title='{self.title}',"
            f" status='{self.status}', step={self.step})>"
        )
