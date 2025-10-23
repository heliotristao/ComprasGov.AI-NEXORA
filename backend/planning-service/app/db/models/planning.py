from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base

class Planning(Base):
    __tablename__ = "plannings"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    market_analysis = Column(Text)
    risks = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
