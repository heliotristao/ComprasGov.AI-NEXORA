from sqlalchemy.orm import Session
import random
import string

from app.db.models.etp import ETP, ETPStatus
from tests.utils.user import create_random_user


def random_lower_string(length: int = 32) -> str:
    return "".join(random.choices(string.ascii_lowercase, k=length))


def create_random_etp(db: Session, *, status: ETPStatus = ETPStatus.draft, data: dict = None) -> ETP:
    title = random_lower_string()
    if data is None:
        data = {
            "necessidade_contratacao": "Test necessity",
            "descricao_solucao": "Test solution",
            "requisitos_necessarios": "Test requirements",
            "modelo_prestacao_servicos": "Test model",
            "estimativa_valor_contratacao": "Test value",
            "forma_pagamento": "Test payment",
        }
    user = create_random_user(db)

    etp = ETP(
        title=title,
        status=status,
        created_by=user,
        data=data,
    )
    db.add(etp)
    db.commit()
    db.refresh(etp)
    return etp
