// Bug notification utility
export interface BugNotification {
  bug_found: string;
  message: string;
  description: string;
  points: number;
}

// Utility functions for user identification and leaderboard integration
import { leaderboardService } from './leaderboard';

// Get user ID from authentication
const getUserId = (): string => {
  // Try to get user data from localStorage/session
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      // Try to decode token to get user ID
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.user_id) return payload.user_id.toString();
      if (payload.sub) return payload.sub.toString();
    } catch (e) {
      // If token decode fails, generate a fallback ID
    }
  }
  
  // Fallback: check for any stored user data
  const storedUserId = sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
  if (storedUserId) return storedUserId;
  
  // Last resort: generate a session-based ID
  let sessionId = sessionStorage.getItem('session_user_id');
  if (!sessionId) {
    sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('session_user_id', sessionId);
  }
  return sessionId;
};

// Get display name from authentication
const getDisplayName = (): string => {
  // Try to get from stored user data first
  const storedName = sessionStorage.getItem('user_display_name');
  if (storedName) return storedName;
  
  // Try to get from access token
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.name) return payload.name;
      if (payload.username) return payload.username;
      if (payload.email) return payload.email;
    } catch (e) {
      // Token decode failed
    }
  }
  
  // Fallback: prompt user or generate name
  let displayName = sessionStorage.getItem('bug_hunter_name');
  if (!displayName) {
    const promptName = prompt('🏆 Enter your display name for the leaderboard:');
    displayName = promptName || `BugHunter-${getUserId().slice(-8)}`;
    sessionStorage.setItem('bug_hunter_name', displayName);
    sessionStorage.setItem('user_display_name', displayName);
  }
  return displayName;
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

// Global fetch interceptor to catch all API responses and show bug notifications
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  
  // Make notification functions globally accessible
  (window as any).showBugNotification = showBugNotification;
  (window as any).checkAndShowBugNotification = checkAndShowBugNotification;
  (window as any).notifyLeaderboard = notifyLeaderboard;
  (window as any).getUserId = getUserId;
  (window as any).getDisplayName = getDisplayName;
  
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);
    
    // Only intercept localhost:8003 API calls
    const requestUrl = (typeof args[0] === 'string') ? args[0] : 
                      (args[0] instanceof Request) ? args[0].url : args[0].toString();
    if (requestUrl.includes('localhost:8003/api/')) {
      try {
        // Clone the response to read it without consuming it
        const responseClone = response.clone();
        const data = await responseClone.json();
        
        // Check for bug notifications
        checkAndShowBugNotification(data);
      } catch (error) {
        // Ignore JSON parsing errors (for non-JSON responses)
      }
    }
    
    return response;
  };
}
