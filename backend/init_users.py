import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings
from app.core.security import get_password_hash

async def create_admin_user():
    # Create sync engine for initialization
    from sqlalchemy import create_engine
    sync_url = settings.DATABASE_URL.replace("+asyncpg", "")
    engine = create_engine(sync_url)
    
    with engine.connect() as conn:
        # Check if users table exists
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'users'
            );
        """))
        table_exists = result.scalar()
        
        if not table_exists:
            print("Creating users table...")
            conn.execute(text("""
                CREATE TABLE users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    hashed_password VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100),
                    is_active BOOLEAN DEFAULT TRUE,
                    is_admin BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                )
            """))
            conn.commit()
            print("Users table created!")
        
        # Check if admin exists
        result = conn.execute(text("SELECT * FROM users WHERE username = 'admin'"))
        admin = result.fetchone()
        
        if not admin:
            print("Creating admin user...")
            hashed_password = get_password_hash("admin123")
            conn.execute(
                text("""
                    INSERT INTO users (username, email, hashed_password, full_name, is_admin)
                    VALUES ('admin', 'admin@inventory.com', :password, 'System Administrator', true)
                """),
                {"password": hashed_password}
            )
            conn.commit()
            print("Admin user created successfully!")
            print("Username: admin")
            print("Password: admin123")
        else:
            print("Admin user already exists")
    
    engine.dispose()

if __name__ == "__main__":
    asyncio.run(create_admin_user())
