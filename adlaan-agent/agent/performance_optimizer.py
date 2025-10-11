"""
🚀 Performance Optimization Layer for 3-Layer Architecture

Implements:
1. Parallel Subgraphs - Multiple agents run simultaneously
2. Vector Caching - Redis/in-memory caching for legal searches
3. Streaming Tokens - Real-time SSE streaming
4. Asynchronous Tools - Non-blocking operations
5. Failover & Timeout Handling - Robust error recovery
"""

from typing import Dict, List, Optional, Any
import asyncio
import hashlib
import time
from datetime import datetime, timedelta
from functools import wraps
import json


# ═══════════════════════════════════════════════════════════════
# 1. VECTOR CACHING SYSTEM
# ═══════════════════════════════════════════════════════════════

class LegalSearchCache:
    """
    In-memory cache for legal searches with TTL
    Production: Replace with Redis or pgvector
    """
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, Dict] = {}
        self.ttl = ttl_seconds
        print(f"🗄️  Legal Search Cache initialized (TTL: {ttl_seconds}s)")
    
    def _generate_key(self, query: str, jurisdiction: str, version: str) -> str:
        """Generate cache key from search parameters"""
        data = f"{query}:{jurisdiction}:{version}"
        return hashlib.md5(data.encode()).hexdigest()
    
    def get(self, query: str, jurisdiction: str, version: str) -> Optional[Dict]:
        """Get cached search results"""
        key = self._generate_key(query, jurisdiction, version)
        
        if key in self.cache:
            entry = self.cache[key]
            # Check if expired
            if datetime.now() < entry["expires_at"]:
                print(f"✅ Cache HIT: {query[:30]}... ({jurisdiction})")
                return entry["data"]
            else:
                # Remove expired entry
                del self.cache[key]
                print(f"⏰ Cache EXPIRED: {query[:30]}...")
        
        print(f"❌ Cache MISS: {query[:30]}...")
        return None
    
    def set(self, query: str, jurisdiction: str, version: str, data: Dict):
        """Cache search results"""
        key = self._generate_key(query, jurisdiction, version)
        
        self.cache[key] = {
            "data": data,
            "cached_at": datetime.now(),
            "expires_at": datetime.now() + timedelta(seconds=self.ttl)
        }
        
        print(f"💾 Cached: {query[:30]}... ({jurisdiction})")
    
    def clear(self):
        """Clear all cache"""
        count = len(self.cache)
        self.cache.clear()
        print(f"🗑️  Cleared {count} cache entries")
    
    def get_stats(self) -> Dict:
        """Get cache statistics"""
        total = len(self.cache)
        expired = sum(1 for entry in self.cache.values() 
                     if datetime.now() >= entry["expires_at"])
        
        return {
            "total_entries": total,
            "active_entries": total - expired,
            "expired_entries": expired,
            "ttl_seconds": self.ttl
        }


# Global cache instance
legal_cache = LegalSearchCache(ttl_seconds=3600)


# ═══════════════════════════════════════════════════════════════
# 2. ASYNC TOOLS WITH TIMEOUT
# ═══════════════════════════════════════════════════════════════

def async_with_timeout(timeout_seconds: int = 30):
    """
    Decorator for async functions with timeout
    Prevents blocking if external API/DB is slow
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(
                    func(*args, **kwargs),
                    timeout=timeout_seconds
                )
            except asyncio.TimeoutError:
                print(f"⏱️  TIMEOUT: {func.__name__} exceeded {timeout_seconds}s")
                # Return safe fallback
                return {
                    "error": "timeout",
                    "message": f"Operation timed out after {timeout_seconds}s"
                }
            except Exception as e:
                print(f"❌ ERROR in {func.__name__}: {e}")
                return {
                    "error": str(e),
                    "message": "Operation failed"
                }
        
        return wrapper
    return decorator


# ═══════════════════════════════════════════════════════════════
# 3. FAILOVER & RETRY LOGIC
# ═══════════════════════════════════════════════════════════════

def with_retry(max_retries: int = 3, backoff_factor: float = 1.5):
    """
    Decorator for retry logic with exponential backoff
    Useful for flaky external APIs
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            last_exception = None
            
            for attempt in range(max_retries):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_retries - 1:
                        wait_time = backoff_factor ** attempt
                        print(f"🔄 Retry {attempt + 1}/{max_retries} for {func.__name__} after {wait_time:.1f}s")
                        await asyncio.sleep(wait_time)
                    else:
                        print(f"❌ All retries failed for {func.__name__}")
            
            # Return fallback after all retries
            return {
                "error": "max_retries_exceeded",
                "message": f"Failed after {max_retries} attempts: {str(last_exception)}"
            }
        
        return wrapper
    return decorator


