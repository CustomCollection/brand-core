import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center bg-background'>
      <p className='text-xs font-semibold uppercase tracking-widest text-accent'>404</p>
      <h1 className='text-4xl font-light uppercase tracking-widest text-text-primary'>
        Page Not Found
      </h1>
      <p className='text-text-secondary max-w-sm'>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className='flex gap-4'>
        <Button>
          <Link href='/'>Go Home</Link>
        </Button>
        <Button variant='secondary'>
          <Link href='/products'>Shop All</Link>
        </Button>
      </div>
    </div>
  );
}
