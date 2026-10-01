'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';

export default function ProductCard({ product }) {
  const effectivePrice = product.effective_price || product.price;
  const hasDiscount =
    product.discount_price && parseFloat(product.discount_price) < parseFloat(product.price);

  // Primary image
  const primaryImg =
    product.primary_image ||
    (Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]?.image_url || product.images[0]
      : null);

  // Secondary/next image for hover
  const secondaryImg = (() => {
    if (product.secondary_image && product.secondary_image !== primaryImg) {
      return product.secondary_image;
    }
    if (Array.isArray(product.images) && product.images.length > 1) {
      for (const img of product.images) {
        const url = typeof img === 'string' ? img : img?.image_url;
        if (url && url !== primaryImg) return url;
      }
      const second = product.images[1];
      return typeof second === 'string' ? second : second?.image_url;
    }
    return null;
  })();

  const hasSecondary = Boolean(secondaryImg && secondaryImg !== primaryImg);

  return (
    <div className='group relative product-card-container'>
      {/* Image container */}
      <Link
        href={`/products/${product.slug}`}
        className='block relative overflow-hidden aspect-[3/4] bg-surface'
      >
        {primaryImg ? (
          <>
            {/* Base Primary Image */}
            <img
              src={primaryImg}
              alt={product.name}
              className={cn(
                'product-card-img-primary',
                hasSecondary && 'has-secondary'
              )}
            />

            {/* Next / Hover Image (Preloaded, smooth crossfade) */}
            {hasSecondary && (
              <img
                src={secondaryImg}
                alt={`${product.name} alternate view`}
                loading='eager'
                className='product-card-img-secondary'
              />
            )}
          </>
        ) : (
          <div className='flex h-full items-center justify-center'>
            <ShoppingBag size={40} className='text-border' />
          </div>
        )}

        {/* Badges */}
        <div className='absolute top-3 left-3 flex flex-col gap-1 z-20 pointer-events-none'>
          {product.is_new_arrival && (
            <span className='bg-primary text-background text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 shadow-sm'>
              New
            </span>
          )}
          {hasDiscount && (
            <span className='bg-error text-background text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 shadow-sm'>
              -{product.discount_percentage}%
            </span>
          )}
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
  );
}
