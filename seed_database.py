#!/usr/bin/env python3
"""
Comprehensive Database Seeding Script for Adlaan Legal AI
Seeds both agent and web databases with essential data for smooth operation
"""

import os
import sys
import asyncio
import sqlite3
from datetime import datetime, date
from pathlib import Path

# Add project path
project_root = Path(__file__).parent
sys.path.append(str(project_root))
sys.path.append(str(project_root / "adlaan-agent"))


async def seed_agent_database():
    """Seed the agent database with essential data"""
    print("🌱 Seeding Agent Database...")
    
    try:
        # Import agent database components
        from adlaan.agent.core.database import get_async_session_maker, init_database
        from adlaan.agent.models.database import User, Conversation, Message, Document
        
        # Initialize database
        await init_database()
        session_maker = get_async_session_maker()
        
        async with session_maker() as db:
            # Create sample users
            users_data = [
                {
                    "email": "admin@adlaan.com",
                    "username": "admin",
                    "hashed_password": "$2b$12$LQv3c1yqBwjMFzFQ8QJJQ.1gyNGBf1T4eZNVGSK4XYX4gVQBmnXJ2",  # password: admin123
                    "full_name": "Adlaan Administrator", 
                    "is_active": True,
                    "is_superuser": True
                },
                {
                    "email": "legal@adlaan.com",
                    "username": "legal_expert",
                    "hashed_password": "$2b$12$LQv3c1yqBwjMFzFQ8QJJQ.1gyNGBf1T4eZNVGSK4XYX4gVQBmnXJ2",
                    "full_name": "Legal Expert",
                    "is_active": True,
                    "is_superuser": False
                },
                {
                    "email": "demo@adlaan.com", 
                    "username": "demo_user",
                    "hashed_password": "$2b$12$LQv3c1yqBwjMFzFQ8QJJQ.1gyNGBf1T4eZNVGSK4XYX4gVQBmnXJ2",
                    "full_name": "Demo User",
                    "is_active": True,
                    "is_superuser": False
                }
            ]
            
            for user_data in users_data:
                user = User(**user_data)
                db.add(user)
                
            await db.flush()  # Get user IDs
            
            # Create sample conversations
            conversations_data = [
                {
                    "thread_id": "demo-nda-thread-001",
                    "user_id": 3,  # demo user
                    "title": "NDA Creation for Tech Partnership",
                    "meta_data": {
                        "jurisdiction": "jordan", 
                        "legal_domain": "commercial",
                        "task_type": "document_creation"
                    },
                    "is_active": True,
                    "last_message_at": datetime.utcnow()
                },
                {
                    "thread_id": "demo-contract-review-001", 
                    "user_id": 3,
                    "title": "Employment Contract Review",
                    "meta_data": {
                        "jurisdiction": "uae",
                        "legal_domain": "employment", 
                        "task_type": "contract_review"
                    },
                    "is_active": True,
                    "last_message_at": datetime.utcnow()
                }
            ]
            
            for conv_data in conversations_data:
                conversation = Conversation(**conv_data)
                db.add(conversation)
                
            await db.flush()
            
            # Create sample messages
            messages_data = [
                {
                    "conversation_id": 1,
                    "role": "user",
                    "content": "I need to create a mutual NDA for a technology partnership between two companies in Jordan.",
                    "message_type": "message",
                    "meta_data": {"user_intent": "nda_creation"}
                },
                {
                    "conversation_id": 1,
                    "role": "assistant", 
                    "content": "I'll help you create a comprehensive mutual NDA for your technology partnership in Jordan. This will include confidentiality provisions, term duration, and exceptions as per Jordan Commercial Law.",
                    "message_type": "message",
                    "meta_data": {
                        "confidence": 0.92,
                        "agents_used": ["research", "draft"],
                        "citations": 3
                    }
                }
            ]
            
            for msg_data in messages_data:
                message = Message(**msg_data)
                db.add(message)
                
            # Create sample documents
            documents_data = [
                {
                    "conversation_id": 1,
                    "user_id": 3,
                    "title": "Mutual Non-Disclosure Agreement - Tech Partnership",
                    "content": "MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Mutual Non-Disclosure Agreement...",
                    "document_type": "nda",
                    "jurisdiction": "jordan", 
                    "citations": [
                        {"law": "Jordan Commercial Companies Law", "section": "Article 45", "year": "2023"},
                        {"law": "Trade Secrets Protection Act", "section": "Section 12", "year": "2022"}
                    ],
                    "template_used": "mutual_nda_jordan_v1.0",
                    "version": 1,
                    "file_format": "docx"
                }
            ]
            
            for doc_data in documents_data:
                document = Document(**doc_data)
                db.add(document)
                
            await db.commit()
            print("✅ Agent database seeded successfully!")
            
    except Exception as e:
        print(f"❌ Agent database seeding failed: {e}")
        return False
        
    return True


