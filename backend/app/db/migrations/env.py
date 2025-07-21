"""Alembic environment configuration for database migrations."""
import os
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Import models for autogenerate support
# pylint: disable=unused-import
from app.db.base_class import Base
# Import all models to ensure they are registered with SQLAlchemy
from app.models import *  # noqa: F401,F403

# Explicitly import all models to ensure they are loaded
from app.models.user import User  # noqa: F401
from app.models.job import Job  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.proposal import Proposal  # noqa: F401
from app.models.review import Review  # noqa: F401
from app.models.skill import Skill, UserSkill  # noqa: F401
from app.models.profile import Profile  # noqa: F401

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Set up Python logging from the config file
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# Other values from the config can be accessed here
# my_important_option = config.get_main_option("my_important_option")


def get_url() -> str:
    """Get the database URL from environment variables or config.
    
    Returns:
        str: Database connection string
    """
    try:
        from app.core.config import settings
        # Convert PostgresDsn to string if needed
        db_uri = settings.SQLALCHEMY_DATABASE_URI
        return str(db_uri) if db_uri else "postgresql://postgres:mercenary123@localhost:5432/mercenary_db"
    except Exception as e:
        print(f"[WARNING] Could not load settings, using default database URL: {e}")
        return "postgresql://postgres:mercenary123@localhost:5432/mercenary_db"


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the
    Engine creation we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine and associate
    a connection with the context.
    """
    # Get the database URL
    db_url = get_url()
    print(f"[INFO] Using database URL: {db_url}")
    
    # Create engine with explicit encoding
    connectable = engine_from_config(
        {"sqlalchemy.url": db_url},
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        connect_args={"connect_timeout": 10},
    )

    try:
        with connectable.connect() as connection:
            print("[INFO] Database connection successful!")
            context.configure(
                connection=connection,
                target_metadata=target_metadata,
                compare_type=True,
                compare_server_default=True,
                render_as_batch=True,
            )

            with context.begin_transaction():
                print("[INFO] Running migrations...")
                context.run_migrations()
                print("[SUCCESS] Migrations completed successfully!")
    except Exception as e:
        print(f"[ERROR] Failed to run migrations: {e}")
        raise


# Run the appropriate migration function based on the context
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
