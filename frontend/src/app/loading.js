import Spinner from '@/components/ui/Spinner';

export default function GlobalLoading() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-background'>
      <Spinner size='lg' className='text-accent' />
    </div>
  );
}
