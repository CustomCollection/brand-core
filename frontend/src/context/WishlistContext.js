'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useAuth } from '@/context/AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiGet(ENDPOINTS.WISHLIST.BASE);
      setItems(data.results || data || []);
    } catch {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const addItem = useCallback(
    async (productId) => {
      if (!isAuthenticated) return;
      await apiPost(ENDPOINTS.WISHLIST.BASE, { product: productId });
      await fetchWishlist();
    },
    [isAuthenticated, fetchWishlist]
  );

  const removeItem = useCallback(
    async (wishlistItemId) => {
      if (!isAuthenticated) return;
      await apiDelete(ENDPOINTS.WISHLIST.ITEM(wishlistItemId));
      await fetchWishlist();
    },
    [isAuthenticated, fetchWishlist]
  );

  const isInWishlist = useCallback(
    (productId) => {
      return items.some((item) => {
        const id = item.product?.id || item.product;
        return id === productId;
      });
    },
    [items]
  );

  const getWishlistItem = useCallback(
    (productId) => {
      return items.find((item) => {
        const id = item.product?.id || item.product;
        return id === productId;
      });
    },
    [items]
  );

  const toggleWishlist = useCallback(
    async (productId) => {
      const existing = getWishlistItem(productId);
      if (existing) {
        await removeItem(existing.id);
      } else {
        await addItem(productId);
      }
    },
    [getWishlistItem, removeItem, addItem]
  );

  const value = {
    items,
    isLoading,
    addItem,
    removeItem,
    isInWishlist,
    toggleWishlist,
    refreshWishlist: fetchWishlist,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export default WishlistContext;
