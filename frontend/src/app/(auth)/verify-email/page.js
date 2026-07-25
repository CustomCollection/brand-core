'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [status, setStatus] = useState('idle'); // 'idle' | 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleVerify = async () => {
    if (!uid || !token) return;
    setStatus('verifying');
    try {
      const data = await apiPost(ENDPOINTS.AUTH.VERIFY_EMAIL, { uid, token });
      setStatus('success');
      setMessage(data?.message || 'Email verified successfully.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Verification link is invalid or expired.');
    }
  };

  if (!uid || !token) {
    return (
      <div className='text-center space-y-4 max-w-sm mx-auto'>
        <XCircle size={48} className='text-error mx-auto' />
        <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary'>
          Invalid Link
        </h1>
        <p className='text-sm text-text-secondary'>
          This verification link is invalid or incomplete. Please check the email link again.
        </p>
        <Link
          href='/'
          className='inline-block mt-4 bg-primary text-background px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors'
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className='text-center max-w-md mx-auto space-y-6 animate-fade-in-up'>
      {status === 'idle' && (
        <div className='space-y-6'>
          <div className='w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto'>
            <ShieldCheck size={32} className='text-accent' />
          </div>
          <div>
            <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
              Verify Account
            </h1>
            <p className='text-sm text-text-secondary mt-2 leading-relaxed'>
              Please confirm your email verification to activate your account and start shopping.
            </p>
          </div>
          <Button onClick={handleVerify} size='lg' fullWidth>
            Confirm Verification
          </Button>
        </div>
      )}

      {status === 'verifying' && (
        <div className='space-y-4 py-8'>
          <Spinner size='lg' className='text-accent mx-auto' />
          <p className='text-sm text-text-secondary'>Activating your account...</p>
        </div>
      )}

      {status === 'success' && (
        <div className='space-y-6'>
          <div className='w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto'>
            <CheckCircle size={32} className='text-success' />
          </div>
          <div>
            <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
              Thank You!
            </h1>
            <p className='text-sm font-medium text-success mt-2'>
              Email verified successfully.
            </p>
            <p className='text-sm text-text-secondary mt-2 leading-relaxed'>
              Your profile is verified and active. You can now sign in and explore premium clothing.
            </p>
          </div>
          <Button fullWidth>
            <Link href='/login' className='block w-full text-center'>
              Sign In
            </Link>
          </Button>
        </div>
      )}

      {status === 'error' && (
        <div className='space-y-6'>
          <div className='w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mx-auto'>
            <XCircle size={32} className='text-error' />
          </div>
          <div>
            <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
              Verification Failed
            </h1>
            <p className='text-sm text-error mt-2 leading-relaxed'>
              {message}
            </p>
          </div>
          <div className='space-y-3'>
            <Button onClick={handleVerify} fullWidth>
              Try Again
            </Button>
            <Link
              href='/login'
              className='block text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-primary transition-colors'
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className='flex min-h-[85vh] flex-col items-center justify-center px-4 py-16 bg-surface pt-28'>
      <div className='bg-background px-8 py-10 shadow-sm border border-border w-full max-w-md'>
        <Suspense fallback={
          <div className='text-center py-8'>
            <Spinner size='lg' className='text-accent mx-auto' />
            <p className='text-sm text-text-secondary mt-4'>Loading verification portal...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
