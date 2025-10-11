#!/usr/bin/env python3
"""
Adlaan Backend Health Check & Performance Monitor
Checks all systems, databases, and performance metrics
"""

import os
import sys
import asyncio
import sqlite3
import time
import psutil
import requests
from pathlib import Path
from datetime import datetime

project_root = Path(__file__).parent


class AdlaanHealthChecker:
    """Comprehensive health checker for Adlaan systems"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.utcnow().isoformat(),
            "overall_status": "unknown",
            "systems": {},
            "databases": {},
            "performance": {},
            "recommendations": []
        }
        
    async def check_system_resources(self):
        """Check system resource usage"""
        print("💻 Checking System Resources...")
        
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_percent = memory.percent
            memory_available_gb = memory.available / (1024**3)
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_percent = disk.percent
            disk_free_gb = disk.free / (1024**3)
            
            # Process count
            process_count = len(psutil.pids())
            
            self.results["performance"] = {
                "cpu_usage_percent": cpu_percent,
                "memory_usage_percent": memory_percent,
                "memory_available_gb": round(memory_available_gb, 2),
                "disk_usage_percent": disk_percent,
                "disk_free_gb": round(disk_free_gb, 2),
                "process_count": process_count,
                "status": "healthy" if cpu_percent < 80 and memory_percent < 80 and disk_percent < 80 else "warning"
            }
            
            print(f"   CPU: {cpu_percent}% | Memory: {memory_percent}% | Disk: {disk_percent}%")
            
            if cpu_percent > 80:
                self.results["recommendations"].append("High CPU usage detected - consider optimizing processes")
            if memory_percent > 80:
                self.results["recommendations"].append("High memory usage - consider increasing RAM or optimizing")
            if disk_percent > 80:
                self.results["recommendations"].append("Low disk space - consider cleanup or expansion")
                
            return True
            
        except Exception as e:
            print(f"   ❌ System resources check failed: {e}")
            self.results["performance"]["status"] = "error"
            self.results["performance"]["error"] = str(e)
            return False
    
    def check_database_health(self):
        """Check database connectivity and performance"""
        print("🗄️ Checking Database Health...")
        
        database_results = {}
        
        # Check agent database
        agent_db_path = project_root / "adlaan-agent" / "legal_knowledge.db"
        if agent_db_path.exists():
            try:
                start_time = time.time()
                conn = sqlite3.connect(str(agent_db_path))
                cursor = conn.cursor()
                
                # Test query performance
                cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                table_count = cursor.fetchone()[0]
                
                # Check database size
                db_size_mb = agent_db_path.stat().st_size / (1024*1024)
                
                query_time = (time.time() - start_time) * 1000
                
                database_results["agent_db"] = {
                    "status": "healthy",
                    "path": str(agent_db_path),
                    "size_mb": round(db_size_mb, 2),
                    "table_count": table_count,
                    "query_time_ms": round(query_time, 2)
                }
                
                conn.close()
                print(f"   ✅ Agent DB: {table_count} tables, {round(db_size_mb, 2)}MB, {round(query_time, 2)}ms")
                
            except Exception as e:
                database_results["agent_db"] = {
                    "status": "error",
                    "error": str(e)
                }
                print(f"   ❌ Agent DB failed: {e}")
        else:
            database_results["agent_db"] = {
                "status": "missing",
                "path": str(agent_db_path)
            }
            print(f"   ⚠️ Agent DB missing: {agent_db_path}")
        
        # Check web database
        web_db_path = project_root / "adlaan-web" / "db.sqlite3"
        if web_db_path.exists():
            try:
                start_time = time.time()
                conn = sqlite3.connect(str(web_db_path))
                cursor = conn.cursor()
                
                cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
                table_count = cursor.fetchone()[0]
                
                db_size_mb = web_db_path.stat().st_size / (1024*1024)
                query_time = (time.time() - start_time) * 1000
                
                database_results["web_db"] = {
                    "status": "healthy",
                    "path": str(web_db_path),
                    "size_mb": round(db_size_mb, 2),
                    "table_count": table_count,
                    "query_time_ms": round(query_time, 2)
                }
                
                conn.close()
                print(f"   ✅ Web DB: {table_count} tables, {round(db_size_mb, 2)}MB, {round(query_time, 2)}ms")
                
            except Exception as e:
                database_results["web_db"] = {
                    "status": "error",
                    "error": str(e)
                }
                print(f"   ❌ Web DB failed: {e}")
        else:
            database_results["web_db"] = {
                "status": "missing",
                "path": str(web_db_path)
            }
            print(f"   ⚠️ Web DB missing: {web_db_path}")
            
        self.results["databases"] = database_results
        return len([db for db in database_results.values() if db.get("status") == "healthy"]) > 0
    
    async def check_agent_service(self):
        """Check agent service health"""
        print("🤖 Checking Agent Service...")
        
        agent_status = {
            "service_running": False,
            "intelligence_enabled": False,
            "api_responsive": False,
            "response_time_ms": 0,
            "endpoints_available": []
        }
        
        try:
            # Test agent API
            start_time = time.time()
            response = requests.get("http://localhost:8005/", timeout=5)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                agent_status["service_running"] = True
                agent_status["api_responsive"] = True
                agent_status["response_time_ms"] = round(response_time, 2)
                
                data = response.json()
                agent_status["intelligence_enabled"] = data.get("intelligence_enabled", False)
                agent_status["endpoints_available"] = list(data.get("endpoints", {}).keys())
                
                print(f"   ✅ Agent Service: Running ({round(response_time, 2)}ms)")
                print(f"   🧠 Intelligence: {'Enabled' if agent_status['intelligence_enabled'] else 'Disabled'}")
                
                # Test intelligence status endpoint if enabled
                if agent_status["intelligence_enabled"]:
                    try:
                        intel_response = requests.get("http://localhost:8005/api/intelligence/status", timeout=3)
                        if intel_response.status_code == 200:
                            intel_data = intel_response.json()
                            agent_status["intelligence_status"] = intel_data.get("status", {})
                            print(f"   ✅ Intelligence Layer: Operational")
                    except:
                        print(f"   ⚠️ Intelligence Layer: Not responding")
                        
            else:
                print(f"   ❌ Agent Service: HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Agent Service: Not running (connection refused)")
        except requests.exceptions.Timeout:
            print(f"   ❌ Agent Service: Timeout (>5s)")
        except Exception as e:
            print(f"   ❌ Agent Service: Error - {e}")
            agent_status["error"] = str(e)
        
        self.results["systems"]["agent"] = agent_status
        return agent_status["service_running"]
    
    async def check_web_service(self):
        """Check web service health"""
        print("🌐 Checking Web Service...")
        
        web_status = {
            "service_running": False,
            "api_responsive": False,
            "response_time_ms": 0,
            "static_files": False
        }
        
        try:
            start_time = time.time()
            response = requests.get("http://localhost:8000/", timeout=5)
            response_time = (time.time() - start_time) * 1000
            
            if response.status_code == 200:
                web_status["service_running"] = True
                web_status["api_responsive"] = True
                web_status["response_time_ms"] = round(response_time, 2)
                
                # Check if response looks like Django
                if "django" in response.text.lower() or "adlaan" in response.text.lower():
                    web_status["django_detected"] = True
                
                print(f"   ✅ Web Service: Running ({round(response_time, 2)}ms)")
                
                # Test static files
                try:
                    static_response = requests.get("http://localhost:8000/static/css/style.css", timeout=3)
                    web_status["static_files"] = static_response.status_code == 200
                    print(f"   📁 Static Files: {'Available' if web_status['static_files'] else 'Not Found'}")
                except:
                    print(f"   📁 Static Files: Not accessible")
                
            else:
                print(f"   ❌ Web Service: HTTP {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"   ❌ Web Service: Not running (connection refused)")
        except requests.exceptions.Timeout:
            print(f"   ❌ Web Service: Timeout (>5s)")
        except Exception as e:
            print(f"   ❌ Web Service: Error - {e}")
            web_status["error"] = str(e)
        
        self.results["systems"]["web"] = web_status
        return web_status["service_running"]
    
    def check_file_structure(self):
        """Check critical file structure"""
        print("📁 Checking File Structure...")
        
        critical_files = [
            "adlaan-agent/main.py",
            "adlaan-agent/intelligence/__init__.py", 
            "adlaan-web/manage.py",
            "adlaan-web/adlaan_project/settings.py",
            "venv/bin/activate",  # Main venv
            ".env"
        ]
        
        file_status = {}
        missing_files = []
        
        for file_path in critical_files:
            full_path = project_root / file_path
            exists = full_path.exists()
            file_status[file_path] = {
                "exists": exists,
                "size_bytes": full_path.stat().st_size if exists else 0
            }
            
            if exists:
                print(f"   ✅ {file_path}")
            else:
                print(f"   ❌ {file_path}")
                missing_files.append(file_path)
        
        self.results["systems"]["file_structure"] = {
            "status": "healthy" if len(missing_files) == 0 else "warning",
            "files": file_status,
            "missing_files": missing_files
        }
        
        return len(missing_files) == 0
    
    def analyze_folder_sizes(self):
        """Analyze folder sizes for optimization"""
        print("📊 Analyzing Folder Sizes...")
        
        folders_to_check = [
            "adlaan-agent",
            "adlaan-web", 
            "venv",
            "static",
            "templates"
        ]
        
        folder_sizes = {}
        
        for folder in folders_to_check:
            folder_path = project_root / folder
            if folder_path.exists():
                try:
                    # Get folder size
                    total_size = sum(
                        f.stat().st_size 
                        for f in folder_path.rglob('*') 
                        if f.is_file()
                    )
                    size_mb = total_size / (1024*1024)
                    
                    folder_sizes[folder] = {
                        "size_mb": round(size_mb, 2),
                        "size_bytes": total_size,
                        "status": "normal" if size_mb < 100 else "large" if size_mb < 1000 else "very_large"
                    }
                    
                    print(f"   📁 {folder}: {round(size_mb, 2)}MB")
                    
                    # Add recommendations for large folders
                    if size_mb > 1000:
                        self.results["recommendations"].append(f"{folder} is very large ({round(size_mb, 2)}MB) - consider cleanup")
                    elif size_mb > 500:
                        self.results["recommendations"].append(f"{folder} is large ({round(size_mb, 2)}MB) - monitor growth")
                        
                except Exception as e:
                    folder_sizes[folder] = {
                        "status": "error",
                        "error": str(e)
                    }
                    
        self.results["systems"]["folder_sizes"] = folder_sizes
    
    def generate_recommendations(self):
        """Generate optimization recommendations"""
        print("💡 Generating Recommendations...")
        
        # Performance recommendations
        perf = self.results.get("performance", {})
        if perf.get("memory_usage_percent", 0) > 70:
            self.results["recommendations"].append("Consider optimizing memory usage or adding more RAM")
        
        if perf.get("cpu_usage_percent", 0) > 70:
            self.results["recommendations"].append("High CPU usage detected - optimize processes or upgrade CPU")
        
        # Database recommendations
        db_results = self.results.get("databases", {})
        for db_name, db_info in db_results.items():
            if db_info.get("size_mb", 0) > 100:
                self.results["recommendations"].append(f"{db_name} is large - consider archiving old data")
            if db_info.get("query_time_ms", 0) > 100:
                self.results["recommendations"].append(f"{db_name} queries are slow - consider indexing")
        
        # Service recommendations
        systems = self.results.get("systems", {})
        if not systems.get("agent", {}).get("service_running"):
            self.results["recommendations"].append("Start agent service: cd adlaan-agent && python main.py")
        if not systems.get("web", {}).get("service_running"):
            self.results["recommendations"].append("Start web service: cd adlaan-web && python manage.py runserver")
        
        # General optimization
        if len(self.results["recommendations"]) == 0:
            self.results["recommendations"].append("System appears healthy - no immediate optimizations needed")
    
    def calculate_overall_status(self):
        """Calculate overall system health status"""
        
        # Count healthy systems
        healthy_count = 0
        total_systems = 0
        
        # Check databases
        for db_info in self.results.get("databases", {}).values():
            total_systems += 1
            if db_info.get("status") == "healthy":
                healthy_count += 1
        
        # Check services
        for system_info in self.results.get("systems", {}).values():
            if isinstance(system_info, dict) and "service_running" in system_info:
                total_systems += 1
                if system_info.get("service_running"):
                    healthy_count += 1
        
        # Calculate status
        if total_systems == 0:
            self.results["overall_status"] = "unknown"
        elif healthy_count == total_systems:
            self.results["overall_status"] = "healthy"
        elif healthy_count >= total_systems * 0.7:
            self.results["overall_status"] = "warning" 
        else:
            self.results["overall_status"] = "critical"
    
    async def run_full_check(self):
        """Run complete health check"""
        print("🚀 Adlaan Backend Health Check")
        print("=" * 50)
        
        # Run all checks
        await self.check_system_resources()
        self.check_database_health()
        await self.check_agent_service()
        await self.check_web_service()
        self.check_file_structure()
        self.analyze_folder_sizes()
        self.generate_recommendations()
        self.calculate_overall_status()
        
        return self.results
    
    def print_summary(self):
        """Print health check summary"""
        print("\n" + "=" * 50)
        print("📋 HEALTH CHECK SUMMARY")
        print("=" * 50)
        
        status_emoji = {
            "healthy": "✅",
            "warning": "⚠️", 
            "critical": "❌",
            "unknown": "❓"
        }
        
        overall = self.results["overall_status"]
        print(f"Overall Status: {status_emoji.get(overall)} {overall.upper()}")
        
        # System performance
        perf = self.results.get("performance", {})
        if perf:
            print(f"\n💻 System Performance:")
            print(f"   CPU: {perf.get('cpu_usage_percent', 0)}%")
            print(f"   Memory: {perf.get('memory_usage_percent', 0)}% ({perf.get('memory_available_gb', 0)}GB free)")
            print(f"   Disk: {perf.get('disk_usage_percent', 0)}% ({perf.get('disk_free_gb', 0)}GB free)")
        
        # Services status
        systems = self.results.get("systems", {})
        if systems:
            print(f"\n🔧 Services:")
            for service_name, service_info in systems.items():
                if isinstance(service_info, dict) and "service_running" in service_info:
                    status = "✅ Running" if service_info["service_running"] else "❌ Stopped"
                    response_time = service_info.get("response_time_ms", 0)
                    print(f"   {service_name}: {status} ({response_time}ms)")
        
        # Database status
        databases = self.results.get("databases", {})
        if databases:
            print(f"\n🗄️ Databases:")
            for db_name, db_info in databases.items():
                status = db_info.get("status", "unknown")
                size = db_info.get("size_mb", 0)
                print(f"   {db_name}: {status_emoji.get(status)} {status} ({size}MB)")
        
        # Recommendations
        recommendations = self.results.get("recommendations", [])
        if recommendations:
            print(f"\n💡 Recommendations:")
            for i, rec in enumerate(recommendations[:5], 1):  # Show top 5
                print(f"   {i}. {rec}")
        
        print("\n" + "=" * 50)


async def main():
    """Main function"""
    checker = AdlaanHealthChecker()
    results = await checker.run_full_check()
    checker.print_summary()
    
    # Save results to file
    import json
    results_path = project_root / "health_check_results.json"
    with open(results_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📊 Detailed results saved to: {results_path}")
    
    # Return appropriate exit code
    overall_status = results["overall_status"]
    return 0 if overall_status in ["healthy", "warning"] else 1


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n⚠️ Health check interrupted")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Health check failed: {e}")
        sys.exit(1)