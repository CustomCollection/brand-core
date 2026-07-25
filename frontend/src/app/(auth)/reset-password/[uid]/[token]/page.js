'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage({ params }) {
  const { uid, token } = params;
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.warning('Password must be at least 8 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.RESET_PASSWORD, {
        uid,
        token,
        password,
        password_confirm: password,
      });
      toast.success('Password reset successful. Please sign in.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Reset link is invalid or expired.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-surface pt-24'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up'>
        <h1 className='text-center text-3xl font-light uppercase tracking-widest text-text-primary'>
          Reset Password
        </h1>
        <p className='mt-2 text-center text-sm text-text-secondary'>
          Enter your new password below.
        </p>
      </div>
      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100'>
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
            <Button type='submit' fullWidth isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
          <div className='mt-6 text-center'>
            <Link href='/login' className='text-xs text-text-secondary hover:text-accent transition-colors'>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
