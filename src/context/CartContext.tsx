import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

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

  // Load cart on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      refreshCart();
    }
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