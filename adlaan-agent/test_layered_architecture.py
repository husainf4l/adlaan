#!/usr/bin/env python3
"""
Test script for 3-Layer Architecture API
"""
import requests
import json
import time

BASE_URL = "http://localhost:8005"

def test_root_endpoint():
    """Test the root endpoint to see system status"""
    print("=" * 80)
    print("🧪 Testing Root Endpoint: GET /")
    print("=" * 80)
    
    response = requests.get(f"{BASE_URL}/")
    data = response.json()
    
    print(f"\n✅ Status Code: {response.status_code}")
    print(f"📝 Message: {data['message']}")
    print(f"\n🏗️  Architecture Status:")
    print(f"   • Layered Architecture: {'✅ ENABLED' if data.get('layered_architecture_enabled') else '❌ DISABLED'}")
    print(f"   • Intelligence Layer: {'✅ ENABLED' if data.get('intelligence_enabled') else '❌ DISABLED'}")
    
    if data.get('architecture'):
        print(f"\n🎯 Layers:")
        for layer_name, layer_desc in data['architecture']['layers'].items():
            print(f"   • {layer_name.upper()}: {layer_desc}")
    
    print(f"\n📡 Available Endpoints:")
    for endpoint_name, endpoint_desc in data['endpoints'].items():
        print(f"   • {endpoint_name}: {endpoint_desc}")
    
    print(f"\n✨ Features:")
    for feature_name, feature_enabled in data['features'].items():
        status = "✅" if feature_enabled else "❌"
        print(f"   {status} {feature_name}")
    
    return data


def test_layered_chat(message: str):
    """Test the 3-layer chat endpoint with streaming"""
    print("\n" + "=" * 80)
    print(f"🧪 Testing Layered Chat: POST /api/layered-chat")
    print(f"📝 Message: '{message}'")
    print("=" * 80)
    
    payload = {
        "message": message,
        "session_id": "test-session-123"
    }
    
    print(f"\n🚀 Sending request...\n")
    
    try:
        response = requests.post(
            f"{BASE_URL}/api/layered-chat",
            json=payload,
            stream=True,
            headers={"Accept": "text/event-stream"}
        )
        
        if response.status_code != 200:
            print(f"❌ Error: Status code {response.status_code}")
            print(f"Response: {response.text}")
            return
        
        print("📊 Streaming Progress:\n")
        
        # Parse SSE events
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data_str = line[6:]  # Remove 'data: ' prefix
                    try:
                        data = json.loads(data_str)
                        event_type = data.get('type')
                        
                        if event_type == 'start':
                            print(f"🏗️  {data.get('message')}")
                            print(f"   Session: {data.get('session_id')}\n")
                        
                        elif event_type == 'architecture_info':
                            print(f"📐 {data.get('content')}")
                            for layer_name, layer_desc in data['layers'].items():
                                print(f"   • {layer_name.upper()}: {layer_desc}")
                            print()
                        
                        elif event_type == 'layer_progress':
                            layer = data.get('layer', 'PROCESSING')
                            agent = data.get('agent', 'Working')
                            progress = data.get('progress', 0)
                            
                            # Progress bar
                            bar_length = 30
                            filled = int(bar_length * progress / 100)
                            bar = '█' * filled + '░' * (bar_length - filled)
                            
                            print(f"[{layer:10}] {agent:20} [{bar}] {progress:3}%")
                        
                        elif event_type == 'document':
                            print(f"\n📄 DOCUMENT GENERATED:")
                            print(f"   ID: {data.get('document_id')}")
                            metadata = data.get('metadata', {})
                            print(f"   Word Count: {metadata.get('word_count', 0)}")
                            print(f"   Compliance: {metadata.get('compliance_score', 0):.0%}")
                            print(f"   Citations: {len(data.get('citations', []))}")
                            
                            # Show first 200 chars of content
                            content = data.get('content', '')
                            if content:
                                preview = content[:200] + "..." if len(content) > 200 else content
                                print(f"\n   Preview:\n   {preview}\n")
                        
                        elif event_type == 'completion':
                            print(f"\n✅ {data.get('content')}")
                            stats = data.get('statistics', {})
                            print(f"\n📊 Final Statistics:")
                            print(f"   • Document ID: {stats.get('document_id')}")
                            print(f"   • Progress: {stats.get('progress')}%")
                            print(f"   • Compliance Score: {stats.get('compliance_score', 0):.0%}")
                            print(f"   • Word Count: {stats.get('word_count')}")
                            print(f"   • Citations: {stats.get('citations_count')}")
                            print(f"   • Validation: {'✅ PASSED' if stats.get('validation_passed') else '❌ FAILED'}")
                        
                        elif event_type == 'end':
                            print(f"\n🏁 Pipeline Complete!")
                        
                        elif event_type == 'error':
                            print(f"\n❌ ERROR: {data.get('content')}")
                    
                    except json.JSONDecodeError:
                        continue
        
        print("\n" + "=" * 80)
    
    except Exception as e:
        print(f"\n❌ Exception: {e}")


def main():
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                 ADLAAN LEGAL AI - 3-LAYER ARCHITECTURE TEST                  ║
║                            API Testing Suite                                  ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")
    
    # Test 1: Root endpoint
    root_data = test_root_endpoint()
    
    if not root_data.get('layered_architecture_enabled'):
        print("\n❌ 3-Layer Architecture is not enabled!")
        print("   Server may need to restart or there was an initialization error.")
        return
    
    # Wait a bit
    time.sleep(2)
    
    # Test 2: Simple consultation
    test_layered_chat("What is the jordan labor law?")
    
    time.sleep(1)
    
    # Test 3: Document creation
    # test_layered_chat("Create a simple service agreement")
    
    print("""
╔══════════════════════════════════════════════════════════════════════════════╗
║                            ✅ TESTING COMPLETE                                ║
╚══════════════════════════════════════════════════════════════════════════════╝
""")


if __name__ == "__main__":
    main()
