"""SQLAlchemy type for transparently encrypting/decrypting string columns."""

from __future__ import annotations

from typing import Any

from sqlalchemy import LargeBinary, String, func, literal
from sqlalchemy.sql.type_api import TypeEngine
from sqlalchemy.types import TypeDecorator

from app.core.config import settings


class EncryptedString(TypeDecorator):
    """Encrypt string values at rest using PostgreSQL's pgcrypto extension."""

    impl = LargeBinary
    cache_ok = True

    def __init__(self, length: int | None = None, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.length = length
        self._key = settings.encryption_key
        if not self._key:
            raise ValueError("ENCRYPTION_KEY must be configured to use EncryptedString.")

    def load_dialect_impl(self, dialect) -> TypeEngine[Any]:  # type: ignore[override]
        if self.length:
            return dialect.type_descriptor(LargeBinary(self.length))
        return super().load_dialect_impl(dialect)

    def process_bind_param(self, value: Any, dialect) -> Any:  # type: ignore[override]
        return value

    def bind_expression(self, bindvalue):  # type: ignore[override]
        if getattr(bindvalue, "value", None) is None:
            return bindvalue
        return func.pgp_sym_encrypt(bindvalue, literal(self._key))

    def column_expression(self, column):  # type: ignore[override]
        target_type = String(self.length) if self.length else String()
        return func.pgp_sym_decrypt(column, literal(self._key)).cast(target_type)

    def process_result_value(self, value: Any, dialect) -> Any:  # type: ignore[override]
        return value
