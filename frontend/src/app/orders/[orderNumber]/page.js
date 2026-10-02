'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function OrderRedirectPage({ params }) {
  const resolved = typeof params?.then === 'function' ? use(params) : params;
  const router = useRouter();

  useEffect(() => {
    if (resolved?.orderNumber) {
      router.replace(`/account/orders/${encodeURIComponent(resolved.orderNumber)}`);
    } else {
      router.replace('/account/orders');
    }
  }, [resolved, router]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Spinner size='lg' className='text-accent' />
    </div>
  );
}
