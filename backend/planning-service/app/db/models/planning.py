from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.db.base import Base


class Planning(Base):
    __tablename__ = "plannings"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(String)
    market_analysis = Column(Text, nullable=True)
    risks = Column(Text, nullable=True)
    necessity = Column(Text, nullable=True)
    solution_comparison = Column(Text, nullable=True)
    contract_quantities = Column(Text, nullable=True)
    technical_viability = Column(Text, nullable=True)
    expected_results = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
