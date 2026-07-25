'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setIsLoading(true);
    try {
      // Wishlist returns an array (no pagination)
      const data = await apiGet(ENDPOINTS.WISHLIST.BASE);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchWishlist();
    }
  }, [authLoading, fetchWishlist]);

  const addToWishlist = useCallback(
    async (productId) => {
      if (!user) return;
      await apiPost(ENDPOINTS.WISHLIST.BASE, { product_id: productId });
      await fetchWishlist();
    },
    [user, fetchWishlist]
  );

  const removeFromWishlist = useCallback(
    async (wishlistItemId) => {
      if (!user) return;
      await apiDelete(ENDPOINTS.WISHLIST.ITEM(wishlistItemId));
      setItems((prev) => prev.filter((i) => i.id !== wishlistItemId));
    },
    [user]
  );

  const isInWishlist = useCallback(
    (productId) => items.some((i) => i.product?.id === productId),
    [items]
  );

  const getWishlistItemId = useCallback(
    (productId) => items.find((i) => i.product?.id === productId)?.id,
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      if (!user) return false; // caller can prompt login
      const wishlistItemId = getWishlistItemId(productId);
      if (wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      } else {
        await addToWishlist(productId);
      }
      return true;
    },
    [user, getWishlistItemId, removeFromWishlist, addToWishlist]
  );

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        getWishlistItemId,
        fetchWishlist,
        count: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
