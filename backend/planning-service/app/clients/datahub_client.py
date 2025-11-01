import os
import logging
import httpx
from typing import Optional, Dict
from .base_client import BaseClient

logger = logging.getLogger(__name__)

class DataHubClient(BaseClient):
    def __init__(self, base_url: str = "http://datahub-service:8000/api/v1"):
        super().__init__(base_url)
        # In a real scenario, this token would be a system-level JWT
        self.system_token = os.getenv("INTERNAL_JWT_TOKEN", "your_fallback_token")

    def upload_artifact(
        self,
        file_content: bytes,
        filename: str,
        etp_id: str,
        version: int,
        checksum_sha1: str
    ) -> Optional[Dict]:
        """
        Uploads an artifact to the DataHub service.
        """
        files = {"file": (filename, file_content, "application/octet-stream")}
        data = {
            "related_to": "etp",
            "entity_id": etp_id,
            "version": version,
            "checksum_sha1": checksum_sha1,
        }
        headers = {"Authorization": f"Bearer {self.system_token}"}

        with self.get_client() as client:
            try:
                response = client.post(
                    "/artifacts",
                    files=files,
                    data=data,
                    headers=headers,
                    timeout=30.0,
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                logger.error(f"Error uploading artifact: {e.response.text}")
                return None
            except httpx.RequestError as e:
                logger.error(f"Request error while uploading artifact: {e}")
                return None

datahub_client = DataHubClient()
