import os
import re

from dotenv import load_dotenv
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
SCHEMA_NAME = os.getenv("SCHEMA_NAME", "public")  # Default to 'public' schema

# Validate schema name to prevent SQL injection
# Schema names must be valid PostgreSQL identifiers:
# - Start with lowercase letter or underscore
# - Contain only lowercase letters, digits, underscores
# - Max 63 characters (PostgreSQL limit)
if not re.match(r"^[a-z_][a-z0-9_]{0,62}$", SCHEMA_NAME):
    raise ValueError(
        f"Invalid SCHEMA_NAME: '{SCHEMA_NAME}'. "
        "Must be lowercase alphanumeric with underscores, starting with letter or underscore."
    )

# Configure engine with schema isolation
# Note: We don't use connect_args["options"] because NeonDB pooler doesn't support it
# Instead, we set search_path after connection via event listener below
# pool_pre_ping=True ensures connections are tested before use (fixes SSL timeout issues)
# DATABASE_URL check is conditional to allow imports during build phase (Vercel)
if DATABASE_URL:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)

    # Ensure all connections use the correct schema
    # Event listener must be inside conditional to avoid attaching to None engine
    @event.listens_for(engine, "connect")
    def set_search_path(dbapi_connection, connection_record):
        """Set search_path on every new connection to ensure schema isolation."""
        cursor = dbapi_connection.cursor()
        # Use quoted identifier for safety (schema name already validated above)
        cursor.execute(f'SET search_path TO "{SCHEMA_NAME}"')
        cursor.close()

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # Build phase: DATABASE_URL not set yet, create placeholders
    engine = None
    SessionLocal = None

Base = declarative_base()


def get_db():
    if SessionLocal is None:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Database connection requires DATABASE_URL to be configured."
        )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
