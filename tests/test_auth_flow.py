import pytest
import requests
import time

# --- Test Configuration ---
BASE_URL = "http://localhost:80"  # Traefik entrypoint
GOVERNANCE_SERVICE_URL = f"{BASE_URL}/governance"
PLANNING_SERVICE_URL = f"{BASE_URL}/planning"

# --- Test Cases ---

def test_authentication_flow():
    # Step 1: Obtain a token from the governance-service
    token_url = f"{GOVERNANCE_SERVICE_URL}/api/v1/token"
    login_data = {"username": "master@comprasgov.ai", "password": "masterpassword"}

    # It might take a moment for the services to be ready
    for _ in range(5):
        try:
            response = requests.post(token_url, data=login_data)
            if response.status_code == 200:
                break
        except requests.exceptions.ConnectionError:
            time.sleep(5)
    else:
        pytest.fail("Could not connect to the governance-service")

    assert response.status_code == 200, f"Failed to get token: {response.text}"
    token = response.json()["access_token"]

    # Step 2: Use the token to access a protected endpoint on the planning-service
    plans_url = f"{PLANNING_SERVICE_URL}/api/v1/plans/"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(plans_url, headers=headers)

    assert response.status_code == 200, f"Failed to access protected endpoint: {response.text}"
    assert isinstance(response.json(), list)
