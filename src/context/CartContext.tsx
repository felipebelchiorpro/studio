"use client";

import type { CartItem, Product } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { syncCartAction } from '@/actions/cart';

interface ShippingInfo {
  method: 'shipping' | 'pickup';
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string; // City Name
    cityId?: string; // Shipping Rate ID
    reference?: string;
    cep?: string;
  };
  fee: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product & { couponCode?: string }, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  updateContactInfo: (email?: string, phone?: string) => void;
  shippingInfo: ShippingInfo;
  updateShippingInfo: (info: ShippingInfo) => void;
  coupon: { code: string; type: 'percent' | 'fixed'; value: number } | null;
  applyCoupon: (coupon: { code: string; type: 'percent' | 'fixed'; value: number }) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscountAmount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'darkstore-cart';
const CART_ID_KEY = 'darkstore-cart-id';

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartId, setCartId] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ email?: string; phone?: string }>({});
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({ method: 'shipping', fee: 0 });
  const [coupon, setCoupon] = useState<{ code: string; type: 'percent' | 'fixed'; value: number } | null>(null);
  const COUPON_STORAGE_KEY = 'darkstore-coupon';

  // 1. Load Cart & Coupon on Mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      const storedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
      if (storedCoupon) {
        setCoupon(JSON.parse(storedCoupon));
      }
    } catch (error) {
      console.error("Failed to parse cart/coupon from localStorage", error);
      localStorage.removeItem(CART_STORAGE_KEY);
      localStorage.removeItem(COUPON_STORAGE_KEY);
    } finally {
      setIsLoaded(true);
    }

    let id = localStorage.getItem(CART_ID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(CART_ID_KEY, id);
    }
    setCartId(id);
  }, []);

  // 2. Persist Cart & Coupon on Change
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems, coupon, isLoaded]);

  // 3. Sync with Server (Debounced)
  useEffect(() => {
    if (!cartId || cartItems.length === 0) return;

    const timeoutId = setTimeout(() => {
      const total = getCartTotal();
      // Pass contact info to sync action
      syncCartAction(cartId, cartItems, total, contactInfo.email, contactInfo.phone)
        .then(res => {
          if (!res.success) console.error("Cart Sync Failed:", res.message);
        })
        .catch(err => console.error("Cart Sync Exception:", err));
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [cartItems, cartId, contactInfo, coupon]); // Add coupon dependency

  const addToCart = (product: Product & { couponCode?: string }, quantityToAdd: number = 1) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantityToAdd, product.stock) } : item
        );
      } else {
        return [...prevItems, { ...product, quantity: Math.min(quantityToAdd, product.stock) }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCartItems(prevItems => {
      const productInCart = prevItems.find(item => item.id === productId);
      if (!productInCart) return prevItems;

      const newQuantity = Math.max(0, Math.min(quantity, productInCart.stock));
      if (newQuantity === 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setShippingInfo({ method: 'shipping', fee: 0 }); // Reset shipping too
    setCoupon(null);
  };

  const updateContactInfo = (email?: string, phone?: string) => {
    setContactInfo(prev => ({ ...prev, ...(email && { email }), ...(phone && { phone }) }));
  };

  const updateShippingInfo = (info: ShippingInfo) => {
    setShippingInfo(info);
  };

  const applyCoupon = (newCoupon: { code: string; type: 'percent' | 'fixed'; value: number }) => {
    setCoupon(newCoupon);
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const getSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getDiscountAmount = () => {
    if (!coupon) return 0;
    const subtotal = getSubtotal();
    if (coupon.type === 'percent') {
      return (subtotal * coupon.value) / 100;
    } else {
      return Math.min(coupon.value, subtotal); // Cannot discount more than total
    }
  };

  const getCartTotal = () => {
    return Math.max(0, getSubtotal() - getDiscountAmount());
  };

  const getCartItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getSubtotal,
      getDiscountAmount,
      getCartItemCount,
      updateContactInfo,
      shippingInfo,
      updateShippingInfo,
      coupon,
      applyCoupon,
      removeCoupon
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

