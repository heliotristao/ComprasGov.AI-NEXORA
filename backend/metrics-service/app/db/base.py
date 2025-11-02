# Import all the models, so that Base has them before being
# imported by Alembic
from app.db.base_class import Base  # noqa
from app.db.models.etp import ETP  # noqa
from app.db.models.tr import TR # noqa
from app.db.models.market_price import MarketPrice # noqa
