# Prediction Service

This service is responsible for training and serving the price prediction model.

## Model Performance

- **RMSE:** 0.0 (Baseline - model not yet trained)

---

### Example Price Statistics API Queries

The following queries demonstrate how to retrieve price statistics from the `/market/price-stats` endpoint.

1.  **Get stats for a specific item description:**
    ```bash
    curl -X GET "http://localhost:8000/api/v1/market/price-stats?query=Caneta%20Esferogr%C3%A1fica"
    ```

2.  **Get stats for a broader category (e.g., "Monitor"):**
    ```bash
    curl -X GET "http://localhost:8000/api/v1/market/price-stats?query=Monitor"
    ```

3.  **Get stats for a service-related item:**
    ```bash
    curl -X GET "http://localhost:8000/api/v1/market/price-stats?query=Servi%C3%A7o%20de%20Limpeza"
    ```
