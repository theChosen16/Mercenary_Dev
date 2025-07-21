"""Test database connection using SQLAlchemy."""
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL

def test_connection():
    """Test database connection with different configurations."""
    # Try different connection strings
    connection_strings = [
        # Standard connection
        "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres",
        # With explicit encoding
        "postgresql+psycopg2://postgres:postgres@localhost:5432/postgres?client_encoding=utf8",
        # With different driver
        "postgresql+pg8000://postgres:postgres@localhost:5432/postgres",
    ]
    
    for conn_str in connection_strings:
        print(f"\nTrying connection string: {conn_str}")
        try:
            engine = create_engine(conn_str)
            with engine.connect() as conn:
                # Test the connection
                result = conn.execute(text("SELECT version();"))
                print("Success! PostgreSQL version:")
                print(result.scalar())
                
                # Check if our database exists
                result = conn.execute(
                    text("SELECT 1 FROM pg_database WHERE datname = 'mercenary_db'")
                )
                if result.scalar():
                    print("Database 'mercenary_db' exists!")
                    
                    # Try to connect to mercenary_db directly
                    db_conn_str = conn_str.replace("/postgres", "/mercenary_db")
                    try:
                        db_engine = create_engine(db_conn_str)
                        with db_engine.connect() as db_conn:
                            print("Connected to 'mercenary_db' successfully!")
                            
                            # List tables
                            tables = db_conn.execute(
                                text("""
                                    SELECT table_name 
                                    FROM information_schema.tables 
                                    WHERE table_schema = 'public'
                                """)
                            )
                            tables = [row[0] for row in tables]
                            if tables:
                                print("\nTables in mercenary_db:")
                                for table in tables:
                                    print(f"- {table}")
                            else:
                                print("\nNo tables found in mercenary_db.")
                    except Exception as e:
                        print(f"Could not connect to 'mercenary_db': {e}")
                else:
                    print("Database 'mercenary_db' does not exist.")
                
                return  # Success, no need to try other connection strings
                
        except Exception as e:
            print(f"Connection failed: {e}")
    
    print("\nAll connection attempts failed. Please check your PostgreSQL configuration.")
    print("\nTroubleshooting steps:")
    print("1. Make sure PostgreSQL is running")
    print("2. Verify the username and password are correct")
    print("3. Check if the 'postgres' database exists and is accessible")
    print("4. Ensure the PostgreSQL user has the necessary permissions")
    print("5. Try connecting with a different client (like pgAdmin) to verify credentials")
    print("6. Check if there are any special characters in the password that might cause encoding issues")
    print("7. Try changing the PostgreSQL password to use only ASCII characters")

if __name__ == "__main__":
    print("Testing PostgreSQL database connection with SQLAlchemy...")
    test_connection()
