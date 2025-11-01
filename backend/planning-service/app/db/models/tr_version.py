import uuid
from sqlalchemy import Column, String, Integer, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class TRVersion(Base):
    __tablename__ = 'tr_versions'

    id = Column(Integer, primary_key=True, index=True)
    tr_id = Column(UUID(as_uuid=True), ForeignKey('trs.id'), nullable=False)
    version = Column(Integer, nullable=False)
    filename = Column(String, nullable=False)
    filetype = Column(String, nullable=False)
    sha256 = Column(String, nullable=False)
    path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    tr = relationship("TR", back_populates="versions")
