from unittest.mock import patch
from fastapi.testclient import TestClient

def test_search_artifacts(client: TestClient):
    with patch("app.services.semantic_search.SemanticSearchService.search") as mock_search:
        mock_search.return_value = [
            {"artifact_version_id": 1, "score": 0.9},
            {"artifact_version_id": 2, "score": 0.8},
        ]

        response = client.get("/api/v1/search/?q=test+query")

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "test query"
        assert len(data["results"]) == 2
        assert data["results"][0]["score"] == 0.9
        mock_search.assert_called_once_with(query_text="test query")
