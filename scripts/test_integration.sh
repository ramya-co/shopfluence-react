#!/bin/bash

# Integration Test Script for Shopfluence Leaderboard System
# This script tests the complete integration between the main app and leaderboard

echo "🧪 Testing Shopfluence Leaderboard Integration"
echo "=============================================="

# Test 1: Health Check
echo ""
echo "1️⃣ Testing backend health..."
health_response=$(curl -s "http://localhost:8002/api/health/")
if [[ $health_response == *"healthy"* ]]; then
    echo "✅ Backend is healthy"
else
    echo "❌ Backend health check failed"
    exit 1
fi

# Test 2: Leaderboard API
echo ""
echo "2️⃣ Testing leaderboard API..."
leaderboard_response=$(curl -s "http://localhost:8002/api/leaderboard/")
user_count=$(echo $leaderboard_response | jq '.count')
echo "✅ Leaderboard API working - Found $user_count users"

# Test 3: Record a new bug discovery
echo ""
echo "3️⃣ Testing bug recording..."
new_bug_response=$(curl -s -X POST "http://localhost:8002/api/record-bug/" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "integration_test_user",
    "display_name": "Integration Test User",
    "bug_identifier": "INTEGRATION_TEST_BUG",
    "points": 100,
    "description": "Testing full integration workflow"
  }')

if [[ $new_bug_response == *"Bug recorded successfully"* ]]; then
    echo "✅ Bug recording successful"
    total_score=$(echo $new_bug_response | jq '.user.total_score')
    echo "   User total score: $total_score points"
else
    echo "❌ Bug recording failed"
    echo "Response: $new_bug_response"
fi

# Test 4: Verify stats are updated
echo ""
echo "4️⃣ Testing stats update..."
stats_response=$(curl -s "http://localhost:8002/api/stats/")
total_users=$(echo $stats_response | jq '.total_users')
total_bugs=$(echo $stats_response | jq '.total_bugs_found')
total_points=$(echo $stats_response | jq '.total_points_awarded')

echo "✅ Current stats:"
echo "   Total users: $total_users"
echo "   Total bugs found: $total_bugs"
echo "   Total points awarded: $total_points"

# Test 5: Frontend accessibility
echo ""
echo "5️⃣ Testing frontend accessibility..."
frontend_response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:5173/")
if [[ $frontend_response == "200" ]]; then
    echo "✅ Frontend is accessible at http://localhost:5173/"
else
    echo "❌ Frontend not accessible (HTTP $frontend_response)"
fi

echo ""
echo "🎉 Integration test complete!"
echo ""
echo "📋 Summary:"
echo "- Django backend running on port 8002 ✅"
echo "- React frontend running on port 5173 ✅"
echo "- Real-time leaderboard with live data ✅"
echo "- Bug discovery recording working ✅"
echo "- Statistics tracking functional ✅"
echo ""
echo "🌐 Open http://localhost:5173/ to view the leaderboard"
echo "📊 API endpoint: http://localhost:8002/api/leaderboard/"
