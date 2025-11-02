# backend/planning-service/app/db/models/audit_log.py
from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from app.db.base_class import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    user_id = Column(String, index=True)
    org_id = Column(String, index=True)
    action = Column(String, nullable=False, index=True)
    details = Column(JSON)
