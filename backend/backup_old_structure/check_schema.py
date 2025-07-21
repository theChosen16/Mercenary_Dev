"""Script to check the database schema after migrations."""
import sys
from sqlalchemy import create_engine, inspect
from sqlalchemy.engine import URL

def main():
    # Database connection URL - update with your actual credentials
    db_url = "postgresql+psycopg2://postgres:mercenary123@localhost/mercenary_db"
    
    try:
        # Create engine and connect to the database
        engine = create_engine(db_url)
        inspector = inspect(engine)
        
        # Get all table names
        print("\n=== Database Tables ===")
        tables = inspector.get_table_names()
        for table in tables:
            print(f"\nTable: {table}")
            print("-" * 50)
            
            # Get columns for each table
            columns = inspector.get_columns(table)
            for column in columns:
                print(f"{column['name']}: {column['type']} (Nullable: {column['nullable']} | Default: {column.get('default', None)})")
            
            # Get foreign keys
            fks = inspector.get_foreign_keys(table)
            if fks:
                print("\nForeign Keys:")
                for fk in fks:
                    print(f"  - {fk['constrained_columns']} -> {fk['referred_table']}.{fk['referred_columns']}")
        
        print("\nSchema check completed successfully!")
        return 0
    
    except Exception as e:
        print(f"Error checking database schema: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
