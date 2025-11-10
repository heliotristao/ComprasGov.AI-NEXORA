from __future__ import annotations

from typing import Iterable, Sequence

from sqlalchemy.orm import Session

from app.models import Contract, ContractClause


class ContractNotFoundError(Exception):
    """Raised when a contract cannot be found in the persistence layer."""


class ContractRepository:
    """Data access layer encapsulating persistence operations for contracts."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def get(self, contract_id: int) -> Contract | None:
        return self._session.get(Contract, contract_id)

    def add_clauses(self, contract_id: int, clauses: Iterable[dict[str, str]]) -> Sequence[ContractClause]:
        contract = self.get(contract_id)
        if contract is None:
            raise ContractNotFoundError(f"Contrato {contract_id} não encontrado")

        created_clauses: list[ContractClause] = []
        for clause in clauses:
            clause_obj = ContractClause(
                contract_id=contract_id,
                tipo=clause["tipo"],
                descricao=clause["descricao"],
            )
            self._session.add(clause_obj)
            created_clauses.append(clause_obj)

        self._session.commit()

        for clause in created_clauses:
            self._session.refresh(clause)

        return created_clauses