def seed_web_database():
    """Seed the Django web database with essential data"""
    print("🌱 Seeding Web Database...")
    
    try:
        # Connect to Django SQLite database
        web_db_path = project_root / "adlaan-web" / "db.sqlite3"
        
        if not web_db_path.exists():
            print(f"⚠️ Web database not found at {web_db_path}")
            return False
            
        conn = sqlite3.connect(str(web_db_path))
        cursor = conn.cursor()
        
        # Check if auth_user table exists (Django default)
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='auth_user'
        """)
        
        if not cursor.fetchone():
            print("⚠️ Django auth_user table not found. Creating basic user data...")
            # Create basic admin user data if tables exist
            cursor.execute("""
                INSERT OR IGNORE INTO auth_user 
                (username, first_name, last_name, email, is_staff, is_active, is_superuser, date_joined)
                VALUES 
                ('admin', 'Admin', 'User', 'admin@adlaan.com', 1, 1, 1, datetime('now'))
            """)
        else:
            # Insert sample users for Django
            sample_users = [
                ("admin", "Admin", "User", "admin@adlaan.com", 1, 1, 1),
                ("legal_expert", "Legal", "Expert", "legal@adlaan.com", 1, 1, 0),
                ("demo_user", "Demo", "User", "demo@adlaan.com", 0, 1, 0)
            ]
            
            for username, first_name, last_name, email, is_staff, is_active, is_superuser in sample_users:
                cursor.execute("""
                    INSERT OR IGNORE INTO auth_user 
                    (username, first_name, last_name, email, is_staff, is_active, is_superuser, 
                     password, date_joined, last_login)
                    VALUES (?, ?, ?, ?, ?, ?, ?, 
                           'pbkdf2_sha256$600000$abc123$hash', datetime('now'), datetime('now'))
                """, (username, first_name, last_name, email, is_staff, is_active, is_superuser))
        
        conn.commit()
        conn.close()
        
        print("✅ Web database seeded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Web database seeding failed: {e}")
        return False


def seed_intelligence_database():
    """Seed the intelligence layer knowledge base"""
    print("🧠 Seeding Intelligence Knowledge Base...")
    
    try:
        # Seed legal knowledge
        kb_path = project_root / "adlaan-agent" / "legal_knowledge.db"
        
        # Sample legal knowledge data
        legal_knowledge_data = [
            {
                "jurisdiction": "jordan",
                "title": "Commercial Companies Law Amendment 2024",
                "content": "This law governs commercial partnerships and establishes requirements for technology transfer agreements, confidentiality provisions, and intellectual property protection in Jordan.",
                "law_type": "statute", 
                "effective_date": "2024-01-01",
                "version": "1.0",
                "tags": ["commercial", "partnership", "technology", "confidentiality"],
                "reliability_score": 0.95
            },
            {
                "jurisdiction": "jordan", 
                "title": "Employment Rights Protection Act 2023",
                "content": "Establishes employee privacy rights, confidentiality obligations, and non-disclosure requirements for employment relationships in Jordan.",
                "law_type": "statute",
                "effective_date": "2023-06-01", 
                "version": "2.1",
                "tags": ["employment", "privacy", "confidentiality"],
                "reliability_score": 0.93
            },
            {
                "jurisdiction": "uae",
                "title": "Federal Commercial Code 2024",
                "content": "Federal regulations governing commercial transactions, partnership agreements, and business confidentiality requirements across UAE emirates.",
                "law_type": "federal_law",
                "effective_date": "2024-03-01",
                "version": "1.0", 
                "tags": ["commercial", "federal", "partnership"],
                "reliability_score": 0.96
            },
            {
                "jurisdiction": "general",
                "title": "International Commercial Arbitration Principles",
                "content": "Internationally recognized principles for commercial dispute resolution, confidentiality in arbitration, and cross-border business agreements.",
                "law_type": "international_principle",
                "effective_date": "2023-01-01",
                "version": "3.0",
                "tags": ["international", "arbitration", "commercial"],
                "reliability_score": 0.89
            }
        ]
        
        # Initialize knowledge base if intelligence system is available
        try:
            from adlaan.agent.intelligence import create_enhanced_agent
            
            intelligence = create_enhanced_agent(
                knowledge_db_path=str(kb_path),
                lexis_api_key=None,  # Development mode
                justia_api_key=None
            )
            
            # Add legal knowledge to database
            for law_data in legal_knowledge_data:
                jurisdiction = law_data.pop("jurisdiction")
                law_id = intelligence.add_jurisdiction_law(jurisdiction, law_data)
                print(f"   ✅ Added law: {law_id} ({jurisdiction})")
                
        except ImportError:
            print("⚠️ Intelligence layer not available, creating basic knowledge DB...")
            # Create basic SQLite knowledge database
            conn = sqlite3.connect(str(kb_path))
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS legal_knowledge (
                    id INTEGER PRIMARY KEY,
                    jurisdiction TEXT,
                    title TEXT,
                    content TEXT,
                    law_type TEXT,
                    effective_date TEXT,
                    version TEXT,
                    tags TEXT,
                    reliability_score REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            for law_data in legal_knowledge_data:
                cursor.execute("""
                    INSERT INTO legal_knowledge 
                    (jurisdiction, title, content, law_type, effective_date, version, tags, reliability_score)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    law_data["jurisdiction"], law_data["title"], law_data["content"],
                    law_data["law_type"], law_data["effective_date"], law_data["version"],
                    ",".join(law_data["tags"]), law_data["reliability_score"]
                ))
            
            conn.commit()
            conn.close()
            
        print("✅ Intelligence knowledge base seeded successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Intelligence database seeding failed: {e}")
        return False


