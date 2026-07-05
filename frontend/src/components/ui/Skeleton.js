import { classNames } from '@/lib/utils';

const variantStyles = {
  text: 'h-4 w-full rounded',
  title: 'h-6 w-3/4 rounded',
  image: 'aspect-square w-full rounded-none',
  card: 'h-72 w-full rounded-none',
  circle: 'rounded-full',
  button: 'h-10 w-32 rounded-none',
  line: 'h-3 rounded',
};

export default function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  count = 1,
  gap = 'gap-3',
}) {
  const elements = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={classNames('flex flex-col', gap)} role="status" aria-label="Loading">
      {elements.map((i) => (
        <div
          key={i}
          className={classNames(
            'animate-shimmer bg-gradient-to-r from-border-light via-surface-hover to-border-light bg-[length:400%_100%]',
            variantStyles[variant],
            className
          )}
          style={{
            width: width || undefined,
            height: height || undefined,
          }}
        />
      ))}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
