"""Enhanced test script for authentication endpoints."""
import json
import os
import sys
from datetime import datetime

import requests

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Test configuration
BASE_URL = "http://localhost:8000/api/v1"
timestamp = int(datetime.now().timestamp())
TEST_EMAIL = f"testuser_{timestamp}@example.com"
TEST_USERNAME = f"testuser_{timestamp}"
TEST_PASSWORD = "TestPass123!"

# Headers for JSON requests
HEADERS = {
    "Content-Type": "application/json",
    "Accept": "application/json"
}


def print_step(step_num, description):
    """Print a test step with formatting."""
    print(f"\n{'=' * 50}")
    print(f"STEP {step_num}: {description}")
    print(f"{'=' * 50}")


def test_register_user():
    """Test user registration endpoint."""
    print_step(1, "Testing user registration")

    # Prepare registration data
    user_data = {
        "email": TEST_EMAIL,
        "username": TEST_USERNAME,
        "password": TEST_PASSWORD,
        "full_name": "Test User",
        "bio": "Test bio"
    }

    try:
        # Make the registration request
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json=user_data,
            headers=HEADERS,
            timeout=10
        )

        # Print response details
        print(f"Status Code: {response.status_code}")
        print("Headers:", dict(response.headers))
        print("Raw Response:", response.text)

        # Try to parse JSON if possible
        try:
            print("JSON Response:", json.dumps(response.json(), indent=2))
        except json.JSONDecodeError:
            print("Response is not valid JSON")

    except requests.exceptions.RequestException as e:
        error_msg = f"Request failed: {str(e)}"
        print(error_msg)
        return False, {"error": str(e), "details": "Registration failed"}

    # Validate response
    if response.status_code == 201:
        print("SUCCESS: Registration successful!")
        try:
            return True, response.json()
        except json.JSONDecodeError:
            return True, {
                "status": "success",
                "message": "User registered successfully",
                "raw_response": response.text
            }

    error_msg = (
        f"ERROR: Registration failed with status {response.status_code}: "
        f"{response.text}"
    )
    print(error_msg)
    try:
        return False, response.json()
    except json.JSONDecodeError:
        return False, {
            "status": "error",
            "message": error_msg,
            "raw_response": response.text
        }


def test_login():
    """Test user login endpoint."""
    print_step(2, "Testing user login")

    # Prepare login data
    login_data = {
        "username": TEST_EMAIL,  # Using email as username for login
        "password": TEST_PASSWORD
    }

    # Make the login request
    response = requests.post(
        f"{BASE_URL}/auth/login/access-token",
        data=login_data,
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    # Print response details
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

    # Validate response
    if response.status_code == 200 and "access_token" in response.json():
        print("SUCCESS: Login successful!")
        return True, response.json()

    print(f"ERROR: Login failed: {response.text}")
    return False, response.json()


def test_protected_endpoint(access_token):
    """Test accessing a protected endpoint with the access token."""
    print_step(3, "Testing protected endpoint access")

    # Set up auth header
    headers = {"Authorization": f"Bearer {access_token}"}
    headers.update(HEADERS)

    # Make request to a protected endpoint
    response = requests.get(f"{BASE_URL}/users/me", headers=headers)

    # Print response details
    print(f"Status Code: {response.status_code}")
    print("Response:", json.dumps(response.json(), indent=2))

    # Validate response
    if response.status_code == 200:
        print("SUCCESS: Successfully accessed protected endpoint!")
        return True, response.json()

    print(f"ERROR: Failed to access protected endpoint: {response.text}")
    return False, response.json()


def main():
    """Run all authentication tests."""
    print("Starting authentication tests...")

    # Test user registration
    success, result = test_register_user()
    if not success:
        print("ERROR: Authentication tests failed at registration step.")
        return False

    # Test user login
    success, result = test_login()
    if not success:
        print("ERROR: Authentication tests failed at login step.")
        return False

    # Get access token from login response
    access_token = result.get("access_token")
    if not access_token:
        print("ERROR: No access token received from login.")
        return False

    # Test protected endpoint
    success, _ = test_protected_endpoint(access_token)
    if not success:
        print("ERROR: Tests failed at protected endpoint step.")
        return False

    print("\nSUCCESS: All authentication tests passed successfully!")
    return True


if __name__ == "__main__":
    main()