def optimize_databases():
    """Optimize database performance"""
    print("⚡ Optimizing Database Performance...")
    
    try:
        # Optimize agent database
        agent_db_path = project_root / "adlaan-agent" / "legal_knowledge.db"
        if agent_db_path.exists():
            conn = sqlite3.connect(str(agent_db_path))
            conn.execute("VACUUM")
            conn.execute("ANALYZE") 
            conn.close()
            print("   ✅ Agent database optimized")
            
        # Optimize web database
        web_db_path = project_root / "adlaan-web" / "db.sqlite3"
        if web_db_path.exists():
            conn = sqlite3.connect(str(web_db_path))
            conn.execute("VACUUM")
            conn.execute("ANALYZE")
            conn.close() 
            print("   ✅ Web database optimized")
            
        # Optimize main database
        main_db_path = project_root / "db.sqlite3"
        if main_db_path.exists():
            conn = sqlite3.connect(str(main_db_path))
            conn.execute("VACUUM")
            conn.execute("ANALYZE")
            conn.close()
            print("   ✅ Main database optimized")
            
        print("✅ Database optimization complete!")
        return True
        
    except Exception as e:
        print(f"❌ Database optimization failed: {e}")
        return False


def create_production_config():
    """Create optimized production configuration"""
    print("⚙️ Creating Production Configuration...")
    
    try:
        # Create optimized .env for agent
        agent_env_content = """# Adlaan Agent - Production Configuration
ENVIRONMENT=production
DATABASE_URL=sqlite:///./legal_knowledge.db

# AI Configuration  
OPENAI_API_KEY=your-openai-key-here
MODEL_NAME=gpt-4
MAX_TOKENS=4000

# Intelligence Layer (Development Mode)
LEXIS_API_KEY=development
JUSTIA_API_KEY=development
ENABLE_INTELLIGENCE=true

# Performance Settings
MAX_CONCURRENT_REQUESTS=10
REQUEST_TIMEOUT=30
ENABLE_CACHING=true
CACHE_TTL=3600

# Security
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=*
ALLOWED_HOSTS=*

# Logging
LOG_LEVEL=INFO
ENABLE_DEBUG=false
"""
        
        agent_env_path = project_root / "adlaan-agent" / ".env"
        with open(agent_env_path, "w") as f:
            f.write(agent_env_content)
            
        # Create optimized .env for web
        web_env_content = """# Adlaan Web - Production Configuration
DEBUG=False
SECRET_KEY=your-django-secret-key-here
ALLOWED_HOSTS=*

# Database
DATABASE_URL=sqlite:///./db.sqlite3

# Static Files
STATIC_URL=/static/
STATIC_ROOT=./staticfiles/

# Agent Integration
AGENT_URL=http://localhost:8005
ENABLE_AGENT_INTEGRATION=true

# Security
SECURE_SSL_REDIRECT=False
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True

# Performance
USE_TZ=True
CACHE_BACKEND=django.core.cache.backends.locmem.LocMemCache
"""
        
        web_env_path = project_root / "adlaan-web" / ".env"
        with open(web_env_path, "w") as f:
            f.write(web_env_content)
            
        print("✅ Production configuration created!")
        return True
        
    except Exception as e:
        print(f"❌ Production configuration failed: {e}")
        return False


async def main():
    """Main seeding function"""
    print("🚀 Adlaan Database Seeding & Optimization")
    print("=" * 50)
    
    success_count = 0
    total_tasks = 5
    
    # Task 1: Seed agent database
    if await seed_agent_database():
        success_count += 1
        
    # Task 2: Seed web database
    if seed_web_database():
        success_count += 1
        
    # Task 3: Seed intelligence database
    if seed_intelligence_database():
        success_count += 1
        
    # Task 4: Optimize databases
    if optimize_databases():
        success_count += 1
        
    # Task 5: Create production config
    if create_production_config():
        success_count += 1
    
    print("\n" + "=" * 50)
    print(f"🎯 Seeding Complete: {success_count}/{total_tasks} tasks successful")
    
    if success_count == total_tasks:
        print("✅ All databases seeded and optimized successfully!")
        print("\nNext steps:")
        print("1. Update .env files with your actual API keys")
        print("2. Run: cd adlaan-agent && python main.py")
        print("3. Run: cd adlaan-web && python manage.py runserver")
        print("4. Visit: http://localhost:8005/debug (Enhanced AI)")
        print("5. Visit: http://localhost:8000 (Web Interface)")
    else:
        print("⚠️ Some tasks failed. Check the errors above.")
    
    return success_count == total_tasks


if __name__ == "__main__":
    # Run the seeding process
    result = asyncio.run(main())
    sys.exit(0 if result else 1)