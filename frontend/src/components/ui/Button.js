'use client';

import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-primary text-background hover:bg-text-primary border border-primary hover:border-text-primary',
  secondary:
    'bg-transparent text-primary border border-primary hover:bg-primary hover:text-background',
  ghost:
    'bg-transparent text-text-primary border border-transparent hover:border-border',
  danger:
    'bg-error text-background border border-error hover:opacity-90',
  accent:
    'bg-accent text-background border border-accent hover:bg-accent-dark hover:border-accent-dark',
  outline:
    'bg-transparent text-text-primary border border-border hover:border-primary',
};

const SIZES = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-medium uppercase tracking-widest',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && <Spinner size='sm' />}
      {children}
    </button>
  );
}
