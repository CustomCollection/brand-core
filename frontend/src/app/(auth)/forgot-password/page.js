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
  const [isSent, setIsSent] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      setIsSent(true);
      toast.success('Password reset link sent to your email.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-3xl font-light uppercase tracking-widest text-primary">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Enter your email to receive a reset link
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100">
        <div className="bg-background px-8 py-10 shadow-sm border border-border">
          {isSent ? (
            <div className="text-center space-y-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success-light">
                <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-text-secondary">
                We have sent a password reset link to <span className="font-medium text-primary">{email}</span>. Please check your inbox.
              </p>
              <Button variant="secondary" fullWidth onClick={() => setIsSent(false)}>
                Try another email
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email Address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button type="submit" fullWidth isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-sm">
            <Link href="/login" className="font-medium text-text-secondary hover:text-primary transition-colors link-underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
