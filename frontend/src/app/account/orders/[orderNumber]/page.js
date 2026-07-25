'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, MapPin } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { formatPrice, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { ORDER_STATUSES, ORDER_STATUS_STEPS } from '@/lib/constants';
import { cn } from '@/lib/utils';

const STEP_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  printing: Package,
  packed: Package,
  shipped: Truck,
  delivered: CheckCircle,
};

export default function OrderDetailPage({ params }) {
  const { orderNumber } = params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await apiGet(ENDPOINTS.ORDERS.DETAIL(orderNumber));
        setOrder(data?.order || data);
      } catch {
        setOrder(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className='flex justify-center py-16'>
        <Spinner size='lg' className='text-accent' />
      </div>
    );
  }

  if (!order) {
    return (
      <div className='text-center py-16'>
        <p className='text-text-muted'>Order not found.</p>
        <Link href='/account/orders' className='mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-accent hover:underline'>
          Back to Orders
        </Link>
      </div>
    );
  }

  const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: 'default' };
  const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.status);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <Link
            href='/account/orders'
            className='flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3'
          >
            <ArrowLeft size={12} /> Back to Orders
          </Link>
          <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary'>{order.order_number}</h1>
          <p className='text-sm text-text-muted mt-1'>Placed on {formatDate(order.created_at)}</p>
        </div>
        <Badge variant={statusConfig.color} dot>{statusConfig.label}</Badge>
      </div>

      {/* Status timeline */}
      {!['cancelled', 'returned'].includes(order.status) && (
        <div className='border border-border p-6'>
          <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-6'>Order Status</h2>
          <div className='relative flex justify-between'>
            {/* Progress line */}
            <div className='absolute top-4 left-0 right-0 h-px bg-border' />
            <div
              className='absolute top-4 left-0 h-px bg-accent transition-all duration-500'
              style={{
                width: currentStepIndex >= 0
                  ? `${(currentStepIndex / (ORDER_STATUS_STEPS.length - 1)) * 100}%`
                  : '0%',
              }}
            />

            {ORDER_STATUS_STEPS.map((step, idx) => {
              const Icon = STEP_ICONS[step] || Clock;
              const done = idx <= currentStepIndex;
              const active = idx === currentStepIndex;
              return (
                <div key={step} className='relative flex flex-col items-center gap-2 z-10'>
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full border-2 flex items-center justify-center bg-background',
                      done ? 'border-accent bg-accent' : 'border-border',
                    )}
                  >
                    <Icon size={14} className={done ? 'text-background' : 'text-text-muted'} />
                  </div>
                  <span
                    className={cn(
                      'text-[10px] font-medium uppercase tracking-wider text-center',
                      active ? 'text-accent' : done ? 'text-text-primary' : 'text-text-muted'
                    )}
                  >
                    {ORDER_STATUSES[step]?.label || step}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Order items */}
        <div className='border border-border p-6 space-y-4'>
          <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary'>Items</h2>
          {(order.items || []).map((item) => (
            <div key={item.id} className='flex gap-4'>
              <div className='relative h-16 w-12 flex-shrink-0 bg-surface overflow-hidden'>
                {item.product_image_url ? (
                  <Image src={item.product_image_url} alt={item.product_name} fill sizes='48px' className='object-cover' />
                ) : (
                  <div className='flex h-full items-center justify-center'><Package size={20} className='text-border' /></div>
                )}
              </div>
              <div className='flex-1 min-w-0'>
                <Link href={`/products/${item.product_slug}`} className='text-sm font-medium text-text-primary hover:text-accent transition-colors block truncate'>
                  {item.product_name}
                </Link>
                <p className='text-xs text-text-muted mt-0.5'>{item.size} / {item.color} &times; {item.quantity}</p>
                <p className='text-sm font-semibold text-text-primary mt-1'>{formatPrice(item.line_total)}</p>
              </div>
            </div>
          ))}

          {/* Totals */}
          <div className='border-t border-border pt-4 space-y-1.5'>
            <div className='flex justify-between text-sm text-text-secondary'>
              <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className='flex justify-between text-sm text-text-secondary'>
              <span>Shipping</span>
              <span className={parseFloat(order.shipping_cost) === 0 ? 'text-success' : ''}>
                {parseFloat(order.shipping_cost) === 0 ? 'Free' : formatPrice(order.shipping_cost)}
              </span>
            </div>
            <div className='flex justify-between font-semibold text-text-primary border-t border-border pt-1.5'>
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          {/* Shipping address */}
          {order.shipping_address && (
            <div className='border border-border p-6'>
              <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2'>
                <MapPin size={12} className='text-accent' /> Shipping Address
              </h2>
              <div className='text-sm text-text-secondary space-y-0.5'>
                <p className='font-medium text-text-primary'>{order.shipping_address.full_name}</p>
                <p>{order.shipping_address.phone}</p>
                <p>{order.shipping_address.address_line_1}</p>
                {order.shipping_address.address_line_2 && <p>{order.shipping_address.address_line_2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} — {order.shipping_address.pincode}</p>
              </div>
            </div>
          )}

          {/* Shipment tracking */}
          {order.shipment && (
            <div className='border border-border p-6'>
              <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-4 flex items-center gap-2'>
                <Truck size={12} className='text-accent' /> Shipment Tracking
              </h2>
              <div className='text-sm text-text-secondary space-y-1'>
                <p>Courier: <span className='text-text-primary font-medium'>{order.shipment.courier}</span></p>
                <p>Tracking: <span className='text-text-primary font-medium'>{order.shipment.tracking_number}</span></p>
                {order.shipment.shipped_at && <p>Shipped: {formatDate(order.shipment.shipped_at)}</p>}
                {order.shipment.delivered_at && <p>Delivered: {formatDate(order.shipment.delivered_at)}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
