"""Script to check database encoding and locale settings."""
import sys
from sqlalchemy import create_engine, text

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def check_encoding():
    """Check database encoding and locale settings."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Get database encoding
            result = conn.execute(text("""
                SELECT datname, pg_encoding_to_char(encoding) AS encoding, datcollate, datctype 
                FROM pg_database 
                WHERE datname = current_database();
            """))
            
            db_info = result.fetchone()
            print("\n=== Database Encoding ===")
            print(f"Database: {db_info[0]}")
            print(f"Encoding: {db_info[1]}")
            print(f"Collation: {db_info[2]}")
            print(f"Character Type: {db_info[3]}")
            
            # Check if the enum type exists and its values
            result = conn.execute(text("""
                SELECT t.typname, e.enumlabel 
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'userrole';
            """))
            
            enum_values = result.fetchall()
            if enum_values:
                print("\n=== UserRole Enum Values ===")
                for row in enum_values:
                    print(f"{row[0]}: {row[1]}")
            else:
                print("\n[INFO] UserRole enum type does not exist yet.")
            
            return True
            
    except Exception as e:
        print(f"[ERROR] Error checking database encoding: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Checking database encoding and locale settings...")
    if check_encoding():
        print("\n[SUCCESS] Database check completed successfully!")
        sys.exit(0)
    else:
        print("\n[ERROR] Database check failed!")
        sys.exit(1)
