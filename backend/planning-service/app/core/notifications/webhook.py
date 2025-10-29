"""Webhook notification helpers."""
from __future__ import annotations

import json
import logging
from typing import Any, Mapping

logger = logging.getLogger(__name__)


def trigger_webhook(url: str, payload: Mapping[str, Any]) -> None:
    """Stub webhook sender that logs invocation."""
    logger.info("Webhook notification to %s", url)
    logger.debug("Webhook payload: %s", json.dumps(payload))
