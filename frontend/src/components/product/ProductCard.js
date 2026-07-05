'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist } = useWishlist();

  const isWishlisted = wishlistItems.some((item) => item.product_id === product.id);
  const primaryImage = product.images?.[0]?.image || product.image || 'https://via.placeholder.com/600x800';
  const hoverImage = product.images?.[1]?.image || primaryImage;

  const handleQuickAdd = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    try {
      await addItem(product.id, 1);
      // Wait for animation
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error('Failed to add item', error);
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      const wishlistItem = wishlistItems.find(item => item.product_id === product.id);
      if (wishlistItem) removeWishlist(wishlistItem.id);
    } else {
      addWishlist(product.id);
    }
  };

  return (
    <div 
      className="group relative flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/products/${product.slug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
        {/* Images with transition */}
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className={`object-cover transition-opacity duration-500 ${isHovered && hoverImage !== primaryImage ? 'opacity-0' : 'opacity-100'}`}
        />
        {hoverImage !== primaryImage && (
          <Image
            src={hoverImage}
            alt={`${product.name} alternative view`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className={`object-cover transition-transform duration-700 group-hover:scale-105 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute right-3 top-3 z-10 rounded-full p-2 text-primary bg-white/70 backdrop-blur-md opacity-0 shadow-sm transition-all duration-300 hover:bg-white hover:text-accent group-hover:opacity-100"
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className="h-4 w-4"
            fill={isWishlisted ? 'currentColor' : 'none'}
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {/* Quick Add Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/90 backdrop-blur-sm p-4 transition-transform duration-300 group-hover:translate-y-0 flex justify-center">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full max-w-[200px] border border-primary bg-primary px-4 py-2 text-xs font-medium uppercase tracking-wider text-white transition-colors hover:bg-transparent hover:text-primary disabled:opacity-50"
          >
            {isAdding ? 'Adding...' : 'Quick Add'}
          </button>
        </div>
      </Link>

      <div className="mt-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-text-primary">
            <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-medium text-text-primary">${product.price}</p>
        </div>
        <p className="mt-1 text-xs text-text-secondary">{product.collection_name || 'Premium'}</p>
      </div>
    </div>
  );
}
