'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Input({
  label,
  type = 'text',
  name,
  id,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = '',
  className = '',
  autoComplete,
  variant = 'outline', // 'outline' | 'underline'
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  const baseInput = cn(
    'w-full bg-transparent text-text-primary placeholder:text-text-muted',
    'transition-colors duration-200',
    'focus:outline-none',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    error ? 'border-error' : 'border-border focus:border-primary',
    type === 'password' ? 'pr-10' : '',
    variant === 'outline'
      ? 'border rounded-none px-4 py-3 text-sm'
      : 'border-b border-t-0 border-l-0 border-r-0 px-0 py-2 text-sm'
  );

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className='text-xs font-semibold uppercase tracking-wider text-text-primary'
        >
          {label}
          {required && <span className='ml-1 text-error'>*</span>}
        </label>
      )}
      <div className='relative'>
        <input
          id={inputId}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={baseInput}
          {...props}
        />
        {type === 'password' && (
          <button
            type='button'
            onClick={() => setShowPassword((v) => !v)}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors'
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {error && (
        <p className='text-xs text-error'>{error}</p>
      )}
      {!error && helperText && (
        <p className='text-xs text-text-muted'>{helperText}</p>
      )}
    </div>
  );
}
