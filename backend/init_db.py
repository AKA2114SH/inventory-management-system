"""Simple database initialization script (sync version)"""
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError
import time
import sys
import os

# Use sync URL for initialization (psycopg2 instead of asyncpg)
DATABASE_URL = "postgresql://postgres:password@localhost:5433/inventory_db"

print("=" * 50)
print("Database Initialization Script")
print("=" * 50)

print("\n1. Waiting for database to be ready...")
max_retries = 10
retry_count = 0
engine = None

while retry_count < max_retries:
    try:
        engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("   ✅ Database connection successful!")
        break
    except OperationalError as e:
        retry_count += 1
        error_msg = str(e)
        if "Connection refused" in error_msg:
            print(f"   Attempt {retry_count}/{max_retries}: Database not ready yet...")
        else:
            print(f"   Attempt {retry_count}/{max_retries} failed: {error_msg[:100]}")
        time.sleep(2)
        if retry_count == max_retries:
            print("\n   ❌ Could not connect to database.")
            print("   Please check:")
            print("   1. Docker container is running: docker ps")
            print("   2. Port 5433 is not blocked")
            print("   3. PostgreSQL is healthy")
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