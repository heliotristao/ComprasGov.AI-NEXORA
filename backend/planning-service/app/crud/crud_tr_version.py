from app.crud.base import CRUDBase
from app.db.models.tr_version import TRVersion
from app.schemas.tr_version import TRVersionCreate, TRVersionUpdate

class CRUDTRVersion(CRUDBase[TRVersion, TRVersionCreate, TRVersionUpdate]):
    pass

tr_version = CRUDTRVersion(TRVersion)
