'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Lock,
  XCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { formatPrice, formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
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

const CANCEL_REASONS = [
  'Changed my mind',
  'Ordered wrong size or color',
  'Need to change shipping address',
  'Found a better alternative',
  'Order created by mistake',
  'Other',
];

export default function OrderDetailPage({ params }) {
  const { orderNumber } = params;
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState(CANCEL_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const toast = useToast();

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

  const handleCancelOrder = async () => {
    const isPaid = order?.payment?.is_paid;
    if (isPaid) {
      if (!upiId.trim()) {
        toast.warning('Please enter your UPI ID to receive the refund.');
        return;
      }
      if (!upiId.includes('@')) {
        toast.warning('Please enter a valid UPI ID (e.g. name@okhdfcbank or 9876543210@upi).');
        return;
      }
    }

    setIsCancelling(true);
    try {
      const finalReason =
        cancelReason === 'Other' && customReason.trim()
          ? `Other: ${customReason.trim()}`
          : cancelReason;
      const res = await apiPost(ENDPOINTS.ORDERS.CANCEL(order.order_number), {
        reason: finalReason,
        upi_id: isPaid ? upiId.trim() : '',
      });
      const updatedOrder = res?.order || res;
      setOrder(updatedOrder);
      setIsCancelModalOpen(false);
      toast.success(
        isPaid
          ? 'Order cancelled. Refund request has been sent to admin.'
          : 'Your order has been cancelled successfully.'
      );
    } catch (err) {
      toast.error(err?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

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
  const canCancel = ['pending', 'confirmed'].includes(order.status);
  const isPrintedOrLater = ['printing', 'packed', 'shipped', 'delivered'].includes(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className='space-y-6 sm:space-y-8'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-start justify-between gap-4'>
        <div>
          <Link
            href='/account/orders'
            className='inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors mb-3'
          >
            <ArrowLeft size={12} /> Back to Orders
          </Link>
          <h1 className='text-xl sm:text-2xl font-light uppercase tracking-widest text-text-primary'>{order.order_number}</h1>
          <p className='text-xs sm:text-sm text-text-muted mt-1'>Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className='flex items-center gap-3 self-start sm:self-auto'>
          <Badge variant={statusConfig.color} dot>{statusConfig.label}</Badge>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className='border border-rose-200 bg-rose-50/70 p-4 sm:p-5 flex items-start gap-3.5'>
          <XCircle size={20} className='text-rose-600 flex-shrink-0 mt-0.5' />
          <div className='space-y-1 flex-1'>
            <p className='text-sm font-semibold text-rose-900'>This order has been cancelled</p>
            <p className='text-xs text-rose-700/90'>
              The order will not be processed further.
            </p>
          </div>
        </div>
      )}

      {/* Refund Status Card (if online payment was made) */}
      {order.refund && (
        <div className='border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3.5'>
          <CheckCircle size={20} className='text-emerald-600 flex-shrink-0 mt-0.5' />
          <div className='space-y-1.5 flex-1'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1'>
              <p className='text-sm font-semibold text-emerald-950'>
                Refund Request: <span className='capitalize font-bold'>{order.refund.status_display || order.refund.status}</span>
              </p>
              <span className='text-xs font-bold text-emerald-800'>{formatPrice(order.refund.amount)}</span>
            </div>
            <p className='text-xs text-emerald-800'>
              Transfer Destination UPI ID: <span className='font-mono font-semibold'>{order.refund.upi_id}</span>
            </p>
            {order.refund.status === 'pending' ? (
              <p className='text-xs text-emerald-700/90 mt-1'>
                Our admin team has received your refund request and will transfer the money to your UPI ID shortly.
              </p>
            ) : order.refund.status === 'processed' ? (
              <p className='text-xs text-emerald-700/90 mt-1'>
                Refund transferred successfully! {order.refund.admin_notes && `Reference: ${order.refund.admin_notes}`}
              </p>
            ) : (
              <p className='text-xs text-rose-700/90 mt-1'>
                Refund status: {order.refund.status}. {order.refund.admin_notes}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Printed / Locked Alert */}
      {isPrintedOrLater && (
        <div className='border border-neutral-200 bg-neutral-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div className='flex items-center gap-2.5 text-xs text-text-secondary'>
            <Lock size={15} className='text-neutral-500 flex-shrink-0' />
            <span>Your order is already printed and can&apos;t be cancelled.</span>
          </div>
          <span className='text-[10px] uppercase font-semibold tracking-wider text-neutral-400'>
            Production in progress
          </span>
        </div>
      )}

      {/* Status timeline (Responsive with horizontal scrolling on mobile) */}
      {!['cancelled', 'returned'].includes(order.status) && (
        <div className='border border-border p-4 sm:p-6'>
          <h2 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-6'>Order Status</h2>
          <div className='overflow-x-auto pb-3 sm:pb-0'>
            <div className='min-w-[480px] sm:min-w-0 relative flex justify-between'>
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
        </div>
      )}

      {/* Active Cancellation Card (for Pending & Confirmed) */}
      {canCancel && (
        <div className='border border-border p-4 sm:p-5 bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-text-primary'>Need to cancel?</p>
            <p className='text-xs text-text-muted mt-0.5'>
              You can cancel this order before custom printing begins.
            </p>
          </div>
          <button
            onClick={() => setIsCancelModalOpen(true)}
            className='self-start sm:self-auto px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer'
          >
            Cancel Order
          </button>
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

      {/* Cancel Order Modal */}
      {isCancelModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-0'>
          <div className='bg-background border border-border w-full max-w-md p-6 space-y-5 shadow-2xl relative'>
            <div className='flex items-start justify-between'>
              <div className='flex items-center gap-2 text-rose-600'>
                <AlertTriangle size={20} />
                <h3 className='text-base font-semibold text-text-primary'>Cancel Order?</h3>
              </div>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className='text-text-muted hover:text-text-primary cursor-pointer'
              >
                <X size={18} />
              </button>
            </div>

            <div className='text-xs sm:text-sm text-text-secondary space-y-2'>
              <p>
                Are you sure you want to cancel order <span className='font-semibold text-text-primary'>{order.order_number}</span>?
              </p>
              <p className='text-xs text-text-muted'>
                This action is permanent and cannot be undone.
              </p>
            </div>

            {/* Reason selector */}
            <div className='space-y-2'>
              <label className='block text-xs font-semibold uppercase tracking-wider text-text-primary'>
                Reason for cancellation
              </label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className='w-full border border-border bg-background px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-hidden focus:border-accent'
              >
                {CANCEL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              {cancelReason === 'Other' && (
                <textarea
                  rows={2}
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder='Please tell us the reason...'
                  className='w-full mt-2 border border-border bg-background p-2.5 text-xs text-text-primary focus:outline-hidden focus:border-accent resize-none'
                />
              )}
            </div>

            {/* UPI ID for paid orders */}
            {order?.payment?.is_paid && (
              <div className='p-3.5 bg-amber-50/80 border border-amber-200/80 space-y-2'>
                <div className='flex items-center justify-between'>
                  <label className='text-xs font-semibold uppercase tracking-wider text-amber-900'>
                    UPI ID for Refund
                  </label>
                  <span className='text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-950 font-bold uppercase'>
                    Required
                  </span>
                </div>
                <p className='text-xs text-amber-800 leading-relaxed'>
                  This order was paid online ({formatPrice(order.total)}). Please enter your UPI ID so our admin can transfer your refund directly.
                </p>
                <input
                  type='text'
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder='e.g. yourname@okhdfcbank or 9876543210@upi'
                  className='w-full border border-amber-300 bg-white px-3 py-2 text-xs sm:text-sm text-text-primary focus:outline-hidden focus:border-accent'
                />
              </div>
            )}

            {/* Actions */}
            <div className='flex items-center justify-end gap-3 pt-2 border-t border-border'>
              <button
                type='button'
                onClick={() => setIsCancelModalOpen(false)}
                disabled={isCancelling}
                className='px-4 py-2 border border-border text-xs font-semibold uppercase tracking-wider text-text-primary hover:border-primary transition-colors cursor-pointer'
              >
                Keep Order
              </button>
              <button
                type='button'
                onClick={handleCancelOrder}
                disabled={isCancelling}
                className='px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50'
              >
                {isCancelling ? (
                  <>
                    <Spinner size='sm' className='text-white' />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Yes, Cancel Order</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

