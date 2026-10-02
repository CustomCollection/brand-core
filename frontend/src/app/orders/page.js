'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Spinner from '@/components/ui/Spinner';

export default function OrdersIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/account/orders');
  }, [router]);

  return (
    <div className='flex min-h-[60vh] items-center justify-center'>
      <Spinner size='lg' className='text-accent' />
    </div>
  );
}
