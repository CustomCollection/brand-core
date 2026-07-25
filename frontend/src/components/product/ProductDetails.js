'use client';

import { useState } from 'react';
import { Truck, RotateCcw, ShieldCheck, Heart, Star, Minus, Plus } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '@/lib/constants';

export default function ProductDetails({ product }) {
  const { addItem, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const toast = useToast();

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const inWishlist = isInWishlist(product.id);
  const effectivePrice = parseFloat(product.effective_price || product.price);
  const hasDiscount =
    product.discount_price &&
    parseFloat(product.discount_price) < parseFloat(product.price);

  const handleAddToCart = async () => {
    if (!selectedSize && product.sizes?.length > 0) {
      toast.warning('Please select a size.');
      return;
    }
    if (!selectedColor && product.colors?.length > 0) {
      toast.warning('Please select a color.');
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem({
        product_id: product.id,
        size_id: selectedSize?.id,
        color_id: selectedColor?.id,
        quantity,
        product_data: {
          ...product,
          selected_size_name: selectedSize?.name,
          selected_color_name: selectedColor?.name,
        },
      });
      toast.success(`${product.name} added to cart!`);
      openCart();
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!user) {
      toast.info('Please sign in to save to wishlist.');
      return;
    }
    try {
      await toggleWishlist(product.id);
      toast.success(inWishlist ? 'Removed from wishlist.' : 'Added to wishlist.');
    } catch {
      toast.error('Something went wrong.');
    }
  };

  return (
    <div className='space-y-6'>
      {/* Collections */}
      {product.collections?.length > 0 && (
        <p className='text-xs font-semibold uppercase tracking-widest text-accent'>
          {product.collections.map((c) => c.name).join(' / ')}
        </p>
      )}

      {/* Name */}
      <h1 className='text-3xl font-light uppercase tracking-wider text-text-primary'>
        {product.name}
      </h1>

      {/* Rating */}
      {product.average_rating && (
        <div className='flex items-center gap-2'>
          <div className='flex gap-0.5'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={14}
                className={
                  i < Math.round(product.average_rating)
                    ? 'text-accent fill-accent'
                    : 'text-border fill-border'
                }
              />
            ))}
          </div>
          <span className='text-xs text-text-muted'>
            {product.average_rating} ({product.review_count} reviews)
          </span>
        </div>
      )}

      {/* Price */}
      <div className='flex items-baseline gap-3'>
        <span className='text-2xl font-semibold text-text-primary'>
          {formatPrice(effectivePrice)}
        </span>
        {hasDiscount && (
          <>
            <span className='text-base text-text-muted line-through'>
              {formatPrice(product.price)}
            </span>
            <span className='text-xs font-semibold text-error bg-error-light px-2 py-0.5'>
              -{product.discount_percentage}% OFF
            </span>
          </>
        )}
      </div>

      {/* Short description */}
      {product.short_description && (
        <p className='text-sm text-text-secondary leading-relaxed'>
          {product.short_description}
        </p>
      )}

      <div className='h-px bg-border' />

      {/* Size selector */}
      {product.sizes?.length > 0 && (
        <div>
          <div className='flex items-center justify-between mb-3'>
            <p className='text-xs font-semibold uppercase tracking-widest text-text-primary'>
              Size{selectedSize ? `: ${selectedSize.name}` : ' — Select'}
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            {product.sizes.map((size) => (
              <button
                key={size.id}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  'h-10 min-w-[40px] px-3 border text-sm font-medium transition-all',
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

      {/* Color selector */}
      {product.colors?.length > 0 && (
        <div>
          <p className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3'>
            Color{selectedColor ? `: ${selectedColor.name}` : ' — Select'}
          </p>
          <div className='flex flex-wrap gap-3'>
            {product.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                className={cn(
                  'h-9 w-9 rounded-full border-2 transition-all',
                  selectedColor?.id === color.id
                    ? 'border-primary scale-110 shadow-md'
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

      {/* Quantity */}
      <div>
        <p className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3'>Quantity</p>
        <div className='flex items-center border border-border w-fit'>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className='h-10 w-10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
            aria-label='Decrease quantity'
          >
            <Minus size={14} />
          </button>
          <span className='h-10 w-12 flex items-center justify-center text-sm font-medium text-text-primary border-x border-border'>
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className='h-10 w-10 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
            aria-label='Increase quantity'
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className='flex gap-3'>
        <Button
          onClick={handleAddToCart}
          isLoading={isAddingToCart}
          className='flex-1'
          size='lg'
        >
          Add to Cart
        </Button>
        <button
          onClick={handleWishlist}
          className={cn(
            'h-14 w-14 flex-shrink-0 border flex items-center justify-center transition-colors',
            inWishlist
              ? 'border-accent bg-accent text-background'
              : 'border-border text-text-primary hover:border-accent hover:text-accent'
          )}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Shipping info */}
      <div className='space-y-3 pt-2 border-t border-border'>
        <div className='flex items-center gap-3 text-sm text-text-secondary'>
          <Truck size={16} className='text-accent flex-shrink-0' />
          <span>
            Free shipping on orders above {formatPrice(FREE_SHIPPING_THRESHOLD)}. Flat {formatPrice(SHIPPING_CHARGE)} below.
          </span>
        </div>
        <div className='flex items-center gap-3 text-sm text-text-secondary'>
          <RotateCcw size={16} className='text-accent flex-shrink-0' />
          <span>7-day easy return policy.</span>
        </div>
        <div className='flex items-center gap-3 text-sm text-text-secondary'>
          <ShieldCheck size={16} className='text-accent flex-shrink-0' />
          <span>100% genuine, print-on-demand product.</span>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <details className='border-t border-border pt-4'>
          <summary className='text-xs font-semibold uppercase tracking-widest text-text-primary cursor-pointer hover:text-accent transition-colors'>
            Description
          </summary>
          <p className='mt-3 text-sm text-text-secondary leading-relaxed'>{product.description}</p>
        </details>
      )}

      {/* Wash care */}
      {product.wash_care && (
        <details className='border-t border-border pt-4'>
          <summary className='text-xs font-semibold uppercase tracking-widest text-text-primary cursor-pointer hover:text-accent transition-colors'>
            Wash & Care
          </summary>
          <p className='mt-3 text-sm text-text-secondary leading-relaxed'>{product.wash_care}</p>
        </details>
      )}

      {/* Shipping info detail */}
      {product.shipping_info && (
        <details className='border-t border-border pt-4'>
          <summary className='text-xs font-semibold uppercase tracking-widest text-text-primary cursor-pointer hover:text-accent transition-colors'>
            Shipping Info
          </summary>
          <p className='mt-3 text-sm text-text-secondary leading-relaxed'>{product.shipping_info}</p>
        </details>
      )}
    </div>
  );
}
