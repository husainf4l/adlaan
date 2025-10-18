"""
PostgreSQL database configuration with async support and LangGraph checkpointing
Follows FastAPI + SQLAlchemy 2.0 + LangGraph best practices
"""
import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database configuration from environment
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "adlaanagent")
DB_USER = os.getenv("DB_USER", "husain")
DB_PASSWORD = os.getenv("DB_PASSWORD", "tt55oo77")

# Construct database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    if "sqlite" in os.getenv("DATABASE_URL", "").lower():
        DATABASE_URL = os.getenv("DATABASE_URL")
    else:
        DATABASE_URL = f"postgresql+asyncpg://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Synchronous URL for Alembic migrations
if "sqlite" in DATABASE_URL:
    SYNC_DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite:///")
else:
    SYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://").replace("postgresql+psycopg://", "postgresql://")

# Synchronous engine for migrations (created first to avoid issues)
sync_engine = None

# Async engine will be created when needed
engine = None
AsyncSessionLocal = None


# Async engine will be created when needed
engine = None
AsyncSessionLocal = None


def get_async_engine():
    """Get or create async engine"""
    global engine
    if engine is None:
        if "sqlite" in DATABASE_URL:
            # Use aiosqlite for SQLite
            engine = create_async_engine(
                DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///"),
                echo=True,  # Set to False in production
            )
        else:
            # Use asyncpg for PostgreSQL
            engine = create_async_engine(
                DATABASE_URL,
                echo=True,  # Set to False in production
                pool_size=20,  # Number of connections to keep open
                max_overflow=10,  # Additional connections if pool is exhausted
                pool_pre_ping=True,  # Test connections before using
                pool_recycle=3600,  # Recycle connections after 1 hour
            )
    return engine


def get_async_session_maker():
    """Get or create async session maker"""
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        eng = get_async_engine()
        AsyncSessionLocal = async_sessionmaker(
            eng,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
    return AsyncSessionLocal


def get_sync_engine():
    """Get or create synchronous engine for migrations"""
    global sync_engine
    if sync_engine is None:
        sync_engine = create_engine(SYNC_DATABASE_URL, echo=True)
    return sync_engine


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency for FastAPI endpoints to get database session
    
    Usage:
        @app.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            return result.scalars().all()
    """
    session_maker = get_async_session_maker()
    async with session_maker() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """
    Initialize database tables (for development only)
    In production, use Alembic migrations
    """
    from models.database import Base
    
    eng = get_async_engine()
    async with eng.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created successfully!")


async def close_db():
    """Close database connections gracefully"""
    global engine
    if engine:
        await engine.dispose()
        print("✅ Database connections closed")


# Test database connection
async def test_db_connection():
    """Test database connection"""
    try:
        eng = get_async_engine()
        async with eng.begin() as conn:
            await conn.execute("SELECT 1")
        print("✅ Database connection successful!")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False


# Database utilities
class DatabaseManager:
    """Helper class for database operations"""
    
    @staticmethod
    async def health_check() -> bool:
        """Check if database connection is healthy"""
        try:
            session_maker = get_async_session_maker()
            async with session_maker() as session:
                await session.execute("SELECT 1")
                return True
        except Exception as e:
            print(f"❌ Database health check failed: {e}")
            return False
    
    @staticmethod
    async def create_session() -> AsyncSession:
        """Create a new database session"""
        session_maker = get_async_session_maker()
        return session_maker()

