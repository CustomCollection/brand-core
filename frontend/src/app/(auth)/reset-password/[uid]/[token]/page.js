'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResetPasswordPage({ params }) {
  const unwrappedParams = use(params);
  const { uid, token } = unwrappedParams;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.AUTH.RESET_PASSWORD, { uid, token, new_password: password });
      toast.success('Password has been reset successfully.');
      router.push('/login');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password. The link might be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-3xl font-light uppercase tracking-widest text-primary">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Please enter your new password below.
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100">
        <div className="bg-background px-8 py-10 shadow-sm border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="New Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
