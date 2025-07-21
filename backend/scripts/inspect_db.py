"""Script to inspect the database schema and check for the users table."""
import sys
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.engine import URL

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def check_users_table():
    """Check if the users table exists and inspect its structure."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        # Create inspector
        inspector = inspect(engine)
        
        # Get all table names
        print("\n=== Database Tables ===")
        tables = inspector.get_table_names()
        print("Tables in database:", tables)
        
        # Check if users table exists
        if 'users' not in tables:
            print("\nERROR: 'users' table not found in the database!")
            print("Current tables:", tables)
            
            # Try to find any user-related tables
            user_tables = [t for t in tables if 'user' in t.lower()]
            if user_tables:
                print("\nFound these user-related tables:", user_tables)
            
            return False
        
        # If users table exists, print its structure
        print("\n=== Users Table Structure ===")
        print("Columns:")
        for column in inspector.get_columns('users'):
            print(f"  {column['name']} ({column['type']})")
        
        print("\nForeign Keys:")
        for fk in inspector.get_foreign_keys('users'):
            print(f"  {fk}")
        
        # Check for foreign keys referencing the users table
        print("\n=== Tables with Foreign Keys to users ===")
        for table_name in tables:
            for fk in inspector.get_foreign_keys(table_name):
                if fk['referred_table'] == 'users':
                    print(f"Table: {table_name}")
                    print(f"  Foreign Key: {fk}")
        
        return True
        
    except Exception as e:
        print(f"\nError checking database schema: {e}")
        return False

if __name__ == "__main__":
    print("Inspecting database...")
    success = check_users_table()
    if success:
        print("\nDatabase inspection completed successfully!")
    else:
        print("\nDatabase inspection completed with issues!")
        sys.exit(1)
