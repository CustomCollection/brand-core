'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

export default function VerifyEmailPage({ params }) {
  const unwrappedParams = use(params);
  const { uid, token } = unwrappedParams;
  const [status, setStatus] = useState('loading'); // loading, success, error
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await apiPost(ENDPOINTS.AUTH.VERIFY_EMAIL, { uid, token });
        setStatus('success');
        toast.success('Email verified successfully.');
      } catch (error) {
        setStatus('error');
        toast.error(error.message || 'Invalid or expired verification link.');
      }
    };

    if (uid && token) {
      verifyEmail();
    }
  }, [uid, token, toast]);

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-3xl font-light uppercase tracking-widest text-primary">
          Email Verification
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100">
        <div className="bg-background px-8 py-10 shadow-sm border border-border text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Spinner size="lg" className="text-primary" />
              <p className="text-text-secondary animate-pulse">Verifying your email address...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
                <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-primary font-medium">Your email has been verified!</p>
              <Button fullWidth onClick={() => router.push('/login')}>
                Continue to Login
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-light">
                <svg className="h-6 w-6 text-error" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-error">The verification link is invalid or has expired.</p>
              <Button variant="secondary" fullWidth onClick={() => router.push('/login')}>
                Back to Login
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
