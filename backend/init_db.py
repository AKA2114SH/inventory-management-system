"""Simple database initialization script (sync version)"""
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import time
import sys
import os

# 1. Get the URL from Render's environment variables
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL environment variable is not set.")
    sys.exit(1)

# 2. Ensure the sync driver (psycopg2) is explicitly used, and remove asyncpg
if DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://", 1)
elif not DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print("=" * 50)
print("Database Initialization Script")
print("=" * 50)

print("\n1. Waiting for database to be ready...")
max_retries = 10
retry_count = 0
engine = None

while retry_count < max_retries:
    try:
        # Use the dynamic DATABASE_URL here
        engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("   ✅ Database connection successful!")
        break
    except Exception as e:
        retry_count += 1
        error_msg = str(e)
        print(f"   Attempt {retry_count}/{max_retries} failed: {error_msg[:100]}")
        time.sleep(2)
        if retry_count == max_retries:
            print("\n   ❌ Could not connect to database.")
            print("   Please check your DATABASE_URL environment variable in Render.")
            sys.exit(1)

print("\n2. Creating database tables...")

# Import all models and create tables
try:
    from app.core.database import Base
    from app.models import Category, Product, Transaction
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("   ✅ Database tables created successfully!")
    
    # Verify tables
    with engine.connect() as conn:
        result = conn.execute(text("""
            SELECT tablename FROM pg_tables 
            WHERE schemaname = 'public' 
            ORDER BY tablename
        """))
        tables = result.fetchall()
        if tables:
            print(f"\n   📊 Created tables: {', '.join([t[0] for t in tables])}")
        else:
            print("\n   ⚠️  No tables were created")
    
except Exception as e:
    print(f"   ❌ Error creating tables: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

# Close connection
if engine:
    engine.dispose()

print("\n" + "=" * 50)
print("✅ Database initialization complete!")
print("=" * 50)
