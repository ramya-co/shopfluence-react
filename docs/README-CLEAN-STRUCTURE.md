# 🛒🏆 Shopfluence Bug Bounty Platform - Clean Structure

## 📁 **Project Structure**

```
shopfluence-react-main copy/
├── 🛒 ecommerce/
│   ├── frontend/              # React E-commerce Application
│   │   ├── src/
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.js
│   │   └── ... (all frontend files)
│   └── backend/               # Django E-commerce API
│       ├── manage.py
│       ├── shopfluence/
│       ├── products/
│       ├── accounts/
│       └── ... (all backend files)
├── 🏆 leaderboard/
│   ├── frontend/              # React Leaderboard Application
│   └── backend/               # Django Leaderboard API
├── 📚 docs/                   # Documentation & Testing
│   ├── README.md
│   ├── test_bug_notifications.html
│   └── ... (all documentation)
├── 🚀 start-clean-structure.sh # Unified startup script
└── 📦 package.json           # Workspace manager
```

## 🚀 **Quick Start**

### **One-Command Startup:**
```bash
./start-clean-structure.sh
```

### **Individual Service Commands:**
```bash
# E-commerce only
cd ecommerce/frontend && npm run dev
cd ecommerce/backend && python manage.py runserver 8000

# Leaderboard only  
cd leaderboard/frontend/pycon-leaderboard-main && npm start
cd leaderboard/backend && python manage.py runserver 8002
```

## 🌐 **Application URLs**

| Service | URL | Description |
|---------|-----|-------------|
| 🛒 **E-commerce Shop** | http://localhost:8081 | Main shopping application |
| 📈 **Leaderboard** | http://localhost:5173 | Bug bounty leaderboard |
| 🧪 **Bug Testing** | http://localhost:8081/docs/test_bug_notifications.html | Testing interface |
| 📊 **E-commerce API** | http://localhost:8000/api/ | Django REST API |
| 🏆 **Leaderboard API** | http://localhost:8002/api/ | Leaderboard API |

## 🔒 **Security Testing Features**

### **11 Bug Types Implemented:**

| Bug Type | Points | Testing Method |
|----------|--------|----------------|
| 🔐 **IDOR Profile** | 85 | `window.testBugEndpoint()` |
| 🔑 **JWT Secret Exposure** | 90 | Automatic detection |
| 💉 **SQL Injection** | 95 | Automatic detection |
| 👥 **User Enumeration** | 75 | Automatic detection |
| ⚡ **Race Condition** | 80 | Rapid clicking |
| 🗄️ **LocalStorage Manipulation** | 70 | `window.testLocalStorageManipulation()` |
| 🔓 **JWT Secret LocalStorage** | 85 | Automatic detection |
| 🌐 **CORS Misconfiguration** | 65 | `window.testCORSConfiguration()` |
| 🔢 **Integer Overflow** | 75 | `window.testIntegerOverflow()` |
| 🚀 **Rate Limiting Bypass** | 70 | `window.testRateLimiting()` |
| 💰 **Price Manipulation** | 80 | DevTools HTML editing |

### **DevTools Testing Commands:**
```javascript
// Open browser DevTools console and run:

// Test individual bugs
window.testIntegerOverflow()        // Integer overflow detection
window.testRateLimiting()          // Rate limiting bypass
window.testCORSConfiguration()     // CORS misconfiguration
window.testLocalStorageManipulation() // LocalStorage tampering

// Test multiple bugs
window.testQuantityAndRateLimit()  // Integer overflow + Rate limiting
window.runAllTests()               // All automated tests

// Manual testing
// 1. Price Manipulation: Add data-price="0.01" to cart button in DevTools
// 2. Race Condition: Click "Add to Cart" rapidly 10+ times
```

## 🛠️ **Development Workflow**

### **Installation:**
```bash
# Install all dependencies
npm install                    # Root workspace
cd ecommerce/frontend && npm install
cd ../../leaderboard/frontend/pycon-leaderboard-main && npm install

# Or use workspace command
npm run install:all
```

