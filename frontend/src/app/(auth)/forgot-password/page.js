'use client';

import { useState } from 'react';
import Link from 'next/link';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setSubmitted(true);
    } catch (err) {
      // Always show success to prevent email enumeration (backend always returns 200)
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-surface pt-24'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up'>
        <h1 className='text-center text-3xl font-light uppercase tracking-widest text-text-primary'>
          Forgot Password
        </h1>
        <p className='mt-2 text-center text-sm text-text-secondary'>
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100'>
        <div className='bg-background px-8 py-10 shadow-sm border border-border'>
          {submitted ? (
            <div className='text-center space-y-4'>
              <div className='w-12 h-12 rounded-full bg-success-light flex items-center justify-center mx-auto'>
                <span className='text-success text-xl'>&#10003;</span>
              </div>
              <p className='text-sm font-medium text-text-primary'>Check your email</p>
              <p className='text-sm text-text-secondary'>
                If an account with that email exists, we've sent a password reset link.
              </p>
              <Link
                href='/login'
                className='block text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors mt-4'
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              <Input
                label='Email Address'
                type='email'
                name='email'
                id='email'
                required
                autoComplete='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type='submit' fullWidth isLoading={isSubmitting}>
                Send Reset Link
              </Button>
              <div className='text-center'>
                <Link
                  href='/login'
                  className='text-xs text-text-secondary hover:text-accent transition-colors'
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
