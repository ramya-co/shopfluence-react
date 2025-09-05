import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Coupon interface
export interface Coupon {
  code: string;
  description: string;
  discountAmount: number;
  minimumSpend: number;
  validUntil: string;
  isExpired: boolean;
}

// Available coupons
export const AVAILABLE_COUPONS: Record<string, Coupon> = {
  EXPIRED2025: {
    code: 'EXPIRED2025',
    description: 'Expired coupon - should not work',
    discountAmount: 15,
    minimumSpend: 35,
    validUntil: '2025-06-30',
    isExpired: true,
  },
  DISCOUNT10: {
    code: 'DISCOUNT10',
    description: '$10 off orders over $100',
    discountAmount: 10,
    minimumSpend: 100,
    validUntil: '2025-12-31',
    isExpired: false,
  },
};

// Coupon state interface
interface CouponState {
  appliedCoupon: Coupon | null;
  couponCode: string;
  discountAmount: number;
  isApplying: boolean;
  error: string | null;
}

// Initial state
const initialState: CouponState = {
  appliedCoupon: null,
  couponCode: '',
  discountAmount: 0,
  isApplying: false,
  error: null,
};

// Action types
type CouponAction =
  | { type: 'SET_COUPON_CODE'; payload: string }
  | { type: 'APPLY_COUPON_START' }
  | { type: 'APPLY_COUPON_SUCCESS'; payload: { coupon: Coupon; discountAmount: number } }
  | { type: 'APPLY_COUPON_ERROR'; payload: string }
  | { type: 'REMOVE_COUPON' }
  | { type: 'RESET_ERROR' };

