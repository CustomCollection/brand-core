'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { Package, ArrowRight, Calendar, CreditCard } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await apiGet(ENDPOINTS.ORDERS.LIST);
        setOrders(data.results || data || []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Could not load your orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    const s = status?.toLowerCase() || '';
    if (['delivered', 'confirmed'].includes(s)) return 'success';
    if (['pending', 'printing', 'packed'].includes(s)) return 'warning';
    if (['cancelled', 'returned'].includes(s)) return 'error';
    return 'default';
  };

  const getStatusLabel = (status) => {
    if (!status) return '';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Order History</h1>
          <p className="mt-2 text-sm text-gray-500">
            Check the status of recent orders, manage returns, and discover similar products.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
          <Link href="/">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Order Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900">{order.order_number}</p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Date Placed
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="hidden sm:block w-px h-8 bg-gray-200"></div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <CreditCard className="w-3 h-3" /> Total Amount
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{parseFloat(order.total).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={getStatusColor(order.status)} className="px-3 py-1">
                    {getStatusLabel(order.status)}
                  </Badge>
                  <Link href={`/orders/${order.order_number}`}>
                    <Button variant="outline" size="sm" className="group">
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              {/* Note: if backend provides limited items snapshot in list view, map them here. Otherwise just show summary. */}
              <div className="px-6 py-5 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    This order contains {order.item_count} item{order.item_count !== 1 ? 's' : ''}.
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
