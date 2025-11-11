import logging
from typing import Dict, Any

from fastapi.encoders import jsonable_encoder

from app.core.kafka import kafka_manager
from app.db.models.tr import TR
from app.schemas.events import PLANEJAMENTO_TR_CRIADO_TOPIC, TRCreatedEvent

logger = logging.getLogger(__name__)


def _build_tr_created_payload(tr: TR) -> Dict[str, Any]:
    event = TRCreatedEvent(
        id=tr.id,
        etp_id=tr.etp_id,
        title=tr.title,
        type=tr.type,
        status=tr.status,
        step=tr.step,
        data=tr.data or {},
        gaps=tr.gaps or {},
        created_by=tr.created_by,
        created_at=tr.created_at,
    )
    return jsonable_encoder(event.to_message())


async def publish_tr_created(tr: TR) -> None:
    if not kafka_manager.enabled:
        logger.debug("Kafka disabled; skipping TR created event")
        return

    payload = _build_tr_created_payload(tr)
    try:
        await kafka_manager.publish(PLANEJAMENTO_TR_CRIADO_TOPIC, payload)
    except Exception:
        logger.exception("Falha ao publicar evento de TR criado")
