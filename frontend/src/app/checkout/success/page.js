'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package } from 'lucide-react';
import Button from '@/components/ui/Button';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className='text-center space-y-6 max-w-md mx-auto'>
      <div className='w-20 h-20 rounded-full bg-success-light flex items-center justify-center mx-auto'>
        <CheckCircle size={40} className='text-success' />
      </div>

      <div>
        <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
          Order Confirmed!
        </h1>
        {orderNumber && (
          <p className='text-text-muted mt-2 text-sm'>
            Order <span className='font-semibold text-text-primary'>{orderNumber}</span> has been placed.
          </p>
        )}
      </div>

      <p className='text-text-secondary leading-relaxed'>
        Thank you for shopping with CustomCollection! We'll send you an email with your order details and shipping updates.
      </p>

      <div className='flex flex-col sm:flex-row gap-3 justify-center'>
        {orderNumber && (
          <Button>
            <Link href={`/account/orders/${orderNumber}`} className='flex items-center gap-2'>
              <Package size={14} /> Track Order
            </Link>
          </Button>
        )}
        <Button variant='secondary'>
          <Link href='/products'>Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 py-16 bg-background pt-24'>
      <Suspense fallback={<div className='h-40' />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
