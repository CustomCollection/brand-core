import { classNames } from '@/lib/utils';

const variantStyles = {
  default: 'bg-surface text-text-primary border border-border',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-success-light text-success border border-success/20',
  error: 'bg-error-light text-error border border-error/20',
  warning: 'bg-warning-light text-warning border border-warning/20',
  info: 'bg-info-light text-info border border-info/20',
  dark: 'bg-primary text-white',
  outline: 'bg-transparent text-text-primary border border-border',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
  lg: 'px-3 py-1.5 text-sm',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  ...props
}) {
  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1.5 font-medium uppercase tracking-wider',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={classNames(
            'inline-block h-1.5 w-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'error' && 'bg-error',
            variant === 'warning' && 'bg-warning',
            variant === 'info' && 'bg-info',
            variant === 'accent' && 'bg-accent',
            variant === 'dark' && 'bg-white',
            (variant === 'default' || variant === 'outline') && 'bg-text-secondary'
          )}
        />
      )}
      {children}
    </span>
  );
}