### **Development Scripts:**
```bash
# Start all services
npm run dev:all
./start-clean-structure.sh

# Start individual services
npm run dev:ecommerce          # E-commerce frontend
npm run dev:leaderboard        # Leaderboard frontend
npm run dev:ecommerce-backend  # E-commerce backend
npm run dev:leaderboard-backend # Leaderboard backend
```

### **Cleanup:**
```bash
npm run clean                  # Remove all node_modules
```

## 🎯 **Bug Testing Workflow**

### **Step 1: Setup**
1. Start all services: `./start-clean-structure.sh`
2. Open e-commerce: http://localhost:8081
3. Register/Login to get access token

### **Step 2: Automated Testing**
```javascript
// Open DevTools console (F12)
window.runAllTests()           // Test all bugs automatically
```

### **Step 3: Manual Testing**
1. **Price Manipulation**: 
   - Inspect "Add to Cart" button
   - Add attribute: `data-price="0.01"`
   - Click button → Bug detected!

2. **Race Condition**:
   - Click "Add to Cart" rapidly 10+ times
   - Bug detection triggers

### **Step 4: Verify Results**
- ✅ UI notifications appear (top-right)
- ✅ Console logs show bug detection
- ✅ Leaderboard updates with points
- ✅ Visit http://localhost:5173 to see scores

## 📊 **Project Benefits**

### **Clean Architecture:**
- ✅ **Separation of Concerns**: Each service in its own directory
- ✅ **Scalable Structure**: Easy to add new services
- ✅ **Professional Layout**: Industry-standard organization
- ✅ **Clear Dependencies**: No mixing of frontend/backend files

### **Developer Experience:**
- ✅ **Unified Startup**: One command starts everything
- ✅ **Workspace Management**: NPM workspaces for dependency management
- ✅ **Clear Documentation**: Each service well-documented
- ✅ **Easy Testing**: Comprehensive testing interface

### **Security Testing:**
- ✅ **11 Bug Types**: Comprehensive vulnerability coverage
- ✅ **Automated Testing**: DevTools console commands
- ✅ **Real-time Feedback**: Immediate notifications and scoring
- ✅ **Educational Value**: Learn about security vulnerabilities

## 🔧 **Configuration Files**

### **Root Package.json** (Workspace Manager)
```json
{
  "workspaces": [
    "ecommerce/frontend",
    "leaderboard/frontend/pycon-leaderboard-main"
  ],
  "scripts": {
    "dev:all": "concurrently ...",
    "install:all": "...",
    "clean": "..."
  }
}
```

### **Vite Config** (ecommerce/frontend/vite.config.js)
```javascript
export default defineConfig({
  server: { port: 8081 },
  resolve: { alias: { '@': './src' } },
  proxy: { '/api': 'http://localhost:8000' }
})
```

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Port Already in Use**:
   ```bash
   lsof -ti:8000 | xargs kill -9  # Kill process on port 8000
   lsof -ti:8081 | xargs kill -9  # Kill process on port 8081
   ```

2. **Dependencies Missing**:
   ```bash
   npm run install:all
   ```

3. **Vite Config Error**:
   - Check if `@vitejs/plugin-react-swc` is installed
   - Verify import statement matches dependency

4. **API Connection Issues**:
   - Ensure backend is running on port 8000
   - Check proxy configuration in vite.config.js

### **Reset Everything:**
```bash
npm run clean                  # Remove node_modules
npm run install:all           # Reinstall dependencies
./start-clean-structure.sh    # Start all services
```

## 📋 **Next Steps**

1. **Test the Platform**: `./start-clean-structure.sh`
2. **Run Bug Tests**: Open DevTools → `window.runAllTests()`
3. **Customize**: Modify individual services as needed
4. **Deploy**: Each service can be deployed independently

## 🎉 **Success Metrics**

✅ **Clean Structure Achieved**:
- Separated frontend and backend cleanly
- Professional directory organization
- No file mixing or confusion

✅ **All Features Working**:
- E-commerce application functional
- Leaderboard integration working
- All 11 bug types detectable
- DevTools testing commands operational

✅ **Developer Experience Improved**:
- One-command startup
- Clear documentation
- Easy maintenance
- Scalable architecture

**🚀 Your clean, professional bug bounty platform is ready to use!**