# ═══════════════════════════════════════════════════════════════
# 4. PARALLEL EXECUTION MANAGER
# ═══════════════════════════════════════════════════════════════

class ParallelExecutor:
    """
    Execute multiple agents in parallel for speed
    Example: Review + Validate can run simultaneously
    """
    
    @staticmethod
    async def run_parallel(tasks: List[asyncio.Task]) -> List[Any]:
        """Run multiple tasks in parallel"""
        print(f"⚡ Running {len(tasks)} tasks in parallel...")
        start_time = time.time()
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        elapsed = time.time() - start_time
        print(f"✅ Parallel execution complete in {elapsed:.2f}s")
        
        # Filter out exceptions
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                print(f"⚠️  Task {i} failed: {result}")
                valid_results.append({
                    "error": str(result),
                    "task_index": i
                })
            else:
                valid_results.append(result)
        
        return valid_results
    
    @staticmethod
    async def run_with_fallback(
        primary_task: asyncio.Task,
        fallback_task: asyncio.Task,
        timeout: float = 30.0
    ) -> Any:
        """Run primary task with fallback if it fails"""
        try:
            result = await asyncio.wait_for(primary_task, timeout=timeout)
            print("✅ Primary task succeeded")
            return result
        except (asyncio.TimeoutError, Exception) as e:
            print(f"⚠️  Primary task failed: {e}")
            print("🔄 Falling back to secondary task...")
            try:
                result = await fallback_task
                print("✅ Fallback task succeeded")
                return result
            except Exception as e2:
                print(f"❌ Fallback also failed: {e2}")
                return {
                    "error": "both_failed",
                    "primary_error": str(e),
                    "fallback_error": str(e2)
                }


# ═══════════════════════════════════════════════════════════════
# 5. STREAMING TOKEN MANAGER
# ═══════════════════════════════════════════════════════════════

class StreamingTokenManager:
    """
    Manages token streaming for real-time user feedback
    Buffers tokens and yields them progressively
    """
    
    def __init__(self, chunk_size: int = 10):
        self.chunk_size = chunk_size
        self.buffer = []
    
    async def stream_text(self, text: str, delay: float = 0.01):
        """Stream text token by token with delay"""
        for char in text:
            self.buffer.append(char)
            
            # Yield chunks for better performance
            if len(self.buffer) >= self.chunk_size:
                chunk = ''.join(self.buffer)
                self.buffer = []
                yield chunk
                await asyncio.sleep(delay)
        
        # Yield remaining buffer
        if self.buffer:
            chunk = ''.join(self.buffer)
            self.buffer = []
            yield chunk
    
    async def stream_json(self, data: Dict, field: str = "content"):
        """Stream JSON response field by field"""
        if field in data:
            async for chunk in self.stream_text(data[field]):
                yield {
                    "type": "token",
                    "content": chunk
                }
        
        # Send complete data at the end
        yield {
            "type": "complete",
            "data": data
        }


# ═══════════════════════════════════════════════════════════════
# 6. PERFORMANCE MONITOR
# ═══════════════════════════════════════════════════════════════

