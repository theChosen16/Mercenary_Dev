"""Script to check PostgreSQL database connection and list databases with encoding handling."""
import sys
import psycopg2
from psycopg2 import sql

def safe_connect(**kwargs):
    """Attempt to connect to PostgreSQL with error handling."""
    try:
        # Try with default encoding first
        conn = psycopg2.connect(**kwargs)
        return conn, None
    except Exception as e:
        error = str(e)
        # If there's an encoding issue, try with explicit client encoding
        if 'utf-8' in error.lower() and 'codec' in error.lower():
            try:
                kwargs['client_encoding'] = 'UTF8'
                conn = psycopg2.connect(**kwargs)
                return conn, None
            except Exception as e2:
                return None, str(e2)
        return None, error

def check_database():
    """Check database connection and list databases/tables."""
    # Try to connect to the default 'postgres' database
    conn, error = safe_connect(
        host="localhost",
        dbname="postgres",
        user="postgres",
        password="postgres"
    )
    
    if error:
        print(f"Failed to connect to PostgreSQL: {error}")
        print("\nTroubleshooting steps:")
        print("1. Make sure PostgreSQL is running")
        print("2. Verify the username and password are correct")
        print("3. Check if the 'postgres' database exists and is accessible")
        print("4. Ensure the PostgreSQL user has the necessary permissions")
        print("5. Try connecting with a different client (like pgAdmin) to verify credentials")
        return
    
    try:
        conn.autocommit = True
        cur = conn.cursor()
        
        # Get PostgreSQL version
        cur.execute("SELECT version();")
        print(f"PostgreSQL Version: {cur.fetchone()[0]}")
        
        # Check if our database exists
        cur.execute("SELECT 1 FROM pg_database WHERE datname = 'mercenary_db'")
        exists = cur.fetchone()
        
        if exists:
            print("\nDatabase 'mercenary_db' exists!")
            
            # Try to connect to mercenary_db
            conn_db, db_error = safe_connect(
                host="localhost",
                dbname="mercenary_db",
                user="postgres",
                password="postgres"
            )
            
            if db_error:
                print(f"Could not connect to 'mercenary_db': {db_error}")
            else:
                try:
                    cur_db = conn_db.cursor()
                    
                    # List all tables in the public schema
                    cur_db.execute("""
                        SELECT table_name 
                        FROM information_schema.tables 
                        WHERE table_schema = 'public'
                    """)
                    tables = cur_db.fetchall()
                    
                    if tables:
                        print("\nTables in mercenary_db:")
                        for table in tables:
                            print(f"- {table[0]}")
                    else:
                        print("\nNo tables found in mercenary_db.")
                    
                    cur_db.close()
                finally:
                    conn_db.close()
        else:
            print("\nDatabase 'mercenary_db' does not exist.")
        
        # List all databases
        print("\nAll databases:")
        cur.execute("SELECT datname FROM pg_database WHERE datistemplate = false")
        for db in cur.fetchall():
            print(f"- {db[0]}")
        
        cur.close()
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    print("Checking PostgreSQL database connection...")
    check_database()
