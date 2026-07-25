'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AccountSidebar from '@/components/account/AccountSidebar';
import Spinner from '@/components/ui/Spinner';

export default function AccountLayout({ children }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account/profile');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center'>
        <Spinner size='lg' className='text-accent' />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='flex flex-col lg:flex-row gap-10'>
          <AccountSidebar />
          <main className='flex-1 min-w-0'>{children}</main>
        </div>
      </div>
    </div>
  );
}
