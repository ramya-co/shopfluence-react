import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { showBugNotification } from '../lib/notifications';


// 🚨 BUG 11: Race Condition Detection - 5 second window
let addToCartClickCount = 0;
let lastClickTime = 0;

export interface CartItem {
  id: number;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    brand: string;
    is_in_stock: boolean;
  };
  quantity: number;
  total_price: number;
  is_available: boolean;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

interface CartContextType {
  state: CartState;
  addItem: (product: any, quantity?: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CartState>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isLoading: false,
    error: null,
  });

  // Load cart on mount and when auth state changes
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setState({
        items: [],
        totalItems: 0,
        totalPrice: 0,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  // Listen for storage changes (login/logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        if (e.newValue) {
          // User logged in
          refreshCart();
        } else {
          // User logged out
          setState({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
            error: null,
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.cart.get();

      if (response.ok) {
        const data = await response.json();
        setState({
          items: data.items || [],
          totalItems: data.total_items || 0,
          totalPrice: data.total_price || 0,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to load cart' 
      }));
    }
  };

  

  const addItem = async (product: any, quantity: number = 1) => {
    // 🚨 BUG 11: Race Condition Detection - More reasonable 5-second window
    const currentTime = Date.now();
    
    // Reset counter if more than 5 seconds have passed since last click
    if (currentTime - lastClickTime > 5000) {
      addToCartClickCount = 0;
    }
    
    addToCartClickCount++;
    lastClickTime = currentTime;

    // Trigger bug if 10+ clicks within 5 seconds
    if (addToCartClickCount >= 10) {
      // Show bug found notification using the notification utility
      const bugData = {
        bug_found: 'RACE_CONDITION',
        message: '🎉 Bug Found: Race Condition in Cart!',
        description: 'Race condition detected - too many rapid cart additions',
        points: 80
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
      
      // Reset counter after showing notification
      addToCartClickCount = 0;
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      setState(prev => ({ 
        ...prev, 
        error: 'Please sign in to add items to cart' 
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.cart.add({
        product_id: product.id,
        quantity: quantity,
      });

      if (response.ok) {
        await refreshCart();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to add item to cart' 
      }));
    }
  };

  const removeItem = async (itemId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.cart.removeItem(itemId);

      if (response.ok) {
        await refreshCart();
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to remove item from cart' 
      }));
    }
  };

  

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.cart.updateItem(itemId, { quantity });

      if (response.ok) {
        await refreshCart();
      } else {
        throw new Error('Failed to update item quantity');
      }
    } catch (error) {
      console.error('Error updating item quantity:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to update item quantity' 
      }));
    }
  };

  const clearCart = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await api.cart.clear();

      if (response.ok) {
        setState({
          items: [],
          totalItems: 0,
          totalPrice: 0,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Failed to clear cart');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to clear cart' 
      }));
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
    clearError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to refresh cart after login (can be called from login components)
export const refreshCartAfterLogin = () => {
  // Trigger a storage event to refresh cart in all contexts
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'access_token',
    newValue: localStorage.getItem('access_token'),
  }));
};