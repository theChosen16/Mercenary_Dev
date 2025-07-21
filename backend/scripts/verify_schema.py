"""Script to verify the database schema after updates."""
import sys
from sqlalchemy import create_engine, text

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def verify_schema():
    """Verify the database schema after updates."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Check users table columns
            print("\n=== Users Table Columns ===")
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns 
                WHERE table_name = 'users'
                ORDER BY ordinal_position;
            """))
            
            print("\nColumn Name\t\tData Type\t\tNullable\tDefault")
            print("-" * 70)
            for row in result:
                print(f"{row[0]:<20} {row[1]:<20} {row[2]:<10} {row[3]}")
            
            # Check indexes on users table
            print("\n=== Indexes on Users Table ===")
            result = conn.execute(text("""
                SELECT indexname, indexdef 
                FROM pg_indexes 
                WHERE tablename = 'users';
            """))
            
            for row in result:
                print(f"\nIndex: {row[0]}")
                print(f"Definition: {row[1]}")
            
            # Check enum values
            print("\n=== UserRole Enum Values ===")
            result = conn.execute(text("""
                SELECT t.typname, e.enumlabel 
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'userrole';
            """))
            
            for row in result:
                print(f"{row[0]}: {row[1]}")
            
            # Check alembic version
            print("\n=== Alembic Version ===")
            result = conn.execute(text("SELECT version_num FROM alembic_version;"))
            print(f"Current version: {result.scalar()}")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Error verifying database schema: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Verifying database schema...")
    if verify_schema():
        print("\n[SUCCESS] Database verification completed successfully!")
        sys.exit(0)
    else:
        print("\n[ERROR] Database verification failed!")
        sys.exit(1)
