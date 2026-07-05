'use client';

import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { GUEST_CART_KEY, GUEST_CART_ID_KEY } from '@/lib/constants';
import { generateGuestCartId } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

function getGuestCart() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(GUEST_CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function getOrCreateGuestCartId() {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem(GUEST_CART_ID_KEY);
  if (!id) {
    id = generateGuestCartId();
    localStorage.setItem(GUEST_CART_ID_KEY, id);
  }
  return id;
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const itemCount = useMemo(() => items.reduce((sum, item) => sum + (item.quantity || 0), 0), [items]);

  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const price = item.discount_price || item.price || 0;
        return sum + price * (item.quantity || 0);
      }, 0),
    [items]
  );

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated) {
        const data = await apiGet(ENDPOINTS.CART.BASE);
        setItems(data.items || data || []);
      } else {
        setItems(getGuestCart());
      }
    } catch {
      if (!isAuthenticated) {
        setItems(getGuestCart());
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (product) => {
      if (isAuthenticated) {
        await apiPost(ENDPOINTS.CART.BASE + 'add/', {
          product_id: product.id,
          size_id: product.size_id,
          color_id: product.color_id,
          quantity: product.quantity || 1,
        });
        await fetchCart();
      } else {
        const currentItems = getGuestCart();
        const existingIndex = currentItems.findIndex(
          (item) => item.product_id === product.id && item.size_id === product.size_id && item.color_id === product.color_id
        );

        if (existingIndex > -1) {
          currentItems[existingIndex].quantity += product.quantity || 1;
        } else {
          currentItems.push({
            ...product,
            product_id: product.id,
            guest_id: getOrCreateGuestCartId() + '_' + Date.now(),
            quantity: product.quantity || 1,
          });
        }

        saveGuestCart(currentItems);
        setItems(currentItems);
      }
    },
    [isAuthenticated, fetchCart]
  );

  const removeItem = useCallback(
    async (itemId) => {
      if (isAuthenticated) {
        await apiDelete(ENDPOINTS.CART.ITEM(itemId));
        await fetchCart();
      } else {
        const currentItems = getGuestCart().filter((item) => item.id !== itemId);
        saveGuestCart(currentItems);
        setItems(currentItems);
      }
    },
    [isAuthenticated, fetchCart]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity) => {
      if (quantity < 1) {
        return removeItem(itemId);
      }

      if (isAuthenticated) {
        await apiPatch(ENDPOINTS.CART.ITEM(itemId), { quantity });
        await fetchCart();
      } else {
        const currentItems = getGuestCart().map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );
        saveGuestCart(currentItems);
        setItems(currentItems);
      }
    },
    [isAuthenticated, fetchCart, removeItem]
  );

  const clearCart = useCallback(async () => {
    if (isAuthenticated) {
      const currentItems = [...items];
      for (const item of currentItems) {
        await apiDelete(ENDPOINTS.CART.ITEM(item.id));
      }
      setItems([]);
    } else {
      saveGuestCart([]);
      setItems([]);
    }
  }, [isAuthenticated, items]);

  const value = {
    items,
    itemCount,
    total,
    isLoading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart: fetchCart,
    isCartOpen,
    setIsCartOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
