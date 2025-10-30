from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)  # Assuming user ID is a string (e.g., from JWT sub)
    org_id = Column(String)   # Assuming org ID is a string
    action = Column(String, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON, nullable=True)
