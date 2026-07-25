'use client';

import { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-background'>
      <p className='text-xs font-semibold uppercase tracking-widest text-error'>Error</p>
      <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
        Something went wrong
      </h1>
      <p className='text-text-secondary max-w-sm'>
        {error?.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
