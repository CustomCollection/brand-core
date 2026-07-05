'use client';

import { forwardRef } from 'react';
import { classNames } from '@/lib/utils';
import Spinner from '@/components/ui/Spinner';

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary/90 active:bg-primary/80 focus-visible:ring-primary/50',
  secondary:
    'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white active:bg-primary/90 focus-visible:ring-primary/50',
  ghost:
    'text-text-primary bg-transparent hover:bg-surface active:bg-surface-hover focus-visible:ring-primary/50',
  danger:
    'bg-error text-white hover:bg-error/90 active:bg-error/80 focus-visible:ring-error/50',
  accent:
    'bg-accent text-primary hover:bg-accent-light active:bg-accent-dark focus-visible:ring-accent/50',
};

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled = false,
    fullWidth = false,
    className,
    type = 'button',
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={classNames(
        'inline-flex items-center justify-center gap-2 font-medium uppercase tracking-wider transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-1" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
