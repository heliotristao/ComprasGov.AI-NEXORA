from sqlalchemy import Column, Integer, String, Text, Numeric, Date
from app.db.base import Base


class MarketPrice(Base):
    __tablename__ = 'market_prices'

    id = Column(Integer, primary_key=True, index=True)
    item_description = Column(Text, nullable=False)
    unit_value = Column(Numeric, nullable=False)
    quantity = Column(Integer, nullable=False)
    purchase_date = Column(Date, nullable=False)
    source = Column(String, nullable=False)
