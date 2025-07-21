"""Enhanced script to test the user registration endpoint with detailed logging."""
import json
import sys
import requests
from datetime import datetime

def print_header(title):
    """Print a formatted header for test sections."""
    print("\n" + "=" * 80)
    print(f"{title}".center(80))
    print("=" * 80)

def test_register():
    """Test the user registration endpoint with detailed logging."""
    base_url = "http://127.0.0.1:8000/api/v1/auth"
    register_url = f"{base_url}/register"

    # Generate a unique username and email for testing
    timestamp = int(datetime.now().timestamp())
    test_email = f"testuser_{timestamp}@example.com"
    test_username = f"testuser_{timestamp}"

    # Test data with all required fields
    user_data = {
        "email": test_email,
        "password": "TestPassword123!",
        "username": test_username,
        "full_name": "Test User",
        "role": "MERCENARY"  # Using UPPERCASE to match the enum
    }

    try:
        print_header("TESTING USER REGISTRATION ENDPOINT")
        print(f"[INFO] Test started at: {datetime.now().isoformat()}")
        print(f"[INFO] Using registration URL: {register_url}")
        print("\n[INFO] Test user data:")
        print(json.dumps(user_data, indent=2))

        # Make the registration request
        print("\n[INFO] Sending registration request...")
        response = requests.post(register_url, json=user_data, timeout=10)

        # Print response details
        print("\n[INFO] Response Status Code:", response.status_code)
        print("[INFO] Response Headers:")
        for header, value in response.headers.items():
            print(f"  {header}: {value}")

        try:
            response_data = response.json()
            print("\n[INFO] Response JSON:")
            print(json.dumps(response_data, indent=2))
        except ValueError:
            print("\n[WARNING] Response is not valid JSON")
            print("Response content:", response.text)

        # Check the response status code
        if response.status_code == 201:
            print("\n[SUCCESS] User registered successfully!")
            print("[SUCCESS] Test passed!")
            return True
        elif response.status_code == 400:
            print("\n[ERROR] Bad request. Possible issues:")
            print("- Missing required fields")
            print("- Invalid email format")
            print("- Password doesn't meet requirements")
            print("- Email or username already exists")
        elif response.status_code == 422:
            print("\n[ERROR] Validation error. Check the request data format.")
        else:
            print(f"\n[ERROR] Unexpected status code: {response.status_code}")

        print("\n[FAILED] Registration test failed!")
        return False

    except requests.exceptions.RequestException as e:
        print(f"\n[ERROR] Request failed: {e}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response status code: {e.response.status_code}")
            print("Response content:", e.response.text)
        return False
    except Exception as e:
        print(f"\n[ERROR] An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("\n" + "=" * 80)
    print("USER REGISTRATION TEST SCRIPT".center(80))
    print("=" * 80)

    if test_register():
        sys.exit(0)
    else:
        sys.exit(1)
