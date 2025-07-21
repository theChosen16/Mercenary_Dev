import sys
import psycopg2
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# Configure console to use UTF-8 encoding for Windows
if sys.platform == 'win32':
    import io
    import sys
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def test_connection(connection_string, label):
    print(f"\n=== Testing connection: {label} ===")
    print(f"Connection string: {connection_string}")
    
    # Test with psycopg2
    print("\n[TEST] Testing with psycopg2...")
    try:
        conn = psycopg2.connect(connection_string)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print("[SUCCESS] psycopg2 connection successful!")
        print(f"PostgreSQL version: {version[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] psycopg2 connection failed: {e}")
        return False
    
    # Test with SQLAlchemy
    print("\n[TEST] Testing with SQLAlchemy...")
    try:
        engine = create_engine(connection_string)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version();"))
            version = result.scalar()
            print("[SUCCESS] SQLAlchemy connection successful!")
            print(f"PostgreSQL version: {version}")
            return True
    except Exception as e:
        print(f"[ERROR] SQLAlchemy connection failed: {e}")
        return False
    finally:
        if 'engine' in locals():
            engine.dispose()

if __name__ == "__main__":
    # Test different connection string formats
    test_configs = [
        {
            "label": "Direct connection with ASCII password",
            "connection_string": "postgresql://postgres:mercenary123@localhost:5432/mercenary_db"
        },
        {
            "label": "Connection with URL-encoded password",
            "connection_string": f"postgresql://postgres:{quote_plus('mercenary123')}@localhost:5432/mercenary_db"
        },
        {
            "label": "Connection with client_encoding",
            "connection_string": "postgresql://postgres:mercenary123@localhost:5432/mercenary_db?client_encoding=utf8"
        },
        {
            "label": "Connection with connection timeout",
            "connection_string": "postgresql://postgres:mercenary123@localhost:5432/mercenary_db",
            "connect_args": {"connect_timeout": 10}
        }
    ]
    
    success = False
    for config in test_configs:
        if test_connection(config["connection_string"], config["label"]):
            success = True
            break
    
    print("\n=== Connection Tests Complete ===")
    if success:
        print("[SUCCESS] At least one connection method worked!")
    else:
        print("[ERROR] All connection attempts failed. Please check:")
        print("1. PostgreSQL service is running")
        print("2. Database 'mercenary_db' exists")
        print("3. Username and password are correct")
        print("4. Port 5432 is open and accessible")
        print("5. No firewall is blocking the connection")
        print("\nTry running this command manually to test the connection:")
        print("psql -U postgres -d mercenary_db -c \"SELECT version();\"")