// Reducer
const couponReducer = (state: CouponState, action: CouponAction): CouponState => {
  switch (action.type) {
    case 'SET_COUPON_CODE':
      return { ...state, couponCode: action.payload, error: null };
    case 'APPLY_COUPON_START':
      return { ...state, isApplying: true, error: null };
    case 'APPLY_COUPON_SUCCESS':
      return {
        ...state,
        appliedCoupon: action.payload.coupon,
        discountAmount: action.payload.discountAmount,
        isApplying: false,
        error: null,
        couponCode: '',
      };
    case 'APPLY_COUPON_ERROR':
      return { ...state, isApplying: false, error: action.payload };
    case 'REMOVE_COUPON':
      return { ...state, appliedCoupon: null, discountAmount: 0, error: null };
    case 'RESET_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Context interface
interface CouponContextType {
  state: CouponState;
  appliedCoupon: Coupon | null;
  activeCoupons: Coupon[];
  setCouponCode: (code: string) => void;
  applyCoupon: (code: string, cartTotal: number) => Promise<boolean>;
  removeCoupon: () => void;
  resetError: () => void;
  calculateDiscount: (cartTotal: number) => number;
  calculateFinalTotal: (cartTotal: number) => number;
}

// Create context
const CouponContext = createContext<CouponContextType | undefined>(undefined);

// Provider component
export const CouponProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(couponReducer, initialState);

  const setCouponCode = (code: string) => {
    dispatch({ type: 'SET_COUPON_CODE', payload: code });
  };

  const applyCoupon = async (code: string, cartTotal: number): Promise<boolean> => {
    dispatch({ type: 'SET_COUPON_CODE', payload: code });
    dispatch({ type: 'APPLY_COUPON_START' });

    const couponCode = code.toUpperCase();
    const coupon = AVAILABLE_COUPONS[couponCode];

    if (!coupon) {
      dispatch({ type: 'APPLY_COUPON_ERROR', payload: 'Invalid coupon code' });
      return false;
    }

    // 🚨 BUG 1: Expired Coupon Works (EXPIRED2025)
    if (coupon.code === 'EXPIRED2025') {
      if (coupon.isExpired) {
        // This should not work, but it does - BUG!
        const discountAmount = coupon.discountAmount;
        
        dispatch({ 
          type: 'APPLY_COUPON_SUCCESS', 
          payload: { coupon, discountAmount } 
        });

        // Trigger bug notification
        const bugData = {
          bug_found: 'EXPIRED_COUPON_ACCEPTED',
          message: '🎉 Expired coupon accepted! Bug found: Business logic bypass',
          description: `Expired coupon ${coupon.code} was accepted and applied discount of $${discountAmount}`,
          points: 85,
          vulnerability_type: 'Business Logic Bypass',
          severity: 'Medium',
          coupon_code: coupon.code,
          discount_applied: discountAmount
        };

        // Show notification and update leaderboard
        if (typeof window !== 'undefined') {
          const notifications = await import('@/lib/notifications');
          notifications.showBugNotification(bugData);
          notifications.notifyLeaderboard(bugData);
        }

        return true;
      }
    }

    // 🚨 BUG 2: Discount Without Minimum Spend (DISCOUNT10)
    if (coupon.code === 'DISCOUNT10') {
      if (cartTotal < coupon.minimumSpend) {
        // This should not work, but it does - BUG!
        const discountAmount = coupon.discountAmount;
        
        dispatch({ 
          type: 'APPLY_COUPON_SUCCESS', 
          payload: { coupon, discountAmount } 
        });

        // Trigger bug notification
        const bugData = {
          bug_found: 'MINIMUM_SPEND_BYPASS',
          message: '🎉 Minimum spend check bypassed! Bug found',
          description: `Coupon ${coupon.code} applied with cart total $${cartTotal.toFixed(2)} but requires minimum $${coupon.minimumSpend}`,
          points: 80,
          vulnerability_type: 'Business Logic Bypass',
          severity: 'Medium',
          coupon_code: coupon.code,
          cart_total: cartTotal,
          required_minimum: coupon.minimumSpend,
          discount_applied: discountAmount
        };

        // Show notification and update leaderboard
        if (typeof window !== 'undefined') {
          const notifications = await import('@/lib/notifications');
          notifications.showBugNotification(bugData);
          notifications.notifyLeaderboard(bugData);
        }

        return true;
      } else {
        // Normal case: cart total ≥ $100, apply discount normally
        const discountAmount = coupon.discountAmount;
        dispatch({ 
          type: 'APPLY_COUPON_SUCCESS', 
          payload: { coupon, discountAmount } 
        });
        return true;
      }
    }

    // Normal coupon validation (no bugs)
    if (coupon.isExpired) {
      dispatch({ type: 'APPLY_COUPON_ERROR', payload: 'This coupon has expired' });
      return false;
    }

    if (cartTotal < coupon.minimumSpend) {
      dispatch({ 
        type: 'APPLY_COUPON_ERROR', 
        payload: `Minimum spend of $${coupon.minimumSpend} required` 
      });
      return false;
    }

    // Valid coupon application - normal case
    const discountAmount = coupon.discountAmount;
    dispatch({ 
      type: 'APPLY_COUPON_SUCCESS', 
      payload: { coupon, discountAmount } 
    });
    
    return true;
  };

  const removeCoupon = () => {
    dispatch({ type: 'REMOVE_COUPON' });
  };

  const resetError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  const calculateDiscount = (cartTotal: number): number => {
    if (!state.appliedCoupon) return 0;
    return state.discountAmount;
  };

  const calculateFinalTotal = (cartTotal: number): number => {
    const discount = calculateDiscount(cartTotal);
    return Math.max(0, cartTotal - discount);
  };

  const activeCoupons = Object.values(AVAILABLE_COUPONS);

  return (
    <CouponContext.Provider value={{ 
      state, 
      appliedCoupon: state.appliedCoupon,
      activeCoupons,
      setCouponCode, 
      applyCoupon, 
      removeCoupon, 
      resetError,
      calculateDiscount,
      calculateFinalTotal
    }}>
      {children}
    </CouponContext.Provider>
  );
};

// Hook to use coupon context
export const useCoupon = () => {
  const context = useContext(CouponContext);
  if (context === undefined) {
    throw new Error('useCoupon must be used within a CouponProvider');
  }
  return context;
};
