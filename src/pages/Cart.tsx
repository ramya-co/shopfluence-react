import React from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeItem } = useCart();

  // Ensure totalPrice is a number and handle potential undefined values
  const totalPrice = typeof state.totalPrice === 'number' ? state.totalPrice : 0;
  const totalItems = typeof state.totalItems === 'number' ? state.totalItems : 0;

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {state.items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 border-b">
              <img 
                src={item.product.image} 
                alt={item.product.name} 
                className="w-20 h-20 object-cover rounded" 
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.name}</h3>
                <p className="text-muted-foreground">
                  ${typeof item.product.price === 'number' ? item.product.price.toFixed(2) : '0.00'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-3">{item.quantity}</span>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-muted/30 p-6 rounded-lg h-fit">
          <h3 className="font-bold mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} items)</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
          <Button className="w-full bg-primary hover:bg-primary-hover">
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;