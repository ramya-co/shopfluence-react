#!/usr/bin/env python
"""
Test the leaderboard API endpoints
"""
import requests
import json

BASE_URL = 'http://localhost:8002/api'

def test_api():
    print("🧪 Testing Leaderboard API Integration")
    print("=" * 50)
    
    # Test health endpoint
    try:
        response = requests.get(f'{BASE_URL}/health/')
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return
    
    # Test leaderboard endpoint
    try:
        response = requests.get(f'{BASE_URL}/leaderboard/')
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Leaderboard endpoint working")
            print(f"   Found {len(data['results'])} users")
            if data['results']:
                top_user = data['results'][0]
                print(f"   Top user: {top_user['display_name']} ({top_user['total_score']} points)")
        else:
            print(f"❌ Leaderboard failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Leaderboard error: {e}")
    
    # Test stats endpoint
    try:
        response = requests.get(f'{BASE_URL}/stats/')
        if response.status_code == 200:
            stats = response.json()
            print(f"✅ Stats endpoint working")
            print(f"   Total users: {stats['total_users']}")
            print(f"   Total bugs: {stats['total_bugs_found']}")
            print(f"   Total points: {stats['total_points_awarded']}")
        else:
            print(f"❌ Stats failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Stats error: {e}")
    
    # Test recording a bug (simulation)
    test_bug_data = {
        "user_id": "test_user_123",
        "display_name": "Test Hunter",
        "bug_identifier": "TEST_BUG_API_INTEGRATION",
        "points": 50,
        "description": "Testing API integration"
    }
    
    try:
        response = requests.post(
            f'{BASE_URL}/record-bug/',
            headers={'Content-Type': 'application/json'},
            data=json.dumps(test_bug_data)
        )
        if response.status_code in [200, 201]:
            result = response.json()
            print(f"✅ Bug recording working")
            print(f"   User: {result['user']['display_name']}")
            print(f"   New rank: #{result['user']['rank']}")
            print(f"   Total score: {result['user']['total_score']}")
        else:
            print(f"❌ Bug recording failed: {response.status_code}")
            if response.content:
                print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ Bug recording error: {e}")
    
    print("\n🎉 API Integration Test Complete!")

if __name__ == "__main__":
    test_api()
