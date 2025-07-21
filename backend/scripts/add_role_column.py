"""Script to add the role column with the correct enum type and default value."""
import sys
from sqlalchemy import create_engine, text

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def add_role_column():
    """Add the role column with the correct enum type and default value."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Start a transaction
            with conn.begin():
                print("[INFO] Checking if role column exists...")
                
                # Check if the role column exists
                result = conn.execute(text("""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_name='users' AND column_name='role';
                """))
                
                if not result.fetchone():
                    print("[INFO] Adding role column with userrole type...")
                    # Add the role column with the correct enum type
                    conn.execute(text("""
                        ALTER TABLE users 
                        ADD COLUMN role userrole NOT NULL DEFAULT 'MERCENARY';
                    
                        -- Add other missing columns
                        ALTER TABLE users 
                        ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
                        ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
                        ADD COLUMN IF NOT EXISTS bio TEXT,
                        ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
                        
                        -- Rename is_offerer to is_active if it exists
                        DO $$
                        BEGIN
                            IF EXISTS (SELECT 1 FROM information_schema.columns 
                                     WHERE table_name='users' AND column_name='is_offerer') THEN
                                ALTER TABLE users RENAME COLUMN is_offerer TO is_active;
                                ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
                            END IF;
                        END
                        $$;
                        
                        -- Add indexes if they don't exist
                        CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
                        CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
                        
                        -- Update the migration version
                        INSERT INTO alembic_version (version_num) 
                        SELECT '7bbc3a820ec0' 
                        WHERE NOT EXISTS (SELECT 1 FROM alembic_version WHERE version_num = '7bbc3a820ec0');
                    """))
                        
                    print("[SUCCESS] Role column and other schema updates applied successfully!")
                else:
                    print("[INFO] Role column already exists. No changes needed.")
                
                return True
                
    except Exception as e:
        print(f"[ERROR] Error updating database schema: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Starting database schema update...")
    if add_role_column():
        print("[SUCCESS] Database update completed successfully!")
        sys.exit(0)
    else:
        print("[ERROR] Database update failed!")
        sys.exit(1)
