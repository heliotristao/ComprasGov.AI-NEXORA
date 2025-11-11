import logging
from typing import Any, Dict

from app.services.tr_sync_service import TRSyncService

logger = logging.getLogger(__name__)


class TRSyncConsumer:
    def __init__(self, service: TRSyncService | None = None) -> None:
        self._service = service or TRSyncService()

    async def handle(self, topic: str, payload: Dict[str, Any]) -> None:
        logger.debug("Received event", extra={"topic": topic})
        self._service.sync_from_event(payload)


tr_sync_consumer = TRSyncConsumer()
