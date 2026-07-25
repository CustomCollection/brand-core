import { cn } from '@/lib/utils';

const VARIANTS = {
  default: 'bg-surface text-text-secondary border border-border',
  primary: 'bg-primary text-background',
  success: 'bg-success-light text-success border border-success',
  error: 'bg-error-light text-error border border-error',
  warning: 'bg-warning-light text-warning border border-warning',
  info: 'bg-info-light text-info border border-info',
  accent: 'bg-accent text-background',
  outline: 'bg-transparent text-text-primary border border-border',
};

export default function Badge({ children, variant = 'default', dot = false, className = '' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider',
        VARIANTS[variant] || VARIANTS.default,
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'error' && 'bg-error',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-info',
            !['success', 'error', 'warning', 'info'].includes(variant) && 'bg-current'
          )}
        />
      )}
      {children}
    </span>
  );
}
