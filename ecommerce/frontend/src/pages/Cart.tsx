import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, Tag, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/context/CartContext';
import { useCoupon } from '@/context/CouponContext';

const Cart: React.FC = () => {
  const { state, updateQuantity, removeItem } = useCart();
  const { appliedCoupon, applyCoupon, removeCoupon, calculateFinalTotal, calculateDiscount } = useCoupon();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate subtotal correctly from items
  const calculateSubtotal = () => {
    return state.items.reduce((total, item) => {
      const itemPrice = typeof item.product.price === 'number' ? item.product.price : 0;
      return total + (itemPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalItems = typeof state.totalItems === 'number' ? state.totalItems : state.items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsApplying(true);
    try {
      const success = await applyCoupon(couponCode, subtotal);
      if (success) {
        setCouponCode('');
        
        // Determine if this was a bug or normal application
        const code = couponCode.toUpperCase();
        const isBuggyApplication = 
          (code === 'EXPIRED2025') || 
          (code === 'DISCOUNT10' && subtotal < 100);
        
        if (isBuggyApplication) {
          setSuccessMessage('Coupon applied! (Bug detected - check notifications)');
        } else {
          setSuccessMessage('Coupon applied successfully');
        }
        
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } finally {
      setIsApplying(false);
    }
  };

  const handleCheckout = () => {
    // Simple order placement confirmation
    alert('Order placed. Thank you!');
  };

  const discountAmount = calculateDiscount(subtotal);
  const finalTotal = calculateFinalTotal(subtotal);

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
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            {/* Coupon Application Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Apply Coupon
              </h4>
              
              {appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">
                        {appliedCoupon.code}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={removeCoupon}
                      className="text-green-700 hover:text-green-900"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleApplyCoupon}
                      disabled={isApplying || !couponCode.trim()}
                      size="sm"
                    >
                      {isApplying ? 'Applying...' : 'Apply'}
                    </Button>
                  </div>
                  
                  {showSuccess && (
                    <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                      ✅ {successMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Final Total */}
            <div className="border-t pt-2 mt-4">
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <Button 
            className="w-full bg-primary hover:bg-primary-hover"
            onClick={handleCheckout}
            disabled={state.items.length === 0}
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;