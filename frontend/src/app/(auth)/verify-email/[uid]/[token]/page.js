'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Spinner from '@/components/ui/Spinner';

export default function VerifyEmailPage({ params }) {
  const { uid, token } = params;
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const data = await apiPost(ENDPOINTS.AUTH.VERIFY_EMAIL, { uid, token });
        setStatus('success');
        setMessage(data?.message || 'Email verified successfully.');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or expired.');
      }
    };
    verify();
  }, [uid, token]);

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 bg-background'>
      {status === 'loading' && (
        <div className='text-center space-y-4'>
          <Spinner size='lg' className='text-accent mx-auto' />
          <p className='text-sm text-text-secondary'>Verifying your email…</p>
        </div>
      )}

      {status === 'success' && (
        <div className='text-center space-y-4 max-w-sm'>
          <CheckCircle size={48} className='text-success mx-auto' />
          <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary'>Email Verified</h1>
          <p className='text-sm text-text-secondary'>{message}</p>
          <Link
            href='/login'
            className='inline-block mt-4 bg-primary text-background px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors'
          >
            Sign In
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className='text-center space-y-4 max-w-sm'>
          <XCircle size={48} className='text-error mx-auto' />
          <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary'>Verification Failed</h1>
          <p className='text-sm text-text-secondary'>{message}</p>
          <Link
            href='/login'
            className='inline-block mt-4 bg-primary text-background px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors'
          >
            Back to Sign In
          </Link>
        </div>
      )}
    </div>
  );
}
