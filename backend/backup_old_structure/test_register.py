"""Script to test the user registration endpoint with detailed logging."""
import requests
import json
import logging

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def test_register():
    url = "http://localhost:8000/api/v1/auth/register"
    
    # Generate a unique identifier for this test run
    import uuid
    test_id = str(uuid.uuid4())[:8]
    email = f"testuser_{test_id}@example.com"
    username = f"testuser_{test_id}"
    
    # Test data for registration
    user_data = {
        "email": email,
        "username": username,
        "password": "securepassword123",
        "full_name": f"Test User {test_id}",
        "role": "MERCENARY"  # Must match UserRole enum values (uppercase)
    }
    
    logger.info("Starting registration test with data: %s", json.dumps(user_data, indent=2))
    
    try:
        logger.info("Sending registration request to: %s", url)
        response = requests.post(url, json=user_data, timeout=10)
        
        logger.info("Received response with status code: %s", response.status_code)
        
        try:
            response_json = response.json()
            logger.info("Response JSON:\n%s", json.dumps(response_json, indent=2))
            
            if response.status_code == 200 or response.status_code == 201:
                logger.info("Registration successful!")
                print("\n✅ Registration successful!")
                print("User created with ID:", response_json.get("id"))
                return True
            else:
                error_detail = response_json.get("detail", "No error details provided")
                logger.error("Registration failed with error: %s", error_detail)
                print("\n[ERROR] Registration failed!")
                print(f"Error: {error_detail}")
                
                # If it's a validation error, print details
                if isinstance(error_detail, list):
                    for error in error_detail:
                        print(f"- {error.get('msg')} (location: {error.get('loc')})")
                
                return False
                
        except ValueError as ve:
            logger.error("Failed to parse JSON response: %s", ve)
            logger.error("Raw response text: %s", response.text)
            print(f"\n[ERROR] Invalid JSON response: {ve}")
            print(f"Raw response: {response.text}")
            return False
    
    except requests.exceptions.RequestException as re:
        logger.exception("Request failed")
        print(f"\n[ERROR] Request failed: {re}")
        return False
        
    except Exception as e:
        logger.exception("Unexpected error")
        print(f"\n[ERROR] Unexpected error: {e}")
        return False

if __name__ == "__main__":
    test_register()
