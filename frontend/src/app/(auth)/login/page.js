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
  const nextUrl = searchParams.get('next') || '/profile';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await login({ email, password });
      toast.success('Successfully logged in.');
      router.push(nextUrl);
    } catch (error) {
      toast.error(error.message || 'Invalid email or password.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background px-8 py-10 shadow-sm border border-border">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        
        <div className="space-y-1">
          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-end mt-2">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-text-secondary hover:text-primary transition-colors link-underline"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-text-secondary">Don't have an account? </span>
        <Link href="/register" className="font-medium text-primary hover:text-accent transition-colors link-underline">
          Create Account
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-3xl font-light uppercase tracking-widest text-primary">
          Sign In
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Welcome back to Brand Core
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100">
        <Suspense fallback={<div className="h-64 animate-pulse bg-background border border-border"></div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
