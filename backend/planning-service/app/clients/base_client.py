import httpx
from nexora_auth.middlewares import trace_id_var

class BaseClient:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def get_client(self) -> httpx.Client:
        trace_id = trace_id_var.get()
        headers = {}
        if trace_id:
            headers["X-Trace-ID"] = trace_id
        return httpx.Client(base_url=self.base_url, headers=headers)
