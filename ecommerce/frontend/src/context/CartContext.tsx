import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { showBugNotification } from '../lib/notifications';


// 🚨 BUG 11: Race Condition Detection - 5 second window
let addToCartClickCount = 0;
let lastClickTime = 0;

// 🚨 BUG 14: First-time Cart Quantity Mismatch
const FIRST_ADD_CART_KEY = 'first_add_cart_bug_triggered';
const CART_BUG_DISCOVERED_KEY = 'cart_quantity_bug_discovered';

// Helper function to get user-specific storage key
const getUserSpecificKey = (baseKey: string): string => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload.user_id || payload.sub || 'anonymous';
      return `${baseKey}_${userId}`;
    } catch (e) {
      // Token decode failed, use fallback
    }
  }
  // Fallback for anonymous or invalid token
  return `${baseKey}_anonymous`;
};

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
  addItem: (product: any, quantity?: number, clickEvent?: MouseEvent) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  clearError: () => void;
  // 🚨 BUG 14: Utility functions for cart quantity bug
  resetCartQuantityBug: () => void;
  isCartQuantityBugActive: () => boolean;
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

  

  const addItem = async (product: any, quantity: number = 1, clickEvent?: MouseEvent) => {
    // 🚨 BUG 13: Price Manipulation Detection
    if (clickEvent && clickEvent.target instanceof HTMLElement) {
      // Look for price elements near the button
      const button = clickEvent.target as HTMLElement;
      const addToCartButton = button.closest('[data-testid="add-to-cart"], button') as HTMLElement;
      
      if (addToCartButton) {
        // Check for manipulated data-price attribute
        const manipulatedPrice = addToCartButton.getAttribute('data-price');
        if (manipulatedPrice !== null) {
          const priceValue = parseFloat(manipulatedPrice);
          if (!isNaN(priceValue) && Math.abs(priceValue - product.price) > 0.01) {
            // Price manipulation detected
            const bugData = {
              bug_found: 'PRICE_MANIPULATION',
              message: 'Bug Found: Price Manipulation!',
              description: `Original price: $${product.price}, Manipulated price: $${priceValue}`,
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
            return; // Don't add to cart with manipulated price
          }
        }
        
        // Also check for manipulated price in nearby price display elements
        const priceElements = addToCartButton.closest('.product, .card, [data-product-id]')?.querySelectorAll('[data-price], .price, .product-price');
        if (priceElements) {
          priceElements.forEach((priceEl) => {
            const manipulatedPrice = priceEl.getAttribute('data-price') || priceEl.textContent?.replace(/[^0-9.]/g, '');
            if (manipulatedPrice) {
              const priceValue = parseFloat(manipulatedPrice);
              if (!isNaN(priceValue) && Math.abs(priceValue - product.price) > 0.01) {
                const bugData = {
                  bug_found: 'PRICE_MANIPULATION',
                  message: 'Bug Found: Price Manipulation!',
                  description: `Original price: $${product.price}, Manipulated display price: $${priceValue}`,
                  points: 85
                };
                
                if (typeof window !== 'undefined' && (window as any).checkAndShowBugNotification) {
                  (window as any).checkAndShowBugNotification(bugData);
                } else {
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
                return; // Don't add to cart with manipulated price
              }
            }
          });
        }
      }
    }
    
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
        message: 'Bug Found: Race Condition in Cart!',
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
    
    // 🚨 BUG 14: First-time Cart Quantity Mismatch Logic
    const userFirstAddKey = getUserSpecificKey(FIRST_ADD_CART_KEY);
    const userBugDiscoveredKey = getUserSpecificKey(CART_BUG_DISCOVERED_KEY);
    
    const hasTriggeredFirstAdd = localStorage.getItem(userFirstAddKey) === 'true';
    const hasBugBeenDiscovered = localStorage.getItem(userBugDiscoveredKey) === 'true';
    
    let actualQuantity = quantity;
    
    // Only trigger the bug if it's the user's first add and bug hasn't been discovered yet
    if (!hasTriggeredFirstAdd && !hasBugBeenDiscovered) {
      actualQuantity = quantity + 1; // Add one extra (the bug)
      localStorage.setItem(userFirstAddKey, 'true');
    }
    
    try {
      const response = await api.cart.add({
        product_id: product.id,
        quantity: actualQuantity, // Use the potentially modified quantity
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

    // 🚨 BUG 14: Detect Cart Quantity Mismatch Bug Discovery
    const userFirstAddKey = getUserSpecificKey(FIRST_ADD_CART_KEY);
    const userBugDiscoveredKey = getUserSpecificKey(CART_BUG_DISCOVERED_KEY);
    
    const hasTriggeredFirstAdd = localStorage.getItem(userFirstAddKey) === 'true';
    const hasBugBeenDiscovered = localStorage.getItem(userBugDiscoveredKey) === 'true';
    
    // Find the current item to check if quantity is being decreased
    const currentItem = state.items.find(item => item.id === itemId);
    const isDecreasingQuantity = currentItem && quantity < currentItem.quantity;
    
    // Trigger bug discovery if: user had first-add bug AND is decreasing quantity AND bug not yet discovered
    if (hasTriggeredFirstAdd && !hasBugBeenDiscovered && isDecreasingQuantity) {
      // Mark bug as discovered
      localStorage.setItem(userBugDiscoveredKey, 'true');
      
      // Trigger bug notification
      const bugData = {
        bug_found: 'CART_QUANTITY_MISMATCH',
        message: '🎉 Business Logic Flaw – Cart Quantity Mismatch Detected!',
        description: 'Cart quantity manipulation discovered when adjusting item quantity',
        points: 75,
        vulnerability_type: 'Business Logic Flaw',
        severity: 'Medium',
        item_id: itemId,
        original_quantity: currentItem.quantity,
        new_quantity: quantity
      };

      // Show notification and update leaderboard
      if (typeof window !== 'undefined') {
        // Use async import to avoid circular dependencies
        import('@/lib/notifications').then(notifications => {
          notifications.showBugNotification(bugData);
          notifications.notifyLeaderboard(bugData);
        }).catch(console.error);
      }
    }

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

  // 🚨 BUG 14: Utility functions for cart quantity bug management
  const resetCartQuantityBug = () => {
    const userFirstAddKey = getUserSpecificKey(FIRST_ADD_CART_KEY);
    const userBugDiscoveredKey = getUserSpecificKey(CART_BUG_DISCOVERED_KEY);
    localStorage.removeItem(userFirstAddKey);
    localStorage.removeItem(userBugDiscoveredKey);
  };

  const isCartQuantityBugActive = (): boolean => {
    const userFirstAddKey = getUserSpecificKey(FIRST_ADD_CART_KEY);
    const userBugDiscoveredKey = getUserSpecificKey(CART_BUG_DISCOVERED_KEY);
    const hasTriggeredFirstAdd = localStorage.getItem(userFirstAddKey) === 'true';
    const hasBugBeenDiscovered = localStorage.getItem(userBugDiscoveredKey) === 'true';
    return hasTriggeredFirstAdd && !hasBugBeenDiscovered;
  };

  const value = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
    clearError,
    resetCartQuantityBug,
    isCartQuantityBugActive,
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