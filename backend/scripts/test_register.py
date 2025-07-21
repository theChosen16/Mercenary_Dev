"""Script to test the user registration endpoint."""
import sys
import requests

def test_register():
    """Test the user registration endpoint."""
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    
    # Test data
    user_data = {
        "email": "test@example.com",
        "password": "testpassword123",
        "username": "testuser",
        "full_name": "Test User",
        "role": "MERCENARY"  # Using UPPERCASE to match the enum
    }
    
    try:
        print(f"[INFO] Sending registration request to {url}...")
        response = requests.post(url, json=user_data, timeout=10)
        
        print(f"[INFO] Status Code: {response.status_code}")
        print("Response JSON:", response.json())
        
        if response.status_code == 201:
            print("\n[SUCCESS] User registered successfully!")
            return True
        else:
            print(f"\n[ERROR] Registration failed with status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"[ERROR] Error during registration test: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Starting registration test...")
    if test_register():
        print("[SUCCESS] Registration test completed successfully!")
        sys.exit(0)
    else:
        print("[ERROR] Registration test failed!")
        sys.exit(1)
