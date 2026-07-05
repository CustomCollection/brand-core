/* eslint-disable @next/next/no-img-element */
'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';

export default function CartDrawer() {
  const { items, itemCount, total, isLoading, updateQuantity, removeItem, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  const onClose = () => setIsCartOpen(false);

  return (
    <Fragment>
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gray-900" />
            <h2 className="text-xl font-medium text-gray-900">Your Cart</h2>
            <span className="bg-gray-100 text-gray-900 text-xs font-semibold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-10 h-10 text-gray-300" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                <p className="text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
              </div>
              <Button onClick={onClose} variant="outline" className="mt-4">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id || item.guest_id} className="flex gap-4">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                    {/* Assuming item.product_image or item.product.images[0] */}
                    <img
                      src={item.product_image || (item.product && item.product.image) || '/placeholder.jpg'}
                      alt={item.product_name || (item.product && item.product.name)}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3 className="line-clamp-2 pr-4">
                          <Link href={`/products/${item.product_slug || (item.product && item.product.slug)}`} onClick={onClose}>
                            {item.product_name || (item.product && item.product.name)}
                          </Link>
                        </h3>
                        <p className="ml-4 whitespace-nowrap">
                          ₹{(item.discount_price || item.price || 0).toLocaleString()}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.color_name && `Color: ${item.color_name}`}
                        {item.color_name && item.size_name && ' | '}
                        {item.size_name && `Size: ${item.size_name}`}
                      </p>
                    </div>
                    <div className="flex flex-1 items-end justify-between text-sm">
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-50 text-gray-600 transition-colors rounded-l-md"
                          disabled={isLoading}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-50 text-gray-600 transition-colors rounded-r-md"
                          disabled={isLoading}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="font-medium text-red-600 hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-6 bg-gray-50">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>₹{total.toLocaleString()}</p>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="space-y-3">
              <Link href="/checkout" onClick={onClose} className="block w-full">
                <Button className="w-full py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                  Checkout Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}
