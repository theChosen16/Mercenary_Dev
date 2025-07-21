import sys
from sqlalchemy import create_engine, inspect

def check_database_schema():
    """Check and print the database schema."""
    # Database connection URL - using the same format that worked in migrations
    db_url = "postgresql+psycopg2://postgres:mercenary123@localhost:5432/mercenary_db"
    
    print(f"[INFO] Connecting to database: {db_url}")
    
    try:
        # Create engine
        engine = create_engine(db_url)
        
        # Create an inspector
        inspector = inspect(engine)
        
        # Get list of tables
        tables = inspector.get_table_names()
        
        if not tables:
            print("[WARNING] No tables found in the database!")
            return
            
        print("\n=== Database Tables ===")
        for table in tables:
            print(f"\nTable: {table}")
            print("-" * (len(table) + 8))
            
            # Get columns for each table
            columns = inspector.get_columns(table)
            print("Columns:")
            for column in columns:
                print(f"  - {column['name']}: {column['type']} "
                      f"{'PK' if column.get('primary_key', False) else ''} "
                      f"{'NULL' if column.get('nullable', True) else 'NOT NULL'}")
            
            # Get indexes for each table
            indexes = inspector.get_indexes(table)
            if indexes:
                print("\n  Indexes:")
                for idx in indexes:
                    print(f"    - {idx['name']}: {', '.join(idx['column_names'])} "
                          f"{'UNIQUE' if idx.get('unique', False) else ''}")
            
            # Get foreign keys for each table
            fks = inspector.get_foreign_keys(table)
            if fks:
                print("\n  Foreign Keys:")
                for fk in fks:
                    print(f"    - {fk['name']}: {'.'.join(fk['constrained_columns'])} -> "
                          f"{fk['referred_table']}.{'.'.join(fk['referred_columns'])}")
        
    except Exception as e:
        print(f"[ERROR] Failed to check database schema: {e}")
        return 1
    finally:
        if 'engine' in locals():
            engine.dispose()
    
    return 0

if __name__ == "__main__":
    sys.exit(check_database_schema())
