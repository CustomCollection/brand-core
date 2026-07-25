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
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // AuthContext.register() handles adding password_confirm
      await register(formData);
      toast.success('Account created! Please check your email to verify your account.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex min-h-[80vh] flex-col justify-center px-4 py-16 sm:px-6 lg:px-8 bg-surface pt-24'>
      <div className='sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up'>
        <h1 className='text-center text-3xl font-light uppercase tracking-widest text-text-primary'>
          Create Account
        </h1>
        <p className='mt-2 text-center text-sm text-text-secondary'>
          Join CustomCollection for exclusive access
        </p>
      </div>

      <div className='mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up animate-delay-100'>
        <div className='bg-background px-8 py-10 shadow-sm border border-border'>
          <form className='space-y-6' onSubmit={handleSubmit}>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
              <Input
                label='First Name'
                name='first_name'
                id='first_name'
                required
                autoComplete='given-name'
                value={formData.first_name}
                onChange={handleChange}
              />
              <Input
                label='Last Name'
                name='last_name'
                id='last_name'
                required
                autoComplete='family-name'
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
            <Input
              label='Email Address'
              type='email'
              name='email'
              id='email'
              required
              autoComplete='email'
              value={formData.email}
              onChange={handleChange}
            />
            <Input
              label='Password'
              type='password'
              name='password'
              id='password'
              required
              autoComplete='new-password'
              value={formData.password}
              onChange={handleChange}
              helperText='Minimum 8 characters'
            />

            <Button type='submit' fullWidth isLoading={isSubmitting}>
              Create Account
            </Button>
          </form>

          <div className='mt-8 text-center text-sm'>
            <span className='text-text-secondary'>Already have an account? </span>
            <Link
              href='/login'
              className='font-medium text-primary hover:text-accent transition-colors link-underline'
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
