'use client';

import Link from 'next/link';
import Image from 'next/image';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '@/lib/constants';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateItem, removeItem } = useCart();
  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : SHIPPING_CHARGE;
  const total = subtotal + shipping;

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-black/40 animate-fade-in'
          onClick={closeCart}
          aria-hidden='true'
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-background shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role='dialog'
        aria-modal='true'
        aria-label='Shopping cart'
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-border'>
          <div className='flex items-center gap-2'>
            <ShoppingBag size={18} className='text-text-primary' />
            <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary'>
              Cart
            </h2>
            {items.length > 0 && (
              <span className='text-xs text-text-muted'>({cart.total_items || items.length} items)</span>
            )}
          </div>
          <button
            onClick={closeCart}
            className='text-text-muted hover:text-text-primary transition-colors'
            aria-label='Close cart'
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        {items.length === 0 ? (
          <div className='flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center'>
            <ShoppingBag size={48} className='text-border' />
            <div>
              <p className='text-base font-light text-text-primary'>Your cart is empty</p>
              <p className='text-sm text-text-muted mt-1'>Add some items to get started.</p>
            </div>
            <Button variant='secondary' onClick={closeCart}>
              <Link href='/products'>Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className='flex-1 overflow-y-auto py-4'>
            {/* Free shipping progress */}
            {!shippingFree && (
              <div className='mx-6 mb-4 p-3 bg-surface border border-border'>
                <p className='text-xs text-text-secondary'>
                  Add{' '}
                  <span className='font-semibold text-accent'>
                    {formatPrice(FREE_SHIPPING_THRESHOLD - subtotal)}
                  </span>{' '}
                  more for free shipping!
                </p>
                <div className='mt-2 h-1 bg-border rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-accent transition-all duration-500'
                    style={{
                      width: `${Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <ul className='divide-y divide-border'>
              {items.map((item) => (
                <li key={item.id} className='flex gap-4 px-6 py-4'>
                  {/* Image */}
                  <div className='relative h-20 w-16 flex-shrink-0 bg-surface overflow-hidden'>
                    {item.product_image ? (
                      <Image
                        src={item.product_image}
                        alt={item.product_name}
                        fill
                        sizes='64px'
                        className='object-cover'
                      />
                    ) : (
                      <div className='flex h-full items-center justify-center'>
                        <ShoppingBag size={24} className='text-border' />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className='flex-1 min-w-0'>
                    <Link
                      href={`/products/${item.product_slug}`}
                      className='text-sm font-medium text-text-primary hover:text-accent transition-colors truncate block'
                      onClick={closeCart}
                    >
                      {item.product_name}
                    </Link>
                    <p className='text-xs text-text-muted mt-0.5'>
                      {item.size?.name || item.size} / {item.color?.name || item.color}
                    </p>
                    <div className='flex items-center justify-between mt-2'>
                      {/* Quantity */}
                      <div className='flex items-center border border-border'>
                        <button
                          onClick={() => {
                            if (item.quantity <= 1) removeItem(item.id);
                            else updateItem(item.id, item.quantity - 1);
                          }}
                          className='h-6 w-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
                          aria-label='Decrease quantity'
                        >
                          <Minus size={12} />
                        </button>
                        <span className='h-6 w-6 flex items-center justify-center text-xs font-medium text-text-primary'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          className='h-6 w-6 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors'
                          aria-label='Increase quantity'
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className='flex items-center gap-2'>
                        <span className='text-sm font-semibold text-text-primary'>
                          {formatPrice(item.line_total || item.effective_price)}
                        </span>
                        <button
                          onClick={() => removeItem(item.id)}
                          className='text-text-muted hover:text-error transition-colors'
                          aria-label='Remove item'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        {items.length > 0 && (
          <div className='border-t border-border px-6 py-5 space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between text-sm text-text-secondary'>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className='flex justify-between text-sm text-text-secondary'>
                <span>Shipping</span>
                <span className={shippingFree ? 'text-success font-medium' : ''}>
                  {shippingFree ? 'Free' : formatPrice(shipping)}
                </span>
              </div>
              <div className='flex justify-between text-base font-semibold text-text-primary border-t border-border pt-2 mt-2'>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className='space-y-2'>
              <Button
                fullWidth
                onClick={closeCart}
              >
                <Link href='/checkout' className='w-full'>Checkout</Link>
              </Button>
              <Button
                variant='ghost'
                fullWidth
                onClick={closeCart}
              >
                <Link href='/cart' className='w-full'>View Full Cart</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
