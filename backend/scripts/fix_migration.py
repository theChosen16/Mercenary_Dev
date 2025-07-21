"""Script to fix the migration issues with the users table."""
import sys
from sqlalchemy import create_engine, text

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def fix_migration():
    """Fix the migration by applying schema changes directly."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Create the enum type if it doesn't exist
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'userrole') THEN
                        CREATE TYPE userrole AS ENUM ('admin', 'mercenary', 'offerer');
                    END IF;
                END
                $$;
            
                -- Add new columns to users table
                ALTER TABLE users 
                ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
                ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
                ADD COLUMN IF NOT EXISTS bio TEXT,
                ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255),
                ADD COLUMN IF NOT EXISTS role userrole;
                
                -- Update existing rows with default role
                UPDATE users SET role = 'mercenary'::userrole WHERE role IS NULL;
                
                -- Make role column non-nullable
                ALTER TABLE users ALTER COLUMN role SET NOT NULL;
                ALTER TABLE users ALTER COLUMN role SET DEFAULT 'mercenary'::userrole;
                
                -- Rename is_offerer to is_active
                ALTER TABLE users RENAME COLUMN is_offerer TO is_active;
                ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
                
                -- Make email and hashed_password non-nullable if they aren't already
                ALTER TABLE users ALTER COLUMN email SET NOT NULL;
                ALTER TABLE users ALTER COLUMN hashed_password SET NOT NULL;
                
                -- Add indexes for better query performance
                CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
                CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
            
            """))
            
            print("[SUCCESS] Database schema updated successfully!")
            return True
            
    except Exception as e:
        print(f"[ERROR] Error updating database schema: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Updating database schema...")
    if fix_migration():
        print("[SUCCESS] Database update completed successfully!")
        sys.exit(0)
    else:
        print("[ERROR] Database update failed!")
        sys.exit(1)
