'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductDetails({ product }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  
  const { addItem } = useCart();
  const { items: wishlistItems, addItem: addWishlist, removeItem: removeWishlist } = useWishlist();
  
  const isWishlisted = wishlistItems.some((item) => item.product_id === product.id);

  const images = product.images?.length > 0 ? product.images : [{ image: product.image || 'https://via.placeholder.com/800x1200' }];
  
  // Fake sizes and colors if none provided by API for mockup
  const sizes = product.variants?.map(v => v.size).filter(Boolean) || ['XS', 'S', 'M', 'L', 'XL'];
  const colors = product.variants?.map(v => v.color).filter(Boolean) || ['Black', 'White', 'Navy'];

  const handleAddToCart = async () => {
    // In a real app we'd validate variants
    setIsAdding(true);
    try {
      await addItem(product.id, quantity, { size: selectedSize, color: selectedColor });
      setTimeout(() => setIsAdding(false), 500);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      setIsAdding(false);
    }
  };

  const toggleWishlist = () => {
    if (isWishlisted) {
      const wishlistItem = wishlistItems.find(item => item.product_id === product.id);
      if (wishlistItem) removeWishlist(wishlistItem.id);
    } else {
      addWishlist(product.id);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-12">
      {/* Image Gallery */}
      <div className="lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4">
        {/* Thumbnails */}
        <div className="flex sm:flex-col gap-4 overflow-x-auto sm:overflow-y-auto sm:w-24 hide-scrollbar">
          {images.map((img, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveImage(idx)}
              className={`relative aspect-[3/4] w-20 sm:w-full flex-shrink-0 overflow-hidden border transition-all ${activeImage === idx ? 'border-accent opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
            >
              <Image src={img.image} alt={`${product.name} thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
        
        {/* Main Image */}
        <div className="relative aspect-[3/4] flex-1 overflow-hidden bg-surface">
          <Image 
            src={images[activeImage]?.image} 
            alt={product.name} 
            fill 
            className="object-cover transition-opacity duration-500" 
            priority
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="lg:w-1/2 flex flex-col py-8 lg:py-0">
        <div className="mb-2 text-xs uppercase tracking-widest text-text-secondary">{product.collection_name || 'Premium'}</div>
        <h1 className="text-3xl sm:text-4xl font-light text-text-primary mb-4">{product.name}</h1>
        <div className="text-xl font-medium text-text-primary mb-6">${product.price}</div>
        
        <div className="prose prose-sm text-text-secondary mb-8 font-light leading-relaxed">
          {product.description || 'Experience ultimate comfort and style with this meticulously crafted piece. Designed for the modern individual who appreciates quality and subtle elegance.'}
        </div>

        <div className="h-px w-full bg-border mb-8" />

        {/* Colors */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium uppercase tracking-wider text-text-primary">Color: {selectedColor}</span>
          </div>
          <div className="flex gap-3">
            {colors.map((color) => (
              <button 
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`h-8 w-8 rounded-full border-2 shadow-sm transition-all ${selectedColor === color ? 'border-accent scale-110' : 'border-border hover:scale-105'}`}
                style={{ backgroundColor: color.toLowerCase() === 'navy' ? '#000080' : color.toLowerCase() }}
                title={color}
                aria-label={`Select ${color}`}
              />
            ))}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium uppercase tracking-wider text-text-primary">Size</span>
            <button className="text-xs text-text-secondary underline hover:text-text-primary">Size Guide</button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {sizes.map((size) => (
              <button 
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`py-3 text-sm transition-colors border ${selectedSize === size ? 'border-accent bg-accent text-primary font-medium' : 'border-border text-text-secondary hover:border-text-primary'}`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Quantity and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center border border-border">
            <button 
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
            <button 
              onClick={() => setQuantity(q => q + 1)}
              className="px-4 py-3 text-text-secondary hover:text-text-primary hover:bg-surface transition-colors"
            >
              +
            </button>
          </div>
          
          <button 
            onClick={handleAddToCart}
            disabled={isAdding}
            className="flex-1 bg-primary text-white text-sm font-medium uppercase tracking-widest py-4 border border-primary hover:bg-transparent hover:text-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isAdding ? 'Adding...' : 'Add to Cart'}
          </button>
          
          <button 
            onClick={toggleWishlist}
            className={`flex items-center justify-center p-4 border transition-colors ${isWishlisted ? 'border-accent text-accent' : 'border-border text-text-secondary hover:border-text-primary'}`}
            aria-label="Wishlist"
          >
            <svg className="h-5 w-5" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
          </button>
        </div>

        {/* Product Meta */}
        <div className="space-y-4 border-t border-border pt-8 text-sm">
          <div className="flex">
            <span className="w-32 text-text-muted">Materials</span>
            <span className="text-text-secondary">100% Premium Organic Cotton</span>
          </div>
          <div className="flex">
            <span className="w-32 text-text-muted">Care</span>
            <span className="text-text-secondary">Machine wash cold. Do not bleach.</span>
          </div>
          <div className="flex">
            <span className="w-32 text-text-muted">Shipping</span>
            <span className="text-text-secondary">Free shipping on orders over $150</span>
          </div>
        </div>
      </div>
    </div>
  );
}
