import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

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

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
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

      if (response.ok) {
        // Store tokens
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        
        // Update state
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        
        return true;
      } else {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: data.error || 'Login failed' 
        }));
        return false;
      }
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

      if (response.ok) {
        // Store tokens
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        
        // Update state
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
          error: null,
        });
        
        return true;
      } else {
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
      }
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
    // Clear tokens
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    
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