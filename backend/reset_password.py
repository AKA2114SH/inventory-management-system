import bcrypt
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from app.core.config import settings

async def reset_admin_password():
    # Hash the password
    password = "admin123"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    
    async with engine.begin() as conn:
        # Update admin password
        result = await conn.execute(
            text("UPDATE users SET hashed_password = :password WHERE username = 'admin'"),
            {"password": hashed.decode('utf-8')}
        )
        await conn.commit()
        
        if result.rowcount > 0:
            print(f"✅ Admin password updated successfully!")
            print(f"   Username: admin")
            print(f"   Password: admin123")
        else:
            print("❌ Admin user not found, creating new admin user...")
            # Create new admin user
            await conn.execute(
                text("""
                    INSERT INTO users (username, email, hashed_password, full_name, is_admin)
                    VALUES ('admin', 'admin@inventory.com', :password, 'System Administrator', true)
                    ON CONFLICT (username) DO UPDATE SET hashed_password = EXCLUDED.hashed_password
                """),
                {"password": hashed.decode('utf-8')}
            )
            await conn.commit()
            print(f"✅ Admin user created!")
            print(f"   Username: admin")
            print(f"   Password: admin123")
    
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(reset_admin_password())
