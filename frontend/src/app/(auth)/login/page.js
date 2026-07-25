'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      // Support both 'redirect' and 'next' query params
      const redirect = searchParams.get('redirect') || searchParams.get('next') || '/';
      router.push(redirect);
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  return (
    <form className='space-y-6' onSubmit={handleSubmit}>
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
      <Input
        label='Password'
        type='password'
        name='password'
        id='password'
        required
        autoComplete='current-password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className='flex items-center justify-end'>
        <Link
          href='/forgot-password'
          className='text-xs text-text-secondary hover:text-accent transition-colors'
        >
          Forgot password?
        </Link>
      </div>
      <Button type='submit' fullWidth isLoading={isSubmitting}>
        Sign In
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className='flex min-h-[80vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-surface pt-24'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up'>
        <h1 className='text-center text-3xl font-light uppercase tracking-widest text-text-primary'>
          Sign In
        </h1>
        <p className='mt-2 text-center text-sm text-text-secondary'>
          Welcome back to CustomCollection
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100'>
        <div className='bg-background px-8 py-10 shadow-sm border border-border'>
          <Suspense fallback={<div className='h-64' />}>
            <LoginForm />
          </Suspense>

          <div className='mt-8 text-center text-sm'>
            <span className='text-text-secondary'>Don't have an account? </span>
            <Link
              href='/register'
              className='font-medium text-primary hover:text-accent transition-colors link-underline'
            >
              Create one
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
