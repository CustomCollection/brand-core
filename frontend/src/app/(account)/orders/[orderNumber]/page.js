/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Package,
  CheckCircle2,
  Printer,
  Box,
  Truck,
  Home,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

const STATUS_TIMELINE = [
  { id: 'pending', label: 'Order Placed', icon: Package },
  { id: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
  { id: 'printing', label: 'Printing', icon: Printer },
  { id: 'packed', label: 'Packed', icon: Box },
  { id: 'shipped', label: 'Shipped', icon: Truck },
  { id: 'delivered', label: 'Delivered', icon: Home },
];

export default function OrderDetailsPage({ params }) {
  // In Next.js 15, params is a Promise, so we must unwrap it using `use()`
  const resolvedParams = use(params);
  const { orderNumber } = resolvedParams;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrderDetails() {
      try {
        const data = await apiGet(ENDPOINTS.ORDERS.DETAIL(orderNumber));
        setOrder(data);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Could not load order details or the order does not exist.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrderDetails();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">{error || 'The requested order could not be found.'}</p>
        <Link href="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  // Determine current status index
  const isCancelled = order.status === 'cancelled' || order.status === 'returned';
  const currentStatusIndex = isCancelled
    ? -1
    : STATUS_TIMELINE.findIndex((s) => s.id === order.status);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order #{order.order_number}</h1>
            <p className="mt-2 text-sm text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
          <div>
            <Badge 
              variant={isCancelled ? 'error' : (order.status === 'delivered' ? 'success' : 'warning')} 
              className="text-sm px-4 py-1.5 shadow-sm"
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stepper Tracking UI */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 overflow-x-auto">
          <div className="min-w-[600px]">
            <div className="relative">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-900 rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (STATUS_TIMELINE.length - 1)) * 100 : 0}%` }}
              />
              
              <div className="relative flex justify-between">
                {STATUS_TIMELINE.map((step, index) => {
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center group">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-300 ${
                          isCompleted 
                            ? 'bg-gray-900 border-white shadow-md text-white' 
                            : 'bg-gray-100 border-white text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-gray-100 scale-110' : ''}`}
                      >
                        <StepIcon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <p className={`mt-3 text-sm font-semibold tracking-wide ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-medium text-red-800">Order {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</h3>
            <p className="text-red-700 mt-1">This order has been {order.status}. No further updates will occur.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Items */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Order Items</h2>
              <span className="text-sm font-medium text-gray-500">{order.items?.length || 0} items</span>
            </div>
            <ul className="divide-y divide-gray-100">
              {order.items?.map((item) => (
                <li key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
                    {item.product_image_url ? (
                      <img src={item.product_image_url} alt={item.product_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          <Link href={`/products/${item.product_slug}`} className="hover:underline">
                            {item.product_name}
                          </Link>
                        </h3>
                        <p className="text-lg font-bold text-gray-900 ml-4">
                          ₹{parseFloat(item.line_total).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-2 text-sm text-gray-500 space-y-1">
                        <p>Price: ₹{parseFloat(item.price).toLocaleString()}</p>
                        <p>Qty: {item.quantity}</p>
                        {item.color && <p>Color: {item.color}</p>}
                        {item.size && <p>Size: {item.size}</p>}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Shipment details if available */}
          {order.shipment && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                <Truck className="w-5 h-5 text-gray-400" />
                Shipping Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 font-medium">Courier</p>
                  <p className="text-gray-900 font-semibold mt-1">{order.shipment.courier}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium">Tracking Number</p>
                  <p className="text-gray-900 font-semibold mt-1">{order.shipment.tracking_number}</p>
                </div>
                {order.shipment.shipped_at && (
                  <div>
                    <p className="text-gray-500 font-medium">Shipped At</p>
                    <p className="text-gray-900 mt-1">{new Date(order.shipment.shipped_at).toLocaleString()}</p>
                  </div>
                )}
                {order.shipment.delivered_at && (
                  <div>
                    <p className="text-gray-500 font-medium">Delivered At</p>
                    <p className="text-gray-900 mt-1">{new Date(order.shipment.delivered_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Summary & Address */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-4">Order Summary</h2>
            <dl className="space-y-4 text-sm text-gray-600">
              <div className="flex justify-between items-center">
                <dt>Subtotal</dt>
                <dd className="font-medium text-gray-900">₹{parseFloat(order.subtotal).toLocaleString()}</dd>
              </div>
              <div className="flex justify-between items-center">
                <dt>Shipping</dt>
                <dd className="font-medium text-gray-900">
                  {parseFloat(order.shipping_cost) === 0 ? 'Free' : `₹${parseFloat(order.shipping_cost).toLocaleString()}`}
                </dd>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-base">
                <dt className="font-bold text-gray-900">Total</dt>
                <dd className="font-bold text-gray-900 text-xl">₹{parseFloat(order.total).toLocaleString()}</dd>
              </div>
            </dl>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 border-b border-gray-100 pb-4">
              <MapPin className="w-5 h-5 text-gray-400" />
              Delivery Address
            </h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="font-semibold text-gray-900">{order.shipping_address?.full_name}</p>
              <p>{order.shipping_address?.address_line1}</p>
              {order.shipping_address?.address_line2 && <p>{order.shipping_address?.address_line2}</p>}
              <p>{order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}</p>
              <p className="pt-2 flex items-center gap-2">
                <span className="font-medium text-gray-900">Phone:</span> {order.shipping_address?.phone_number}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