class PerformanceMonitor:
    """
    Monitor and log performance metrics
    Tracks timing, success rates, cache hits
    """
    
    def __init__(self):
        self.metrics = {
            "total_requests": 0,
            "successful_requests": 0,
            "failed_requests": 0,
            "average_latency": 0.0,
            "cache_hits": 0,
            "cache_misses": 0,
            "parallel_executions": 0,
            "timeouts": 0,
            "retries": 0
        }
        self.request_times = []
    
    def record_request(self, success: bool, latency: float):
        """Record request metrics"""
        self.metrics["total_requests"] += 1
        
        if success:
            self.metrics["successful_requests"] += 1
        else:
            self.metrics["failed_requests"] += 1
        
        self.request_times.append(latency)
        
        # Keep only last 100 requests for average
        if len(self.request_times) > 100:
            self.request_times.pop(0)
        
        self.metrics["average_latency"] = sum(self.request_times) / len(self.request_times)
    
    def record_cache_hit(self, hit: bool):
        """Record cache hit/miss"""
        if hit:
            self.metrics["cache_hits"] += 1
        else:
            self.metrics["cache_misses"] += 1
    
    def get_stats(self) -> Dict:
        """Get performance statistics"""
        total = self.metrics["total_requests"]
        cache_total = self.metrics["cache_hits"] + self.metrics["cache_misses"]
        
        return {
            **self.metrics,
            "success_rate": (self.metrics["successful_requests"] / total * 100) if total > 0 else 0,
            "cache_hit_rate": (self.metrics["cache_hits"] / cache_total * 100) if cache_total > 0 else 0
        }
    
    def print_stats(self):
        """Print performance statistics"""
        stats = self.get_stats()
        
        print("\n" + "=" * 60)
        print("📊 PERFORMANCE STATISTICS")
        print("=" * 60)
        print(f"Total Requests:      {stats['total_requests']}")
        print(f"Success Rate:        {stats['success_rate']:.1f}%")
        print(f"Average Latency:     {stats['average_latency']:.2f}s")
        print(f"Cache Hit Rate:      {stats['cache_hit_rate']:.1f}%")
        print(f"Parallel Executions: {stats['parallel_executions']}")
        print(f"Timeouts:            {stats['timeouts']}")
        print(f"Retries:             {stats['retries']}")
        print("=" * 60 + "\n")


# Global performance monitor
performance_monitor = PerformanceMonitor()


# ═══════════════════════════════════════════════════════════════
# 7. LIGHTWEIGHT STATE OBJECT
# ═══════════════════════════════════════════════════════════════

class OptimizedState:
    """
    Lightweight state object for passing between nodes
    Only includes essential data, computed fields on-demand
    """
    
    def __init__(self, initial_data: Dict = None):
        self._data = initial_data or {}
        self._computed_cache = {}
    
    def set(self, key: str, value: Any):
        """Set state value"""
        self._data[key] = value
        # Clear computed cache when data changes
        self._computed_cache.clear()
    
    def get(self, key: str, default: Any = None) -> Any:
        """Get state value"""
        return self._data.get(key, default)
    
    def update(self, data: Dict):
        """Update multiple values"""
        self._data.update(data)
        self._computed_cache.clear()
    
    def to_dict(self) -> Dict:
        """Export state as dictionary"""
        return self._data.copy()
    
    def get_size(self) -> int:
        """Get approximate size in bytes"""
        return len(json.dumps(self._data))
    
    @property
    def essential_data(self) -> Dict:
        """Get only essential fields for passing between nodes"""
        essential_keys = [
            "user_request",
            "task_type",
            "jurisdiction",
            "current_layer",
            "progress_percentage"
        ]
        return {k: v for k, v in self._data.items() if k in essential_keys}


# ═══════════════════════════════════════════════════════════════
# 8. OPTIMIZATION UTILITIES
# ═══════════════════════════════════════════════════════════════

