'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { formatPrice, formatDateShort } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { ORDER_STATUSES } from '@/lib/constants';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const data = await apiGet(`${ENDPOINTS.ORDERS.LIST}?page=${page}`);
        setOrders(data?.results || []);
        setTotalPages(data?.total_pages || 1);
      } catch {
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [page]);

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary mb-1'>My Orders</h1>
        <p className='text-sm text-text-muted'>Track and manage your orders.</p>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-16'>
          <Spinner size='lg' className='text-accent' />
        </div>
      ) : orders.length === 0 ? (
        <div className='text-center py-16 border border-dashed border-border'>
          <Package size={40} className='text-border mx-auto mb-4' />
          <p className='text-text-muted'>No orders yet.</p>
          <Link href='/products' className='mt-4 inline-block text-xs font-semibold uppercase tracking-widest text-accent hover:underline'>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className='space-y-3'>
          {orders.map((order) => {
            const statusConfig = ORDER_STATUSES[order.status] || { label: order.status, color: 'default' };
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.order_number}`}
                className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border p-5 hover:border-accent transition-colors group'
              >
                <div className='space-y-1'>
                  <p className='text-sm font-semibold text-text-primary group-hover:text-accent transition-colors'>
                    {order.order_number}
                  </p>
                  <p className='text-xs text-text-muted'>
                    {formatDateShort(order.created_at)} · {order.item_count} item{order.item_count !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className='flex items-center gap-4'>
                  <span className='text-sm font-semibold text-text-primary'>
                    {formatPrice(order.total)}
                  </span>
                  <Badge variant={statusConfig.color} dot>
                    {statusConfig.label}
                  </Badge>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex gap-2 justify-center pt-4'>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className='px-4 py-2 border border-border text-sm disabled:opacity-40 hover:border-primary transition-colors'
          >
            Previous
          </button>
          <span className='px-4 py-2 text-sm text-text-muted'>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className='px-4 py-2 border border-border text-sm disabled:opacity-40 hover:border-primary transition-colors'
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
