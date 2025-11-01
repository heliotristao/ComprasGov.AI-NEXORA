from app.crud.base import CRUDBase
from app.db.models.signed_document import SignedDocument
from app.schemas.signed_document import SignedDocumentCreate, SignedDocumentSchema


class CRUDSignedDocument(CRUDBase[SignedDocument, SignedDocumentCreate, SignedDocumentSchema]):
    pass

signed_document = CRUDSignedDocument(SignedDocument)
