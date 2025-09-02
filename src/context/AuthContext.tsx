import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { checkAndShowBugNotification } from '@/lib/notifications';
import { updateLeaderboardUser } from '@/lib/notifications';
import { leaderboardService } from '@/lib/leaderboard';

// 🚨 BUG 23: Local Storage Manipulation Detection
let originalToken: string | null = null;

// 🚨 BUG 24: JWT Secret in LocalStorage Detection
let originalGetItem: typeof Storage.prototype.getItem | null = null;
let secretDetectionSetup = false;

export interface User {
  id: string;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  phone_number?: string;
  date_of_birth?: string;
  is_verified: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string, passwordConfirm: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // 🚨 BUG 24: Setup JWT Secret Detection
  const setupJWTSecretDetection = () => {
    if (secretDetectionSetup || typeof window === 'undefined') return;
    
    // Store the original getItem method
    originalGetItem = localStorage.getItem;
    
    // Override localStorage.getItem to detect access to sensitive keys
    localStorage.getItem = function(key: string) {
      const result = originalGetItem!.call(this, key);
      
      // Check if accessing sensitive JWT secrets
      if (key === 'jwt_secret' || key === 'admin_master_token' || key === 'signing_key') {
        // Delay notification slightly to ensure it's intentional access
        setTimeout(() => {
          const bugData = {
            bug_found: 'JWT_SECRET_LOCALSTORAGE',
            message: '🎉 Bug Found: JWT Secret in LocalStorage!',
            description: `Sensitive JWT secret "${key}" exposed in browser storage`,
            points: 85
          };
          
          // Use the global notification system
          if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
            (window as any).checkAndShowBugNotification(bugData);
          } else {
            // Fallback notification
            const notification = document.createElement('div');
            notification.style.cssText = `
              position: fixed; top: 20px; right: 20px; z-index: 10000;
              background: linear-gradient(135deg, #4CAF50, #45a049);
              color: white; padding: 20px; border-radius: 10px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.3);
              max-width: 300px; font-family: Arial, sans-serif;
              animation: slideIn 0.3s ease-out;
            `;
            notification.innerHTML = `
              <h3 style="margin: 0 0 10px 0;">${bugData.message}</h3>
              <p style="font-weight: bold;">${bugData.bug_found}</p>
              <p>${bugData.description}</p>
              <small>Points: ${bugData.points}</small>
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
          }
        }, 100); // Small delay to ensure it's intentional access
      }
      
      return result;
    };
    
    secretDetectionSetup = true;
  };

  // 🚨 BUG 24: Store JWT secrets immediately on app load (for testing purposes)
  const storeJWTSecrets = () => {
    localStorage.setItem('jwt_secret', 'super-secret-signing-key-12345');
    localStorage.setItem('admin_master_token', 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhZG1pbiI6dHJ1ZSwidXNlcl9pZCI6MSwiaWF0IjoxNzM1NzM0NDAwfQ.vulnerable-secret-key');
    localStorage.setItem('signing_key', 'HMAC-SHA256-SECRET-KEY-EXPOSED');
    
    // Setup detection immediately
    setupJWTSecretDetection();
  };

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
    
    // 🚨 BUG 24: Store JWT secrets immediately when component mounts
    storeJWTSecrets();
    
    // 🚨 BUG 23: Local Storage Manipulation Detection
    const detectManipulation = () => {
      const currentToken = localStorage.getItem('access_token');
      if (originalToken && currentToken && currentToken !== originalToken) {
        // Token manipulation detected - use proper notification system
        const bugData = {
          bug_found: 'LOCALSTORAGE_MANIPULATION',
          message: '🎉 Bug Found: Local Storage Manipulation!',
          description: 'Local storage token manipulation detected!',
          points: 70
        };
        
        // Use the global notification system for consistency
        if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
          (window as any).checkAndShowBugNotification(bugData);
        } else {
          // Fallback notification (should not happen if system is loaded)
          const notification = document.createElement('div');
          notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white; padding: 20px; border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            max-width: 300px; font-family: Arial, sans-serif;
          `;
          notification.innerHTML = `
            <h3 style="margin: 0 0 10px 0;">${bugData.message}</h3>
            <p><strong>${bugData.bug_found}</strong></p>
            <p>${bugData.description}</p>
            <small>Points: ${bugData.points}</small>
          `;
          document.body.appendChild(notification);
          setTimeout(() => notification.remove(), 5000);
        }
        
        // Reset the original token to prevent repeated notifications
        originalToken = currentToken;
      }
    };
    
    // Check for manipulation every 2 seconds
    const interval = setInterval(detectManipulation, 2000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array to run only once

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        await refreshUser();
      } catch (error) {
        // Token is invalid, clear it
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.auth.userInfo();

      if (response.ok) {
        const userData = await response.json();
        
        // Store user data for leaderboard access
        sessionStorage.setItem('current_user_data', JSON.stringify(userData));
        
        setState({
          user: userData,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
      } else {
        throw new Error('Failed to refresh user');
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.auth.login({ email, password });
      const data = await response.json();

      // 🚨 Check for bug detection in response
      if (checkAndShowBugNotification(data)) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (response.ok) {
        // Handle different response structures
        const accessToken = data.access || data.tokens?.access || data.token;
        const refreshToken = data.refresh || data.tokens?.refresh;
        
        if (accessToken) {
          // Store tokens
          localStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          
          // 🚨 BUG 23: Store original token for manipulation detection
          originalToken = accessToken;
          
          // 🚨 BUG 24: Store vulnerable JWT secrets in localStorage
          storeJWTSecrets();
          
          // Update state
          setState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          
          // Store user data for leaderboard access
          sessionStorage.setItem('current_user_data', JSON.stringify(data.user));
          
          // Update leaderboard user info
          updateLeaderboardUser();
          
          // Register user with leaderboard
          if (data.user) {
            leaderboardService.registerUser({
              user_id: data.user.id || data.user.email,
              display_name: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim() || data.user.username || data.user.email,
              email: data.user.email
            }).catch(err => {
              console.warn('Leaderboard registration failed, but login succeeded:', err);
            });
          }
          
          return true;
        }
      }
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: data.error || 'Login failed' 
      }));
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      }));
      return false;
    }
  };

  const register = async (
    email: string, 
    username: string, 
    password: string, 
    passwordConfirm: string, 
    firstName: string, 
    lastName: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.auth.register({ 
        email, 
        username, 
        password, 
        password_confirm: passwordConfirm, 
        first_name: firstName, 
        last_name: lastName 
      });

      const data = await response.json();

      // 🚨 Check for bug detection in response
      if (checkAndShowBugNotification(data)) {
        setState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      if (response.ok) {
        // Handle different response structures
        const accessToken = data.access || data.tokens?.access || data.token;
        const refreshToken = data.refresh || data.tokens?.refresh;
        
        if (accessToken) {
          // Store tokens
          localStorage.setItem('access_token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          
          // 🚨 BUG 23: Store original token for manipulation detection
          originalToken = accessToken;
          
          // 🚨 BUG 24: Store vulnerable JWT secrets in localStorage
          storeJWTSecrets();
          
          // Update state
          setState({
            user: data.user,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });
          
          // Store user data for leaderboard access
          sessionStorage.setItem('current_user_data', JSON.stringify(data.user));
          
          // Update leaderboard user info
          updateLeaderboardUser();
          
          // Register user with leaderboard
          if (data.user) {
            leaderboardService.registerUser({
              user_id: data.user.id || data.user.email,
              display_name: `${firstName} ${lastName}`.trim() || username || email,
              email: email
            }).catch(err => {
              console.warn('Leaderboard registration failed, but registration succeeded:', err);
            });
          }
          
          return true;
        }
      }
      
      // Handle validation errors
      let errorMessage = 'Registration failed';
      if (data.email) errorMessage = data.email[0];
      else if (data.username) errorMessage = data.username[0];
      else if (data.password) errorMessage = data.password[0];
      else if (data.password_confirm) errorMessage = data.password_confirm[0];
      else if (data.first_name) errorMessage = data.first_name[0];
      else if (data.last_name) errorMessage = data.last_name[0];
      else if (data.non_field_errors) errorMessage = data.non_field_errors[0];
      
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage 
      }));
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Network error. Please try again.' 
      }));
      return false;
    }
  };

  const logout = () => {
    // Clear tokens and secrets
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('jwt_secret');
    localStorage.removeItem('admin_master_token');
    localStorage.removeItem('signing_key');
    
    // Clear user data and leaderboard cache
    sessionStorage.removeItem('current_user_data');
    sessionStorage.removeItem('user_display_name');
    sessionStorage.removeItem('bug_hunter_name');
    sessionStorage.removeItem('session_user_id');
    
    // Restore original localStorage.getItem
    if (originalGetItem) {
      localStorage.getItem = originalGetItem;
      secretDetectionSetup = false;
    }
    
    // Clear original token reference
    originalToken = null;
    
    // Update state
    setState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
    });
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};