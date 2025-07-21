"""Script to check database schema."""
import os
import sys
from pathlib import Path

# Add the backend directory to the Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

from sqlalchemy import inspect, text
from app.db.session import engine, SessionLocal

def check_table_columns():
    """Check columns in the users table."""
    print("\nChecking users table columns...")
    
    with engine.connect() as connection:
        # Get column information for users table
        result = connection.execute(
            text(
                """
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'users'
                ORDER BY ordinal_position;
                """
            )
        )
        
        columns = result.fetchall()
        if not columns:
            print("[ERROR] Users table not found or has no columns")
            return False
        
        print("\nUsers table columns:")
        print("-" * 80)
        print(f"{'Column Name':<25} | {'Data Type':<20} | {'Nullable':<10} | {'Default'}")
        print("-" * 80)
        for col in columns:
            print(f"{col[0]:<25} | {col[1]:<20} | {col[2]:<10} | {col[3]}")
        
        return True

def check_alembic_version():
    """Check the current Alembic version."""
    print("\nChecking Alembic version...")
    
    with engine.connect() as connection:
        try:
            # Check if alembic_version table exists
            result = connection.execute(
                text(
                    """
                    SELECT version_num FROM alembic_version;
                    """
                )
            )
            version = result.scalar()
            print(f"[OK] Current Alembic version: {version}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to get Alembic version: {e}")
            return False

def main():
    """Main function to check database schema."""
    print("Checking database schema...")
    
    # Check if tables exist
    with engine.connect() as connection:
        result = connection.execute(
            text(
                """
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public';
                """
            )
        )
        tables = [row[0] for row in result.fetchall()]
        print("\nTables in database:", ", ".join(tables) if tables else "No tables found")
    
    # Check users table columns
    check_table_columns()
    
    # Check Alembic version
    check_alembic_version()
    
    print("\nSchema check completed.")

if __name__ == "__main__":
    main()
