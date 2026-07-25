'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { GUEST_CART_KEY } from '@/lib/constants';
import { useAuth } from '@/context/AuthContext';

const CartContext = createContext(null);

// Guest cart stored in localStorage as:
// [{ product_id, size_id, size_name, color_id, color_name, quantity, product: {...} }]
function getGuestCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function clearGuestCart() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_CART_KEY);
}

export function CartProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], total_items: 0, subtotal: '0.00' });
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // ─── Fetch server cart ───
  const fetchCart = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await apiGet(ENDPOINTS.CART.BASE);
      setCart(data || { items: [], total_items: 0, subtotal: '0.00' });
    } catch {
      setCart({ items: [], total_items: 0, subtotal: '0.00' });
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // ─── Guest cart as state ───
  const loadGuestCart = useCallback(() => {
    const items = getGuestCart();
    const total_items = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items
      .reduce((sum, i) => {
        const price = parseFloat(i.effective_price || i.product_price || 0);
        return sum + price * i.quantity;
      }, 0)
      .toFixed(2);
    setCart({ items, total_items, subtotal });
  }, []);

  // ─── Merge guest cart into server cart on login ───
  const mergeGuestCart = useCallback(async () => {
    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    const mergePayload = guestItems.map((item) => ({
      product_id: item.product_id,
      size_id: item.size_id,
      color_id: item.color_id,
      quantity: item.quantity,
    }));

    try {
      const data = await apiPost(ENDPOINTS.CART.MERGE, { items: mergePayload });
      setCart(data || { items: [], total_items: 0, subtotal: '0.00' });
    } catch {
      // If merge fails, just fetch existing server cart
      await fetchCart();
    } finally {
      clearGuestCart();
    }
  }, [fetchCart]);

  useEffect(() => {
    if (authLoading) return;

    if (user) {
      // Logged in: check for guest cart to merge, then fetch server cart
      const guestItems = getGuestCart();
      if (guestItems.length > 0) {
        mergeGuestCart();
      } else {
        fetchCart();
      }
    } else {
      // Guest: load from localStorage
      loadGuestCart();
    }
  }, [user, authLoading, fetchCart, loadGuestCart, mergeGuestCart]);

  // ─── Add item ───
  // payload: { product_id, size_id, color_id, quantity, product_data (for guest display) }
  const addItem = useCallback(
    async ({ product_id, size_id, color_id, quantity = 1, product_data = null }) => {
      if (user) {
        // Authenticated: call API
        const data = await apiPost(ENDPOINTS.CART.ADD, {
          product_id,
          size_id,
          color_id,
          quantity,
        });
        setCart(data);
      } else {
        // Guest: store in localStorage
        const items = getGuestCart();
        const existing = items.find(
          (i) =>
            i.product_id === product_id &&
            i.size_id === size_id &&
            i.color_id === color_id
        );

        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            id: Date.now(), // temporary local ID
            product_id,
            size_id,
            color_id,
            quantity,
            // Store display data from the product_data prop
            product_name: product_data?.name || '',
            product_slug: product_data?.slug || '',
            product_image: product_data?.primary_image || '',
            product_price: product_data?.price || '0',
            product_discount_price: product_data?.discount_price || null,
            effective_price: product_data?.effective_price || product_data?.price || '0',
            size: product_data?.selected_size_name || '',
            color: product_data?.selected_color_name || '',
            line_total: (parseFloat(product_data?.effective_price || product_data?.price || 0) * quantity).toFixed(2),
          });
        }

        saveGuestCart(items);
        loadGuestCart();
      }
    },
    [user, loadGuestCart]
  );

  // ─── Update item quantity ───
  const updateItem = useCallback(
    async (itemId, quantity) => {
      if (user) {
        const data = await apiPut(ENDPOINTS.CART.ITEM(itemId), { quantity });
        setCart(data);
      } else {
        const items = getGuestCart().map((i) =>
          i.id === itemId ? { ...i, quantity } : i
        );
        saveGuestCart(items);
        loadGuestCart();
      }
    },
    [user, loadGuestCart]
  );

  // ─── Remove item ───
  const removeItem = useCallback(
    async (itemId) => {
      if (user) {
        const data = await apiDelete(ENDPOINTS.CART.ITEM(itemId));
        setCart(data);
      } else {
        const items = getGuestCart().filter((i) => i.id !== itemId);
        saveGuestCart(items);
        loadGuestCart();
      }
    },
    [user, loadGuestCart]
  );

  // ─── Clear cart ───
  const clearCart = useCallback(async () => {
    if (user) {
      await apiDelete(ENDPOINTS.CART.BASE);
    } else {
      clearGuestCart();
    }
    setCart({ items: [], total_items: 0, subtotal: '0.00' });
  }, [user]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        isOpen,
        openCart,
        closeCart,
        toggleCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        fetchCart,
        totalItems: cart.total_items || 0,
        subtotal: cart.subtotal || '0.00',
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
