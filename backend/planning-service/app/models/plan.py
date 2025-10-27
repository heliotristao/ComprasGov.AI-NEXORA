from sqlalchemy import Column, String, DateTime, Numeric
from sqlalchemy.sql import func
from app.db.base import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, index=True)
    objective = Column(String, index=True)
    justification = Column(String, index=True)
    status = Column(String, default="Em Elaboração")
    estimated_value = Column(Numeric(10, 2))
    responsible_department = Column(String)
    priority = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
