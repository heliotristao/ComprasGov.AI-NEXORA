from sqlalchemy.orm import Session
import uuid
from fastapi import HTTPException

from app.crud import crud_etp, crud_tr
from app.core.mapping.etp_tr_matrix import BEM_ETP_TO_TR_MATRIX, SERVICO_ETP_TO_TR_MATRIX
from app.core.normalizers.text import normalize_text
from app.db.models.tr import TR, TRType
from app.schemas.tr import TRCreate


def build_tr_from_etp(db: Session, *, etp_id: uuid.UUID, tipo: TRType, user_id: str) -> TR:
    etp = crud_etp.get_etp(db, etp_id=etp_id)
    if not etp:
        raise HTTPException(status_code=404, detail="ETP not found")

    if etp.status != "published":
        raise HTTPException(status_code=400, detail="ETP must be published before transforming to TR")

    matrix = BEM_ETP_TO_TR_MATRIX if tipo == TRType.BEM else SERVICO_ETP_TO_TR_MATRIX

    tr_data = {}
    gaps = []

    for section, mapping in matrix.items():
        source_field = mapping["source"]
        target_path = mapping["target"]

        etp_data_value = etp.data.get(source_field)

        if etp_data_value:
            normalized_value = normalize_text(etp_data_value)

            keys = target_path.split('.')
            current_level = tr_data
            for key in keys[:-1]:
                current_level = current_level.setdefault(key, {})
            current_level[keys[-1]] = normalized_value
        else:
            gaps.append(
                {
                    "field": target_path,
                    "message": f"Field '{source_field}' from ETP was not found and could not be mapped.",
                }
            )

    tr_in = TRCreate(
        etp_id=etp_id,
        title=f"TR from ETP - {etp.title}",
        type=tipo,
        data=tr_data,
        gaps={"gaps": gaps},
    )

    tr = crud_tr.tr.create(db, obj_in=tr_in, created_by=user_id)
    return tr
