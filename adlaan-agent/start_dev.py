#!/usr/bin/env python3
"""
Development startup script for the Adlaan Agent microservice.
"""
import sys
import os
import subprocess
from pathlib import Path

def main():
    """Main startup function."""
    print("🚀 Starting Adlaan Agent Microservice v3.0")
    print("=" * 50)
    
    # Add src to Python path
    src_path = Path(__file__).parent / "src"
    sys.path.insert(0, str(src_path))
    
    # Check if running in virtual environment
    if not hasattr(sys, 'real_prefix') and not (hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix):
        print("⚠️  Warning: Not running in a virtual environment")
        print("   Consider activating a virtual environment first")
    
    # Check if .env file exists
    env_file = Path(__file__).parent / ".env"
    if not env_file.exists():
        print("⚠️  Warning: .env file not found")
        print("   Consider copying .env.example to .env and configuring it")
    
    try:
        print("📦 Starting with uvicorn...")
        print("🌐 Service will be available at: http://localhost:8005")
        print("📚 API Documentation at: http://localhost:8005/docs")
        print("🏥 Health Check at: http://localhost:8005/api/v2/health")
        print()
        
        # Start the server
        subprocess.run([
            sys.executable, "-m", "uvicorn",
            "src.main:app",
            "--reload",
            "--host", "0.0.0.0", 
            "--port", "8005",
            "--log-level", "info"
        ])
        
    except KeyboardInterrupt:
        print("\n👋 Shutting down Adlaan Agent...")
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()