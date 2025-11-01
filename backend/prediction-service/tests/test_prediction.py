import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.compose import ColumnTransformer
import lightgbm as lgb

client = TestClient(app)

@pytest.fixture
def mock_pipeline():
    # Create a dummy pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ('text', TfidfVectorizer(), 'item_description'),
            ('numeric', 'passthrough', ['quantity', 'year', 'month', 'day'])
        ]
    )

    pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('regressor', lgb.LGBMRegressor())
    ])

    dummy_data = pd.DataFrame({
        'item_description': ['test', 'another test'],
        'quantity': [1, 2],
        'year': [2023, 2024],
        'month': [1, 2],
        'day': [1, 3]
    })
    dummy_target = pd.Series([100, 200])
    pipeline.fit(dummy_data, dummy_target)

    return pipeline

def test_predict_price_endpoint(mock_pipeline):
    with patch('app.api.v1.endpoints.prediction.pipeline', mock_pipeline):
        response = client.post(
            "/api/v1/market/predict-price",
            json={"description": "Cadeira de escritório", "category": "Mobiliário", "region": "Sudeste"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "predicted_price" in data
        assert "model_version" in data
        assert isinstance(data["predicted_price"], float)
        assert data["model_version"] == "0.1.0"
