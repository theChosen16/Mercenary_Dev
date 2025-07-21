"""Script to check database schema and table structure."""
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def check_schema():
    """Check database schema and table structure."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        # Create inspector
        inspector = inspect(engine)
        
        # Get all table names
        print("\n=== Database Tables ===")
        tables = inspector.get_table_names()
        for table in tables:
            print(f"\nTable: {table}")
            print("Columns:")
            for column in inspector.get_columns(table):
                print(f"  {column['name']} ({column['type']})")
            
            print("\nForeign Keys:")
            for fk in inspector.get_foreign_keys(table):
                print(f"  {fk}")
        
        # Check if users table exists
        if 'users' not in tables:
            print("\nERROR: 'users' table not found in the database!")
            print("Current tables:", tables)
            
            # Try to find any user-related tables
            user_tables = [t for t in tables if 'user' in t.lower()]
            if user_tables:
                print("\nFound these user-related tables:", user_tables)
            
            return False
            
        return True
        
    except Exception as e:
        print(f"\nError checking database schema: {e}")
        return False

if __name__ == "__main__":
    print("Checking database schema...")
    success = check_schema()
    if success:
        print("\nSchema check completed successfully!")
    else:
        print("\nSchema check completed with issues!")
        sys.exit(1)
