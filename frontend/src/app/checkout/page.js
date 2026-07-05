/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import { CreditCard, Truck, MapPin, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { items, total, isLoading: cartLoading, clearCart } = useCart();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('RAZORPAY'); // 'RAZORPAY' or 'COD'
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function fetchAddresses() {
      try {
        const data = await apiGet(ENDPOINTS.AUTH.ADDRESSES);
        // Assuming data is an array of addresses
        setAddresses(data.results || data || []);
        if (data.results && data.results.length > 0) {
          setSelectedAddressId(data.results[0].id);
        } else if (Array.isArray(data) && data.length > 0) {
          setSelectedAddressId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      }
    }
    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (items.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <Button onClick={() => router.push('/')}>Continue Shopping</Button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-10 rounded-2xl shadow-xl max-w-md w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h2>
          <p className="text-gray-600 mb-8">Thank you for your purchase. Your order has been placed successfully.</p>
          <Button onClick={() => router.push('/orders')} className="w-full">
            View Orders
          </Button>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!selectedAddressId) {
      setError('Please select a shipping address.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create Order
      const orderRes = await apiPost(ENDPOINTS.CHECKOUT, {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
      });

      const order = orderRes.order;

      if (paymentMethod === 'COD') {
        await clearCart();
        setSuccess(true);
        return;
      }

      // 2. Create Payment (Razorpay)
      const paymentRes = await apiPost(ENDPOINTS.PAYMENTS.CREATE_ORDER, {
        order_number: order.order_number,
        payment_method: 'RAZORPAY',
      });

      // 3. Open Razorpay Checkout
      const options = {
        key: paymentRes.key_id, // Replace with your Razorpay Key ID in production if needed, or get from backend
        amount: paymentRes.amount,
        currency: paymentRes.currency || 'INR',
        name: 'Brand Core',
        description: `Order ${order.order_number}`,
        order_id: paymentRes.razorpay_order_id,
        handler: async function (response) {
          try {
            await apiPost(ENDPOINTS.PAYMENTS.VERIFY, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            await clearCart();
            setSuccess(true);
          } catch {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: user?.first_name ? `${user.first_name} ${user.last_name}` : '',
          email: user?.email || '',
        },
        theme: {
          color: '#111827', // Gray-900
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        setError(response.error.description || 'Payment failed.');
      });
      rzp1.open();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7 space-y-8">
            
            {/* Shipping Address */}
            <div className="bg-white shadow-sm sm:rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 flex items-center mb-6">
                <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                Shipping Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No addresses found. Please add an address in your profile first.
                  <Button 
                    variant="outline" 
                    className="mt-4 block" 
                    onClick={() => router.push('/profile')}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                        selectedAddressId === address.id
                          ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50'
                          : 'border-gray-300 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address.id}
                        className="sr-only"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      <span className="flex flex-1">
                        <span className="flex flex-col">
                          <span className="block text-sm font-medium text-gray-900">
                            {address.full_name || user?.first_name}
                          </span>
                          <span className="mt-1 flex items-center text-sm text-gray-500">
                            {address.address_line1}, {address.city}, {address.state} {address.postal_code}
                          </span>
                          <span className="mt-1 text-sm text-gray-500">
                            {address.phone_number}
                          </span>
                        </span>
                      </span>
                      <CheckCircle
                        className={`h-5 w-5 text-gray-900 ${
                          selectedAddressId === address.id ? 'block' : 'hidden'
                        }`}
                        aria-hidden="true"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white shadow-sm sm:rounded-xl p-6 border border-gray-100">
              <h2 className="text-xl font-medium text-gray-900 flex items-center mb-6">
                <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                Payment Method
              </h2>
              <div className="space-y-4">
                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                    paymentMethod === 'RAZORPAY'
                      ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="RAZORPAY"
                    className="sr-only"
                    checked={paymentMethod === 'RAZORPAY'}
                    onChange={() => setPaymentMethod('RAZORPAY')}
                  />
                  <span className="flex flex-1 items-center">
                    <CreditCard className="w-6 h-6 text-gray-400 mr-4" />
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Pay Online
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        Cards, UPI, NetBanking via Razorpay
                      </span>
                    </span>
                  </span>
                  <CheckCircle
                    className={`h-5 w-5 text-gray-900 ${
                      paymentMethod === 'RAZORPAY' ? 'block' : 'hidden'
                    }`}
                    aria-hidden="true"
                  />
                </label>

                <label
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${
                    paymentMethod === 'COD'
                      ? 'border-gray-900 ring-1 ring-gray-900 bg-gray-50'
                      : 'border-gray-300 bg-white hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="COD"
                    className="sr-only"
                    checked={paymentMethod === 'COD'}
                    onChange={() => setPaymentMethod('COD')}
                  />
                  <span className="flex flex-1 items-center">
                    <Truck className="w-6 h-6 text-gray-400 mr-4" />
                    <span className="flex flex-col">
                      <span className="block text-sm font-medium text-gray-900">
                        Cash on Delivery
                      </span>
                      <span className="mt-1 text-sm text-gray-500">
                        Pay when your order arrives
                      </span>
                    </span>
                  </span>
                  <CheckCircle
                    className={`h-5 w-5 text-gray-900 ${
                      paymentMethod === 'COD' ? 'block' : 'hidden'
                    }`}
                    aria-hidden="true"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5 mt-10 lg:mt-0">
            <div className="bg-white shadow-sm sm:rounded-xl p-6 border border-gray-100 sticky top-24">
              <h2 className="text-xl font-medium text-gray-900 mb-6">Order Summary</h2>
              
              <div className="flow-root mb-6">
                <ul className="-my-4 divide-y divide-gray-200">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-center py-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-gray-200 bg-gray-50">
                        <img
                          src={item.product_image || (item.product && item.product.image) || '/placeholder.jpg'}
                          alt={item.product_name || (item.product && item.product.name)}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-sm font-medium text-gray-900">
                            <h3 className="line-clamp-1">{item.product_name || (item.product && item.product.name)}</h3>
                            <p className="ml-4 whitespace-nowrap">₹{(item.discount_price || item.price || 0).toLocaleString()}</p>
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            Qty: {item.quantity} 
                            {item.color_name && ` | Color: ${item.color_name}`}
                            {item.size_name && ` | Size: ${item.size_name}`}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <dl className="space-y-4 border-t border-gray-200 pt-6 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Subtotal</dt>
                  <dd className="font-medium text-gray-900">₹{total.toLocaleString()}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-gray-600">Shipping</dt>
                  <dd className="font-medium text-gray-900">Free</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-lg">
                  <dt className="font-medium text-gray-900">Total</dt>
                  <dd className="font-bold text-gray-900">₹{total.toLocaleString()}</dd>
                </div>
              </dl>

              {error && (
                <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-md text-sm border border-red-100">
                  {error}
                </div>
              )}

              <Button
                onClick={handleCheckout}
                disabled={loading || !selectedAddressId}
                className="w-full mt-6 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? <Spinner size="sm" className="text-white mr-2" /> : null}
                {paymentMethod === 'RAZORPAY' ? 'Pay Now' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
