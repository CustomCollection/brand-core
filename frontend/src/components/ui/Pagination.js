'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ currentPage, totalPages, baseUrl }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goToPage = (page) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const pages = [];
  const delta = 2;
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push('...');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('...');
  if (end < totalPages) pages.push(totalPages);

  const btnBase =
    'flex h-9 w-9 items-center justify-center text-sm font-medium transition-colors duration-150 border';

  return (
    <nav className='flex items-center justify-center gap-1 py-8' aria-label='Pagination'>
      <button
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          btnBase,
          'border-border text-text-secondary hover:border-primary hover:text-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label='Previous page'
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className='px-2 text-text-muted'>
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => goToPage(page)}
            className={cn(
              btnBase,
              currentPage === page
                ? 'bg-primary border-primary text-background'
                : 'border-border text-text-secondary hover:border-primary hover:text-primary'
            )}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          btnBase,
          'border-border text-text-secondary hover:border-primary hover:text-primary',
          'disabled:opacity-40 disabled:cursor-not-allowed'
        )}
        aria-label='Next page'
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
