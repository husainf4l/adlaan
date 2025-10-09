"""
Script to drop all tables and recreate them fresh
"""
import asyncio
import sys
sys.path.insert(0, '.')

from sqlalchemy import text
from core.database import get_async_engine

async def reset_database():
    """Drop all tables and recreate"""
    engine = get_async_engine()
    
    async with engine.begin() as conn:
        print("🗑️  Dropping all tables...")
        
        # Drop tables one by one (asyncpg doesn't support multiple commands)
        tables = [
            "audit_logs",
            "documents",
            "messages",
            "checkpoints",
            "conversations",
            "users",
            "alembic_version"
        ]
        
        for table in tables:
            await conn.execute(text(f"DROP TABLE IF EXISTS {table} CASCADE"))
            print(f"   ✓ Dropped {table}")
        
        print("\n✅ All tables dropped!")
    
    await engine.dispose()
    print("\n✅ Database reset complete!")
    print("📝 Now run: alembic upgrade head")

if __name__ == "__main__":
    asyncio.run(reset_database())