class OptimizationUtils:
    """Utility functions for optimization"""
    
    @staticmethod
    def should_use_cache(task_type: str) -> bool:
        """Determine if caching should be used"""
        # Don't cache for personalized or time-sensitive tasks
        no_cache_types = ["consultation", "review"]
        return task_type not in no_cache_types
    
    @staticmethod
    def estimate_parallel_speedup(num_tasks: int, sequential_time: float) -> float:
        """Estimate speedup from parallel execution using Amdahl's Law"""
        # Assume 80% of work is parallelizable
        parallel_fraction = 0.8
        serial_fraction = 1 - parallel_fraction
        
        theoretical_speedup = 1 / (serial_fraction + (parallel_fraction / num_tasks))
        
        # Apply overhead factor (10% for coordination)
        overhead = 0.1
        actual_speedup = theoretical_speedup * (1 - overhead)
        
        return sequential_time / actual_speedup
    
    @staticmethod
    def optimize_batch_size(total_items: int, max_concurrent: int = 5) -> int:
        """Calculate optimal batch size for processing"""
        if total_items <= max_concurrent:
            return total_items
        
        # Aim for 3-5 batches for better progress feedback
        target_batches = 4
        batch_size = max(1, total_items // target_batches)
        
        return min(batch_size, max_concurrent)


# ═══════════════════════════════════════════════════════════════
# 9. CIRCUIT BREAKER PATTERN
# ═══════════════════════════════════════════════════════════════

class CircuitBreaker:
    """
    Circuit breaker pattern to prevent cascading failures
    Temporarily disables failing services
    """
    
    def __init__(self, failure_threshold: int = 5, timeout: int = 60):
        self.failure_threshold = failure_threshold
        self.timeout = timeout
        self.failures = 0
        self.last_failure_time = None
        self.state = "closed"  # closed, open, half-open
    
    def call(self, func):
        """Execute function with circuit breaker protection"""
        if self.state == "open":
            # Check if timeout has passed
            if (datetime.now() - self.last_failure_time).seconds >= self.timeout:
                self.state = "half-open"
                print("🔄 Circuit breaker: HALF-OPEN (testing)")
            else:
                print("🚫 Circuit breaker: OPEN (service unavailable)")
                return {
                    "error": "circuit_breaker_open",
                    "message": "Service temporarily unavailable"
                }
        
        try:
            result = func()
            
            if self.state == "half-open":
                # Success, close circuit
                self.state = "closed"
                self.failures = 0
                print("✅ Circuit breaker: CLOSED (service recovered)")
            
            return result
        
        except Exception as e:
            self.failures += 1
            self.last_failure_time = datetime.now()
            
            if self.failures >= self.failure_threshold:
                self.state = "open"
                print(f"⚠️  Circuit breaker: OPEN (threshold reached: {self.failures})")
            
            raise e


# ═══════════════════════════════════════════════════════════════
# 10. EXPORT OPTIMIZATION MANAGER
# ═══════════════════════════════════════════════════════════════

class OptimizationManager:
    """
    Central manager for all optimization features
    """
    
    def __init__(self):
        self.cache = legal_cache
        self.monitor = performance_monitor
        self.parallel_executor = ParallelExecutor()
        self.streaming_manager = StreamingTokenManager()
        
        print("\n🚀 OPTIMIZATION LAYER INITIALIZED")
        print("=" * 60)
        print("✓ Vector Caching (in-memory)")
        print("✓ Parallel Execution")
        print("✓ Async Tools with Timeout")
        print("✓ Retry & Failover Logic")
        print("✓ Performance Monitoring")
        print("✓ Circuit Breaker Pattern")
        print("=" * 60)
    
    def get_system_status(self) -> Dict:
        """Get optimization system status"""
        return {
            "optimization_active": True,
            "cache_stats": self.cache.get_stats(),
            "performance_stats": self.monitor.get_stats(),
            "features": {
                "vector_caching": True,
                "parallel_execution": True,
                "async_tools": True,
                "streaming": True,
                "failover": True,
                "circuit_breaker": True
            }
        }
    
    def print_summary(self):
        """Print optimization summary"""
        self.monitor.print_stats()
        
        cache_stats = self.cache.get_stats()
        print(f"Cache Entries: {cache_stats['active_entries']} active, {cache_stats['expired_entries']} expired")


# Global optimization manager
optimization_manager = OptimizationManager()


# ═══════════════════════════════════════════════════════════════
# EXAMPLE USAGE
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    import asyncio
    
    # Example 1: Cached legal search
    @async_with_timeout(timeout_seconds=10)
    @with_retry(max_retries=3)
    async def search_legal_database(query: str, jurisdiction: str):
        """Example legal search with caching"""
        # Check cache first
        cached = legal_cache.get(query, jurisdiction, "2025")
        if cached:
            return cached
        
        # Simulate database search
        await asyncio.sleep(1)
        result = {
            "laws": ["Law 1", "Law 2"],
            "articles": ["Article 123", "Article 456"]
        }
        
        # Cache the result
        legal_cache.set(query, jurisdiction, "2025", result)
        
        return result
    
    # Example 2: Parallel execution
    async def example_parallel():
        """Example parallel execution"""
        tasks = [
            asyncio.create_task(search_legal_database("contract law", "jordan")),
            asyncio.create_task(search_legal_database("labor law", "jordan")),
            asyncio.create_task(search_legal_database("civil code", "jordan"))
        ]
        
        results = await ParallelExecutor.run_parallel(tasks)
        print(f"Parallel results: {len(results)} completed")
    
    # Run example
    asyncio.run(example_parallel())
    
    # Print statistics
    optimization_manager.print_summary()
