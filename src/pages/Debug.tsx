import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';

const DebugPage: React.FC = () => {
  const { state: authState, login, register } = useAuth();
  const { state: cartState, addItem, refreshCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any>(null);
  const [debugOutput, setDebugOutput] = useState<string[]>([]);

  const addDebugLog = (message: string) => {
    setDebugOutput(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshCart();
      loadWishlist();
    }
  }, [authState.isAuthenticated]);

  const loadProducts = async () => {
    try {
      const response = await api.products.list();
      if (response.ok) {
        const data = await response.json();
        setProducts(data.results || []);
        addDebugLog(`Loaded ${data.results?.length || 0} products`);
      } else {
        addDebugLog('Failed to load products');
      }
    } catch (error) {
      addDebugLog(`Error loading products: ${error}`);
    }
  };

  const loadWishlist = async () => {
    try {
      const response = await api.wishlist.get();
      if (response.ok) {
        const data = await response.json();
        setWishlist(data);
        addDebugLog(`Loaded wishlist with ${data.items?.length || 0} items`);
      } else {
        addDebugLog('Failed to load wishlist');
      }
    } catch (error) {
      addDebugLog(`Error loading wishlist: ${error}`);
    }
  };

  const testLogin = async () => {
    try {
      const success = await login('test@example.com', 'testpass123');
      addDebugLog(`Login ${success ? 'successful' : 'failed'}`);
    } catch (error) {
      addDebugLog(`Login error: ${error}`);
    }
  };

  const testRegister = async () => {
    try {
      const success = await register(
        'debug@test.com',
        'debuguser',
        'testpass123',
        'testpass123',
        'Debug',
        'User'
      );
      addDebugLog(`Registration ${success ? 'successful' : 'failed'}`);
    } catch (error) {
      addDebugLog(`Registration error: ${error}`);
    }
  };

  const testAddToCart = async () => {
    if (products.length > 0) {
      try {
        await addItem(products[0], 1);
        addDebugLog(`Added ${products[0].name} to cart`);
      } catch (error) {
        addDebugLog(`Error adding to cart: ${error}`);
      }
    }
  };

  const testAddToWishlist = async () => {
    if (products.length > 0) {
      try {
        const response = await api.wishlist.add({ product_id: products[0].id });
        if (response.ok) {
          addDebugLog(`Added ${products[0].name} to wishlist`);
          loadWishlist();
        } else {
          addDebugLog('Failed to add to wishlist');
        }
      } catch (error) {
        addDebugLog(`Error adding to wishlist: ${error}`);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Debug & Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Auth Status */}
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Authenticated: {authState.isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Loading: {authState.isLoading ? 'Yes' : 'No'}</p>
            <p>User: {authState.user?.email || 'None'}</p>
            <p>Error: {authState.error || 'None'}</p>
            <div className="mt-4 space-y-2">
              <Button onClick={testLogin} size="sm">Test Login</Button>
              <Button onClick={testRegister} size="sm" variant="outline">Test Register</Button>
            </div>
          </CardContent>
        </Card>

        {/* Cart Status */}
        <Card>
          <CardHeader>
            <CardTitle>Cart Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Items: {cartState.totalItems}</p>
            <p>Total: ${cartState.totalPrice}</p>
            <p>Loading: {cartState.isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {cartState.error || 'None'}</p>
            <div className="mt-4">
              <Button onClick={testAddToCart} size="sm">Add to Cart</Button>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Status */}
        <Card>
          <CardHeader>
            <CardTitle>Wishlist Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Items: {wishlist?.total_items || 0}</p>
            <div className="mt-4">
              <Button onClick={testAddToWishlist} size="sm">Add to Wishlist</Button>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Products ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="border p-4 rounded">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-gray-600">${product.price}</p>
                  <p className="text-xs text-gray-500">{product.brand.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Debug Output */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Debug Output</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded max-h-64 overflow-y-auto">
              {debugOutput.map((log, index) => (
                <div key={index} className="text-sm font-mono">{log}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;
