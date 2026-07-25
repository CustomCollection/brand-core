'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

export default function WishlistPage() {
  const { items, isLoading, removeFromWishlist } = useWishlist();
  const { addItem, openCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = async (wishlistItem) => {
    const product = wishlistItem.product;
    if (!product) return;

    // If product has sizes/colors, direct to product page for selection
    if ((product.sizes?.length > 0) || (product.colors?.length > 0)) {
      toast.info('Please select size and color on the product page.');
      return;
    }

    try {
      await addItem({
        product_id: product.id,
        size_id: null,
        color_id: null,
        quantity: 1,
        product_data: product,
      });
      toast.success(`${product.name} added to cart.`);
      openCart();
    } catch (err) {
      toast.error(err.message || 'Failed to add to cart.');
    }
  };

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-1'>My Wishlist</h1>
        <p className='text-sm text-text-muted'>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <Spinner size='lg' className='text-accent' />
        </div>
      ) : items.length === 0 ? (
        <div className='text-center py-16 border border-dashed border-border'>
          <Heart size={40} className='text-border mx-auto mb-4' />
          <p className='text-text-muted'>Your wishlist is empty.</p>
          <Link href='/products' className='mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-accent hover:underline'>
            Explore Products
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            const effectivePrice = product.effective_price || product.price;
            return (
              <div key={item.id} className='group relative'>
                {/* Image */}
                <Link href={`/products/${product.slug}`} className='block relative aspect-[3/4] overflow-hidden bg-surface'>
                  {product.primary_image ? (
                    <Image
                      src={product.primary_image}
                      alt={product.name}
                      fill
                      sizes='(max-width: 640px) 50vw, 25vw'
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <ShoppingBag size={32} className='text-border' />
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromWishlist(item.id);
                      toast.success('Removed from wishlist.');
                    }}
                    className='absolute top-2 right-2 h-7 w-7 bg-background/90 flex items-center justify-center text-error hover:bg-error hover:text-background transition-colors'
                    aria-label='Remove from wishlist'
                  >
                    <Trash2 size={13} />
                  </button>
                </Link>

                {/* Info */}
                <div className='mt-3 space-y-1'>
                  <Link href={`/products/${product.slug}`}>
                    <h3 className='text-sm font-medium text-text-primary truncate hover:text-accent transition-colors'>
                      {product.name}
                    </h3>
                  </Link>
                  <div className='flex items-center justify-between gap-2'>
                    <span className='text-sm font-semibold text-text-primary'>
                      {formatPrice(effectivePrice)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className='text-[10px] font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors'
                    >
                      Add to Cart
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
