"use client"

import React, { createContext, useContext, useEffect, useState, useSyncExternalStore } from 'react';
import type { Product } from '@/lib/StoreContext';
import { MIN_ITEM_QUANTITY } from '@/lib/config';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  viewer3DProduct: Product | null;
  openViewer3D: (product: Product) => void;
  closeViewer3D: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

function getInitialCartItems(): CartItem[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const saved = localStorage.getItem('invictus_cart');
  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved) as CartItem[];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCartItems);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewer3DProduct, setViewer3DProduct] = useState<Product | null>(null);
  const isHydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false
  );

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('invictus_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isHydrated]);

  const addToCart = (product: Product, quantity: number) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, qty: number) => {
    const safeQty = Math.max(MIN_ITEM_QUANTITY, qty);
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity: safeQty } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const visibleCartItems = isHydrated ? cartItems : [];

  const cartTotal = visibleCartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = visibleCartItems.reduce((sum, item) => sum + item.quantity, 0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const openViewer3D = (product: Product) => setViewer3DProduct(product);
  const closeViewer3D = () => setViewer3DProduct(null);

  return (
    <CartContext.Provider
      value={{
        cartItems: visibleCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        isCartOpen,
        openCart,
        closeCart,
        viewer3DProduct,
        openViewer3D,
        closeViewer3D,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
