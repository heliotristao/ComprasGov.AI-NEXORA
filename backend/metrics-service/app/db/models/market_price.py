from sqlalchemy import Column, Integer, String, DateTime, Numeric, Date
from sqlalchemy.sql import func
from app.db.base_class import Base

class MarketPrice(Base):
    __tablename__ = 'market_prices'
    id = Column(Integer, primary_key=True, index=True)
    item_description = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_value = Column(Numeric(10, 2), nullable=False)
    purchase_date = Column(Date, nullable=False)
    source = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = ({'extend_existing': True})
