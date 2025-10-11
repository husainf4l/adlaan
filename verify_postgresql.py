#!/usr/bin/env python3
"""
PostgreSQL Configuration Verification Script
Verifies that both the Django web app and AI agent are configured to use PostgreSQL
"""

import os
import sys
from pathlib import Path

# Add project paths
sys.path.insert(0, str(Path(__file__).parent / 'adlaan-web'))
sys.path.insert(0, str(Path(__file__).parent / 'adlaan-agent'))

def check_web_database():
    """Check Django web application database configuration"""
    print("\n🌐 Checking Django Web Application Database Configuration...")
    print("-" * 60)
    
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'adlaan_project.settings')
    
    try:
        import django
        django.setup()
        from django.conf import settings
        from django.db import connection
        
        db_config = settings.DATABASES['default']
        print(f"✅ Database Engine: {db_config['ENGINE']}")
        print(f"✅ Database Name: {db_config['NAME']}")
        print(f"✅ Database Host: {db_config.get('HOST', 'localhost')}")
        print(f"✅ Database Port: {db_config.get('PORT', '5432')}")
        print(f"✅ Database User: {db_config.get('USER', 'N/A')}")
        
        # Test connection
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✅ Connection successful!")
            print(f"✅ PostgreSQL Version: {version.split(',')[0]}")
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def check_agent_database():
    """Check AI agent database configuration"""
    print("\n🤖 Checking AI Agent Database Configuration...")
    print("-" * 60)
    
    try:
        # Load agent environment
        from dotenv import load_dotenv
        load_dotenv(Path(__file__).parent / 'adlaan-agent' / '.env')
        
        from core.database import DATABASE_URL
        
        print(f"✅ Database URL: {DATABASE_URL}")
        
        # Check if it's PostgreSQL
        if 'postgresql' in DATABASE_URL:
            print("✅ Database Type: PostgreSQL (Async)")
            
            # Parse URL components
            import re
            match = re.match(r'postgresql\+asyncpg://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
            if match:
                user, password, host, port, dbname = match.groups()
                print(f"✅ Database Host: {host}")
                print(f"✅ Database Port: {port}")
                print(f"✅ Database Name: {dbname}")
                print(f"✅ Database User: {user}")
        else:
            print("❌ Database Type: Not PostgreSQL")
            return False
        
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main verification function"""
    print("\n" + "=" * 60)
    print("  PostgreSQL Configuration Verification")
    print("=" * 60)
    
    web_ok = check_web_database()
    agent_ok = check_agent_database()
    
    print("\n" + "=" * 60)
    print("  Summary")
    print("=" * 60)
    print(f"Django Web Application: {'✅ PASSED' if web_ok else '❌ FAILED'}")
    print(f"AI Agent: {'✅ PASSED' if agent_ok else '❌ FAILED'}")
    
    if web_ok and agent_ok:
        print("\n🎉 Both systems are successfully configured to use PostgreSQL!")
        return 0
    else:
        print("\n⚠️  Some systems failed the PostgreSQL configuration check.")
        return 1

if __name__ == '__main__':
    sys.exit(main())
