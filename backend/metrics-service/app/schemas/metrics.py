from pydantic import BaseModel


class ProcessStatusMetrics(BaseModel):
    """
    Response schema for process status metrics.
    """
    draft: int
    in_review: int
    approved: int

    model_config = {
        "json_schema_extra": {
            "example": {
                "draft": 15,
                "in_review": 5,
                "approved": 25,
            }
        }
    }


class TrendMetrics(BaseModel):
    """
    Response schema for trend metrics.
    """
    labels: list[str]
    values: list[int]

    model_config = {
        "json_schema_extra": {
            "example": {
                "labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                "values": [10, 12, 15, 13, 18, 20],
            }
        }
    }


class SavingsMetrics(BaseModel):
    """
    Response schema for savings metrics.
    """
    estimated_savings: float
    currency: str = "BRL"

    model_config = {
        "json_schema_extra": {
            "example": {
                "estimated_savings": 123456.78,
                "currency": "BRL",
            }
        }
    }
