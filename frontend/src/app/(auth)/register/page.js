'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({
        ...formData,
        password_confirm: formData.password,
      });
      toast.success('Registration successful. Please check your email to verify your account.');
      router.push('/login');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col justify-center px-4 py-12 sm:px-6 lg:px-8 bg-surface">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        <h2 className="mt-6 text-center text-3xl font-light uppercase tracking-widest text-primary">
          Create Account
        </h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Join Brand Core for exclusive access
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100">
        <div className="bg-background px-8 py-10 shadow-sm border border-border">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
              />
              <Input
                label="Last Name"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            
            <Input
              label="Email Address"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />

            <Button type="submit" fullWidth isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-text-secondary">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:text-accent transition-colors link-underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
