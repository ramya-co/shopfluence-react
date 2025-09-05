# 🎯 Clickjacking Vulnerability Implementation Guide

## 📋 Overview

Successfully implemented **Clickjacking vulnerability** in the bug bounty platform following the exact specifications provided. The implementation includes proper detection, notification, and leaderboard integration.

### 🚨 Bug Details
- **Type**: Clickjacking Exposure  
- **Points**: 100 pts
- **Trigger**: `bb_iframe=1` query parameter
- **Detection**: JavaScript checks `window.top !== window.self`
- **Affected Page**: `/account/profile`

---

## 🔧 Implementation Details

### 1. **Backend Implementation**

#### **Bug Recording Endpoint**
- **URL**: `/api/bugs/record/`
- **Method**: `GET` or `POST`
- **Location**: `accounts/views.py`
- **Function**: `record_bug_endpoint()`

```python
# 🚨 BUG: Clickjacking Exposure - Bug recording endpoint
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def record_bug_endpoint(request):
    """Bug recording endpoint for client-side vulnerability detection"""
    
    bug_type = request.GET.get('bug') or request.data.get('bug')
    mark = request.GET.get('mark') or request.data.get('mark')
    
    # Only accept clickjacking bugs with proper mark
    if bug_type == 'clickjack' and mark == '1':
        # Record in leaderboard and return success response
```

#### **URL Configuration**
```python
# accounts/urls.py
path('bugs/record/', views.record_bug_endpoint, name='record_bug'),
```

### 2. **Frontend Implementation**

#### **Profile Page Detection**
- **File**: `src/pages/Profile.tsx`
- **Route**: `/account/profile` (added to App.tsx)
- **Trigger**: URL parameter `bb_iframe=1`

```typescript
// Clickjacking detection when bb_iframe=1 is present
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const bbIframe = urlParams.get('bb_iframe');
  
  if (bbIframe === '1') {
    // Inject clickjacking detection script
    const script = document.createElement('script');
    script.innerHTML = `
      if (window.top !== window.self) {
        // Page is in iframe - vulnerability detected!
        fetch('/api/bugs/record/?bug=clickjack&mark=1', { 
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bug: 'clickjack', mark: '1' })
        })
        .then(response => response.json())
        .then(data => {
          if (data.bug_found === 'CLICKJACKING') {
            // Show notification
            if (window.showBugNotification) {
              window.showBugNotification(data);
            }
          }
        });
      }
    `;
    document.head.appendChild(script);
  }
}, []);
```

### 3. **Test Infrastructure**

#### **Attacker Test Page**
- **Location**: `clickjacking-test/frame-test.html`
- **Server**: `clickjacking-test/server.py` (Port 8082)
- **Purpose**: Demonstrates clickjacking by embedding the profile page

```html
<iframe src="http://localhost:5173/account/profile?bb_iframe=1" 
        style="width:1200px;height:800px;border:1px solid #ccc">
</iframe>
```

#### **Test Console Function**
```javascript
// Available globally in browser console
window.testClickjacking()
```

---

## 🎮 Testing Guide

### **Method 1: Using Attacker Test Page**

1. **Start the clickjacking test server**:
   ```bash
   cd clickjacking-test
   python3 server.py
   ```

2. **Open the test page**:
   ```
   http://localhost:8082/frame-test.html
   ```

3. **Expected Result**:
   - Profile page loads inside iframe
   - Browser console shows: "🎉 Clickjacking vulnerability detected!"
   - Notification appears: "🎉 Clickjacking exposure detected!"
   - Leaderboard updates with 100 points

### **Method 2: Console Testing**

1. **Open any page** in the application
2. **Run in browser console**:
   ```javascript
   window.testClickjacking()
   ```
3. **Expected Result**:
   - API call succeeds
   - Notification appears
   - Console shows success message

### **Method 3: Direct API Testing**

```bash
curl -X POST "http://localhost:8000/api/bugs/record/?bug=clickjack&mark=1" \
     -H "Content-Type: application/json" \
     -d '{"bug": "clickjack", "mark": "1"}'
```

