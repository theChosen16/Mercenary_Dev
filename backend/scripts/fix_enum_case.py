"""Script to fix the enum case sensitivity issue in the database."""
import sys
from sqlalchemy import create_engine, text

def get_db_url():
    """Get database URL from environment or use default."""
    return "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"

def fix_enum_case():
    """Fix the enum case sensitivity issue in the database."""
    try:
        # Create database engine
        db_url = get_db_url()
        engine = create_engine(db_url)
        
        with engine.connect() as conn:
            # Check if the enum type exists with the wrong case
            result = conn.execute(text("""
                SELECT t.typname, e.enumlabel 
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid
                WHERE t.typname = 'userrole';
            """))
            
            enum_values = result.fetchall()
            if not enum_values:
                print("[INFO] UserRole enum type does not exist. Creating it...")
                conn.execute(text("""
                    CREATE TYPE userrole AS ENUM ('ADMIN', 'MERCENARY', 'OFFERER');
                
                    -- Add the role column with the correct enum type
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS role userrole;
                    
                    -- Set default value for existing rows
                    UPDATE users SET role = 'MERCENARY';
                    
                    -- Make the column non-nullable
                    ALTER TABLE users ALTER COLUMN role SET NOT NULL;
                    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'MERCENARY';
                
                    -- Add other columns if they don't exist
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
                    ADD COLUMN IF NOT EXISTS full_name VARCHAR(100),
                    ADD COLUMN IF NOT EXISTS bio TEXT,
                    ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255);
                    
                    -- Rename is_offerer to is_active
                    ALTER TABLE users RENAME COLUMN is_offerer TO is_active;
                    ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true;
                    
                    -- Add indexes for better query performance
                    CREATE INDEX IF NOT EXISTS ix_users_email ON users (email);
                    CREATE INDEX IF NOT EXISTS ix_users_username ON users (username);
                
                    -- Update the migration version
                    INSERT INTO alembic_version (version_num) VALUES ('7bbc3a820ec0');
                
                
                """))
            else:
                print("[INFO] UserRole enum already exists with values:")
                for row in enum_values:
                    print(f"  {row[0]}: {row[1]}")
                
                # Update the migration to use the correct case
                print("[INFO] Updating the migration to use UPPERCASE enum values...")
                conn.execute(text("""
                    -- Update existing rows to use UPPERCASE values if needed
                    UPDATE users SET role = UPPER(role) WHERE role ~ '[a-z]';
                    
                    -- Update the default value to be UPPERCASE
                    ALTER TABLE users ALTER COLUMN role DROP DEFAULT;
                    ALTER TABLE users ALTER COLUMN role SET DEFAULT 'MERCENARY';
                    
                    -- Ensure other columns exist
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
            
            print("[SUCCESS] Database schema updated successfully!")
            return True
            
    except Exception as e:
        print(f"[ERROR] Error updating database schema: {e}")
        return False

if __name__ == "__main__":
    print("[INFO] Fixing enum case sensitivity issue...")
    if fix_enum_case():
        print("[SUCCESS] Database update completed successfully!")
        sys.exit(0)
    else:
        print("[ERROR] Database update failed!")
        sys.exit(1)
