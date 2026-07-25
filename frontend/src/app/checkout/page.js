'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Script from 'next/script';
import { ArrowLeft, MapPin, CreditCard, Truck, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { formatPrice } from '@/lib/utils';
import { PAYMENT_METHODS, FREE_SHIPPING_THRESHOLD, SHIPPING_CHARGE } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function CheckoutPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { cart, clearCart } = useCart();
  const toast = useToast();
  const router = useRouter();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS.cod);
  const [isPlacing, setIsPlacing] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const items = cart?.items || [];
  const subtotal = parseFloat(cart?.subtotal || 0);
  const shippingFree = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shipping = shippingFree ? 0 : (items.length > 0 ? SHIPPING_CHARGE : 0);
  const total = subtotal + shipping;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, authLoading, router]);

  // Fetch addresses
  useEffect(() => {
    if (!user) return;
    const fetchAddresses = async () => {
      try {
        const data = await apiGet(ENDPOINTS.AUTH.ADDRESSES);
        const list = data?.results || (Array.isArray(data) ? data : []);
        setAddresses(list);
        const def = list.find((a) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        else if (list.length > 0) setSelectedAddressId(list[0].id);
      } catch {
        setAddresses([]);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user]);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      toast.warning('Please select a delivery address.');
      return;
    }
    if (items.length === 0) {
      toast.warning('Your cart is empty.');
      return;
    }

    setIsPlacing(true);
    try {
      // Step 1: Create order
      const orderData = await apiPost(ENDPOINTS.ORDERS.CHECKOUT, {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });

      const order = orderData?.order || orderData;

      if (paymentMethod === PAYMENT_METHODS.razorpay) {
        // Step 2a: Create Razorpay payment order
        const paymentData = await apiPost(ENDPOINTS.PAYMENTS.CREATE_ORDER, {
          order_number: order.order_number,
          payment_method: PAYMENT_METHODS.razorpay,
        });

        const razorpay = new window.Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: paymentData.amount,
          currency: paymentData.currency || 'INR',
          name: 'CustomCollection',
          description: `Order ${order.order_number}`,
          order_id: paymentData.razorpay_order_id,
          handler: async (response) => {
            try {
              await apiPost(ENDPOINTS.PAYMENTS.VERIFY, {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });
              await clearCart();
              toast.success('Payment successful! Order placed.');
              router.push(`/checkout/success?order=${order.order_number}`);
            } catch {
              toast.error('Payment verification failed. Contact support.');
            }
          },
          prefill: {
            name: user?.full_name || `${user?.first_name} ${user?.last_name}`,
            email: user?.email,
          },
          theme: { color: '#C9A96E' },
        });
        razorpay.open();
      } else {
        // Step 2b: COD
        await clearCart();
        toast.success('Order placed successfully!');
        router.push(`/checkout/success?order=${order.order_number}`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (authLoading || loadingAddresses) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner size='lg' className='text-accent' />
      </div>
    );
  }

  return (
    <div className='bg-background pt-16'>
      {/* Razorpay SDK */}
      <Script src='https://checkout.razorpay.com/v1/checkout.js' strategy='lazyOnload' />

      <div className='mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-4 mb-10'>
          <Link
            href='/cart'
            className='flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors'
          >
            <ArrowLeft size={14} /> Back to Cart
          </Link>
          <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>Checkout</h1>
        </div>

        <div className='grid grid-cols-1 gap-10 lg:grid-cols-3'>
          {/* Left — Delivery + Payment */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Delivery address */}
            <section className='border border-border p-6'>
              <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2 mb-6'>
                <MapPin size={14} className='text-accent' /> Delivery Address
              </h2>

              {addresses.length === 0 ? (
                <div className='text-center py-6'>
                  <p className='text-sm text-text-muted mb-4'>No saved addresses.</p>
                  <Link
                    href='/account/addresses'
                    className='text-xs font-semibold uppercase tracking-widest text-accent hover:underline'
                  >
                    Add an Address
                  </Link>
                </div>
              ) : (
                <div className='space-y-3'>
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-4 p-4 border cursor-pointer transition-colors ${
                        selectedAddressId === addr.id
                          ? 'border-accent bg-surface'
                          : 'border-border hover:border-accent/50'
                      }`}
                    >
                      <input
                        type='radio'
                        name='address'
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className='mt-0.5 accent-accent'
                      />
                      <div>
                        <p className='text-sm font-medium text-text-primary'>
                          {addr.full_name}
                          {addr.is_default && (
                            <span className='ml-2 text-[10px] font-semibold uppercase tracking-wider text-accent border border-accent px-1.5 py-0.5'>
                              Default
                            </span>
                          )}
                        </p>
                        <p className='text-xs text-text-secondary mt-0.5'>{addr.phone}</p>
                        <p className='text-xs text-text-secondary mt-1 leading-relaxed'>
                          {addr.address_line_1}{addr.address_line_2 && `, ${addr.address_line_2}`},{' '}
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>
                      </div>
                    </label>
                  ))}
                  <Link
                    href='/account/addresses'
                    className='block text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors pt-2'
                  >
                    + Manage Addresses
                  </Link>
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className='border border-border p-6'>
              <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2 mb-6'>
                <CreditCard size={14} className='text-accent' /> Payment Method
              </h2>

              <div className='space-y-3'>
                <label
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.cod
                      ? 'border-accent bg-surface'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    value={PAYMENT_METHODS.cod}
                    checked={paymentMethod === PAYMENT_METHODS.cod}
                    onChange={() => setPaymentMethod(PAYMENT_METHODS.cod)}
                    className='accent-accent'
                  />
                  <div>
                    <p className='text-sm font-medium text-text-primary'>Cash on Delivery (COD)</p>
                    <p className='text-xs text-text-muted mt-0.5'>Pay when your order arrives.</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${
                    paymentMethod === PAYMENT_METHODS.razorpay
                      ? 'border-accent bg-surface'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <input
                    type='radio'
                    name='payment'
                    value={PAYMENT_METHODS.razorpay}
                    checked={paymentMethod === PAYMENT_METHODS.razorpay}
                    onChange={() => setPaymentMethod(PAYMENT_METHODS.razorpay)}
                    className='accent-accent'
                  />
                  <div>
                    <p className='text-sm font-medium text-text-primary'>Online Payment (Razorpay)</p>
                    <p className='text-xs text-text-muted mt-0.5'>UPI, Cards, Net Banking, Wallets.</p>
                  </div>
                </label>
              </div>
            </section>

            {/* Trust signals */}
            <div className='flex flex-wrap gap-6 text-xs text-text-muted'>
              <div className='flex items-center gap-1.5'>
                <ShieldCheck size={14} className='text-accent' />
                Secure checkout
              </div>
              <div className='flex items-center gap-1.5'>
                <Truck size={14} className='text-accent' />
                Fast delivery
              </div>
            </div>
          </div>

          {/* Right — Order summary */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 border border-border p-6 space-y-5'>
              <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary'>Order Summary</h2>

              {/* Items */}
              <ul className='divide-y divide-border'>
                {items.map((item) => (
                  <li key={item.id} className='flex gap-3 py-3'>
                    <div className='relative h-14 w-11 flex-shrink-0 bg-surface overflow-hidden'>
                      {item.product_image && (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          sizes='44px'
                          className='object-cover'
                        />
                      )}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-medium text-text-primary truncate'>{item.product_name}</p>
                      <p className='text-xs text-text-muted'>
                        {item.size?.name || item.size} / {item.color?.name || item.color} × {item.quantity}
                      </p>
                    </div>
                    <p className='text-xs font-semibold text-text-primary flex-shrink-0'>
                      {formatPrice(item.line_total || item.effective_price)}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Totals */}
              <div className='space-y-2 border-t border-border pt-4'>
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
                <div className='flex justify-between font-semibold text-text-primary border-t border-border pt-2'>
                  <span>Total</span>
                  <span className='text-lg'>{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size='lg'
                onClick={handlePlaceOrder}
                isLoading={isPlacing}
                disabled={items.length === 0 || !selectedAddressId}
              >
                {paymentMethod === PAYMENT_METHODS.cod ? 'Place Order' : 'Pay Now'}
              </Button>

              <p className='text-xs text-center text-text-muted'>
                By placing your order you agree to our terms of service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
