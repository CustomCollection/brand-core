'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, XCircle } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const uid = searchParams.get('uid');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  if (!uid || !token) {
    return (
      <div className='text-center space-y-4 max-w-sm mx-auto animate-fade-in-up'>
        <XCircle size={48} className='text-error mx-auto' />
        <h1 className='text-2xl font-light uppercase tracking-widest text-text-primary'>
          Invalid Reset Link
        </h1>
        <p className='text-sm text-text-secondary'>
          This password reset link is invalid or incomplete. Please request a new one.
        </p>
        <Link
          href='/forgot-password'
          className='inline-block mt-4 bg-primary text-background px-8 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent transition-colors'
        >
          Request Reset Link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.warning('Password must be at least 8 characters.');
      return;
    }
    if (password !== passwordConfirm) {
      toast.warning('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.RESET_PASSWORD, {
        uid,
        token,
        password,
        password_confirm: passwordConfirm,
      });
      toast.success('Password reset successfully. Please sign in with your new password.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Reset link is invalid or expired. Please request a new link.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='animate-fade-in-up'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md text-center'>
        <div className='w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4'>
          <ShieldCheck size={28} className='text-accent' />
        </div>
        <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
          Reset Password
        </h1>
        <p className='mt-2 text-sm text-text-secondary'>
          Enter your new password below to update your account.
        </p>
      </div>

      <div className='mt-8 sm:mx-auto sm:w-full sm:max-w-md'>
        <div className='bg-background px-8 py-10 shadow-sm border border-border'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <Input
              label='New Password'
              type='password'
              name='password'
              id='password'
              required
              autoComplete='new-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText='Minimum 8 characters'
            />
            <Input
              label='Confirm New Password'
              type='password'
              name='password_confirm'
              id='password_confirm'
              required
              autoComplete='new-password'
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
            <Button type='submit' fullWidth isLoading={isSubmitting}>
              Update Password
            </Button>
          </form>
          <div className='mt-6 text-center'>
            <Link
              href='/login'
              className='text-xs text-text-secondary hover:text-accent transition-colors'
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className='flex min-h-[80vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-surface pt-24'>
      <Suspense
        fallback={
          <div className='flex justify-center py-12'>
            <Spinner size='lg' />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
