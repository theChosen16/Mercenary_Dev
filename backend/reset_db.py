import os
import sys
from sqlalchemy import create_engine, text, inspect

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.models.base import Base

def reset_database():
    """Connects to the database and drops all tables."""
    print("Connecting to the database...")
    engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI), echo=False)

    try:
        with engine.connect() as connection:
            print("Connection successful. Dropping all tables...")
            # Use a transaction to perform the drop
            with connection.begin():
                print("Fetching all table names...")
                # Get all table names from the public schema
                inspector = inspect(engine)
                tables = inspector.get_table_names(schema='public')

                if not tables:
                    print("No tables found to drop.")
                    return

                # Temporarily disable foreign key constraints to allow dropping tables in any order
                connection.execute(text('SET session_replication_role = \'replica\';'))
                print(f"Found tables: {tables}. Dropping with CASCADE...")
                for table in reversed(tables):
                    try:
                        connection.execute(text(f'DROP TABLE IF EXISTS public."{table}" CASCADE;'))
                        print(f"Dropped table {table}.")
                    except Exception as e:
                        print(f"Could not drop table {table}. Error: {e}")
                # Re-enable foreign key constraints
                connection.execute(text('SET session_replication_role = \'origin\';'))
            print("All tables dropped successfully.")
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        engine.dispose()

if __name__ == "__main__":
    # Check for a command-line argument to bypass the prompt
    if len(sys.argv) > 1 and sys.argv[1] in ('-y', '--yes', '--force'):
        print("Force flag detected. Resetting database without confirmation.")
        reset_database()
    else:
        print("This script will drop all tables from the database.")
        confirm = input("Are you sure you want to continue? (y/n): ")
        if confirm.lower() == 'y':
            reset_database()
        else:
            print("Operation cancelled.")
