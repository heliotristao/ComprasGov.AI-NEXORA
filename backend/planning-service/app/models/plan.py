from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, index=True)
    objective = Column(String, index=True)
    justification = Column(String, index=True)
    status = Column(String, default="Em Elaboração")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
