'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function ProductCard({ product }) {
  const { addItem, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Please sign in to save items to your wishlist.');
      return;
    }
    try {
      await toggleWishlist(product.id);
      toast.success(inWishlist ? 'Removed from wishlist.' : 'Added to wishlist.');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  const handleQuickAdd = (e) => {
    e.preventDefault();
    // Pre-select first available size and color
    if (product.sizes?.length > 0) setSelectedSize(product.sizes[0]);
    if (product.colors?.length > 0) setSelectedColor(product.colors[0]);
    setIsQuickAddOpen(true);
  };

  const handleAddToCart = async () => {
    if (!selectedSize) { toast.warning('Please select a size.'); return; }
    if (!selectedColor) { toast.warning('Please select a color.'); return; }

    setIsAddingToCart(true);
    try {
      await addItem({
        product_id: product.id,
        size_id: selectedSize.id,
        color_id: selectedColor.id,
        quantity: 1,
        product_data: {
          ...product,
          selected_size_name: selectedSize.name,
          selected_color_name: selectedColor.name,
        },
      });
      setIsQuickAddOpen(false);
      toast.success(`${product.name} added to cart.`);
      openCart();
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const effectivePrice = product.effective_price || product.price;
  const hasDiscount = product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price);

  return (
    <>
      <div className='group relative'>
        {/* Image container */}
        <Link href={`/products/${product.slug}`} className='block relative overflow-hidden aspect-[3/4] bg-surface'>
          {product.primary_image ? (
            <Image
              src={product.primary_image}
              alt={product.name}
              fill
              sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
              className='object-cover transition-transform duration-500 group-hover:scale-105'
              priority={false}
            />
          ) : (
            <div className='flex h-full items-center justify-center'>
              <ShoppingBag size={40} className='text-border' />
            </div>
          )}

          {/* Badges */}
          <div className='absolute top-3 left-3 flex flex-col gap-1'>
            {product.is_new_arrival && (
              <span className='bg-primary text-background text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5'>
                New
              </span>
            )}
            {hasDiscount && (
              <span className='bg-error text-background text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5'>
                -{product.discount_percentage}%
              </span>
            )}
          </div>

          {/* Hover actions */}
          <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center gap-2 pb-4'>
            <button
              onClick={handleWishlistToggle}
              className={cn(
                'h-9 w-9 flex items-center justify-center bg-background transition-colors hover:bg-accent hover:text-background',
                inWishlist && 'bg-accent text-background'
              )}
              aria-label='Add to wishlist'
            >
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleQuickAdd}
              className='h-9 px-4 flex items-center justify-center gap-1.5 bg-background text-[10px] font-semibold uppercase tracking-widest transition-colors hover:bg-accent hover:text-background'
              aria-label='Quick add to cart'
            >
              <ShoppingBag size={13} />
              Quick Add
            </button>
            <Link
              href={`/products/${product.slug}`}
              onClick={(e) => e.stopPropagation()}
              className='h-9 w-9 flex items-center justify-center bg-background transition-colors hover:bg-accent hover:text-background'
              aria-label='View product'
            >
              <Eye size={15} />
            </Link>
          </div>
        </Link>

        {/* Product info */}
        <div className='mt-3 space-y-1'>
          <Link href={`/products/${product.slug}`}>
            <h3 className='text-sm font-medium text-text-primary truncate hover:text-accent transition-colors'>
              {product.name}
            </h3>
          </Link>
          {product.collections?.length > 0 && (
            <p className='text-xs text-text-muted uppercase tracking-wider'>
              {product.collections.map((c) => c.name).join(' / ')}
            </p>
          )}
          <div className='flex items-center gap-2'>
            <span className='text-sm font-semibold text-text-primary'>
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className='text-xs text-text-muted line-through'>
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <Modal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        title='Quick Add'
        size='sm'
      >
        <div className='space-y-5'>
          <div>
            <p className='text-sm font-medium text-text-primary'>{product.name}</p>
            <p className='text-sm text-accent font-semibold mt-0.5'>{formatPrice(effectivePrice)}</p>
          </div>

          {product.sizes?.length > 0 && (
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-text-primary mb-2'>
                Size{selectedSize ? `: ${selectedSize.name}` : ''}
              </p>
              <div className='flex flex-wrap gap-2'>
                {product.sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'h-9 min-w-[36px] px-2 border text-xs font-medium transition-all',
                      selectedSize?.id === size.id
                        ? 'border-primary bg-primary text-background'
                        : 'border-border text-text-primary hover:border-primary'
                    )}
                  >
                    {size.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.colors?.length > 0 && (
            <div>
              <p className='text-xs font-semibold uppercase tracking-wider text-text-primary mb-2'>
                Color{selectedColor ? `: ${selectedColor.name}` : ''}
              </p>
              <div className='flex flex-wrap gap-2'>
                {product.colors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'h-8 w-8 rounded-full border-2 transition-all',
                      selectedColor?.id === color.id
                        ? 'border-primary scale-110'
                        : 'border-transparent hover:border-border'
                    )}
                    style={{ backgroundColor: color.hex_code }}
                    title={color.name}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAddToCart}
            fullWidth
            isLoading={isAddingToCart}
          >
            Add to Cart
          </Button>
        </div>
      </Modal>
    </>
  );
}
