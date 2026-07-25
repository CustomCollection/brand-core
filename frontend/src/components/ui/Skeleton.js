import { cn } from '@/lib/utils';

export default function Skeleton({ className = '', variant = 'rectangle' }) {
  const base = cn(
    'animate-shimmer bg-gradient-to-r from-surface via-surface-hover to-surface bg-[length:200%_100%]',
    className
  );

  if (variant === 'circle') {
    return <div className={cn(base, 'rounded-full')} />;
  }
  if (variant === 'text') {
    return <div className={cn(base, 'h-4 rounded')} />;
  }
  return <div className={base} />;
}

export function ProductCardSkeleton() {
  return (
    <div className='space-y-3'>
      <Skeleton className='aspect-[3/4] w-full' />
      <Skeleton variant='text' className='w-3/4' />
      <Skeleton variant='text' className='w-1/4' />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
