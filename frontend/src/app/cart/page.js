'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '@/lib/constants';
import Spinner from '@/components/ui/Spinner';

export default function CartPage() {
  const { cart, isLoading, updateItem, removeItem } = useCart();
  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : (items.length > 0 ? SHIPPING_CHARGE : 0);
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner size='lg' className='text-accent' />
      </div>
    );
  }

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary mb-10'>Shopping Cart</h1>

        {items.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-24 text-center'>
            <ShoppingBag size={64} className='text-border mb-6' />
            <h2 className='text-xl font-light text-text-primary mb-2'>Your cart is empty</h2>
            <p className='text-text-muted mb-8'>Looks like you haven't added anything yet.</p>
            <Button><Link href='/products'>Start Shopping</Link></Button>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-12 lg:grid-cols-3'>
            {/* Cart items */}
            <div className='lg:col-span-2'>
              <ul className='divide-y divide-border'>
                {items.map((item) => (
                  <li key={item.id} className='flex gap-6 py-6'>
                    {/* Image */}
                    <div className='relative h-28 w-22 flex-shrink-0 bg-surface overflow-hidden'>
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          sizes='88px'
                          className='object-cover'
                        />
                      ) : (
                        <div className='flex h-full w-full items-center justify-center'>
                          <ShoppingBag size={32} className='text-border' />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between gap-4'>
                        <Link
                          href={`/products/${item.product_slug}`}
                          className='text-base font-medium text-text-primary hover:text-accent transition-colors'
                        >
                          {item.product_name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className='text-text-muted hover:text-error transition-colors flex-shrink-0'
                          aria-label='Remove item'
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className='text-sm text-text-muted mt-1'>
                        {item.size?.name || item.size} / {item.color?.name || item.color}
                      </p>
                      <div className='flex items-center justify-between mt-4'>
                        {/* Quantity */}
                        <div className='flex items-center border border-border'>
                          <button
                            onClick={() => {
                              if (item.quantity <= 1) removeItem(item.id);
                              else updateItem(item.id, item.quantity - 1);
                            }}
                            className='h-8 w-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
                          >
                            <Minus size={14} />
                          </button>
                          <span className='h-8 w-10 flex items-center justify-center text-sm font-medium border-x border-border'>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateItem(item.id, item.quantity + 1)}
                            className='h-8 w-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <span className='text-base font-semibold text-text-primary'>
                          {formatPrice(item.line_total || item.effective_price)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order summary */}
            <div className='lg:col-span-1'>
              <div className='sticky top-24 border border-border p-6 space-y-4'>
                <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary'>Order Summary</h2>
                <div className='space-y-2'>
                  <div className='flex justify-between text-sm text-text-secondary'>
                    <span>Subtotal ({cart.total_items} items)</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className='flex justify-between text-sm text-text-secondary'>
                    <span>Shipping</span>
                    <span className={shippingFree ? 'text-success font-medium' : ''}>
                      {shippingFree ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className='border-t border-border pt-2 mt-2 flex justify-between font-semibold text-text-primary'>
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                {!shippingFree && (
                  <p className='text-xs text-accent'>
                    Add {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                  </p>
                )}

                <Button fullWidth>
                  <Link href='/checkout' className='flex items-center gap-2'>
                    Proceed to Checkout <ArrowRight size={14} />
                  </Link>
                </Button>

                <Link
                  href='/products'
                  className='block text-center text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors'
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