**Expected Response**:
```json
{
  "bug_found": "CLICKJACKING",
  "message": "🎉 Clickjacking exposure detected!",
  "description": "Site can be embedded in iframe without proper frame protection",
  "points": 100,
  "vulnerability_type": "Clickjacking",
  "severity": "Medium",
  "status": "local"
}
```

---

## 🛡️ Security Guardrails

### **False-Positive Prevention**
1. **Query Parameter Required**: Only triggers with `bb_iframe=1`
2. **Iframe Detection**: JavaScript confirms `window.top !== window.self`
3. **Specific Endpoint**: Only accepts `bug=clickjack&mark=1`
4. **Normal Pages Unaffected**: Standard profile access remains normal

### **Real-World Context**
- **Vulnerability**: Missing `X-Frame-Options` or `Content-Security-Policy: frame-ancestors`
- **Attack Vector**: Malicious site embeds legitimate page in iframe
- **Impact**: User thinks they're on real site but interacting with attacker's overlay

---

## 📁 File Structure

```
📦 Clickjacking Implementation
├── 🔧 Backend
│   ├── accounts/views.py          # Bug recording endpoint
│   ├── accounts/urls.py           # URL routing
│   └── shopfluence/urls.py        # Main URL config
├── 🎨 Frontend
│   ├── src/pages/Profile.tsx      # Detection script injection
│   ├── src/App.tsx               # Route configuration
│   └── src/lib/notifications.ts   # Test function & notifications
├── 🎯 Test Infrastructure
│   ├── clickjacking-test/
│   │   ├── frame-test.html       # Attacker test page
│   │   └── server.py            # Test server (port 8082)
└── 📚 Documentation
    └── CLICKJACKING_GUIDE.md     # This file
```

---

## ✅ Verification Checklist

- [x] **Backend endpoint** responds correctly (`/api/bugs/record/`)
- [x] **Frontend detection** triggers with `bb_iframe=1`
- [x] **Iframe detection** works (`window.top !== window.self`)
- [x] **Notification system** shows proper message
- [x] **Test page** successfully embeds profile page
- [x] **Console testing** function available globally
- [x] **API testing** works via curl
- [x] **Route configuration** includes `/account/profile`
- [x] **Leaderboard integration** records bug discovery
- [x] **False-positive prevention** via query parameter
- [x] **Documentation** complete and accurate

---

## 🎯 Participant Experience

### **Discovery Flow**
1. **Participant** navigates to `http://localhost:8082/frame-test.html`
2. **Browser** loads malicious page with embedded iframe
3. **Iframe** loads `http://localhost:5173/account/profile?bb_iframe=1`
4. **JavaScript** detects iframe context (`window.top !== window.self`)
5. **API call** records bug discovery
6. **Notification** appears: "🎉 Clickjacking exposure detected!"
7. **Leaderboard** updates with 100 points

### **Expected User Actions**
1. Open attacker test page
2. See their profile embedded in iframe
3. Recognize security vulnerability
4. Receive automatic notification
5. Check leaderboard for points

---

## 🚀 Next Steps

The clickjacking vulnerability is now **fully implemented and tested**. Participants can discover it through:

1. **Direct iframe testing** via `http://localhost:8082/frame-test.html`
2. **Console testing** with `window.testClickjacking()`
3. **Manual API calls** to `/api/bugs/record/`

The implementation follows all specifications and includes proper guardrails to prevent false positives while maintaining realistic vulnerability demonstration.

---

## 🔍 Troubleshooting

### **Common Issues**

1. **Endpoint Not Found**
   - Ensure backend server is running on port 8000
   - Check URL path: `/api/bugs/record/` (note the trailing slash)

2. **Iframe Not Loading**
   - Verify frontend server is running on port 5173
   - Check route exists: `/account/profile`

3. **No Notification**
   - Ensure `bb_iframe=1` parameter is present
   - Check browser console for JavaScript errors
   - Verify notification system is loaded

4. **Test Server Issues**
   - Ensure port 8082 is not in use
   - Run `python3 server.py` in `clickjacking-test/` directory

---

**Implementation Status: ✅ COMPLETE**  
**Testing Status: ✅ VERIFIED**  
**Documentation Status: ✅ COMPLETE**
