import { Suspense } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { buildQueryString } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';

export const metadata = {
  title: 'Search',
  description: 'Search for products at CustomCollection.',
};

async function searchProducts(q, page = 1) {
  if (!q) return { results: [], count: 0, total_pages: 0, current_page: 1 };
  try {
    const query = buildQueryString({ q, page });
    return await apiGet(`${ENDPOINTS.SEARCH}?${query}`, { cache: 'no-store' });
  } catch {
    return { results: [], count: 0, total_pages: 0, current_page: 1 };
  }
}

export default async function SearchPage({ searchParams }) {
  const resolvedSearch = await searchParams;
  const q = resolvedSearch.q || '';
  const page = parseInt(resolvedSearch.page || '1', 10);

  const data = await searchProducts(q, page);
  const products = data?.results || [];
  const count = data?.count || 0;
  const totalPages = data?.total_pages || 0;
  const currentPage = data?.current_page || 1;

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-10'>
          <div className='flex items-center gap-3 mb-2'>
            <Search size={20} className='text-accent' />
            <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>
              Search Results
            </h1>
          </div>
          {q && (
            <p className='text-sm text-text-muted'>
              {count} result{count !== 1 ? 's' : ''} for "{q}"
            </p>
          )}
        </div>

        {!q ? (
          <div className='py-20 text-center'>
            <p className='text-text-muted'>Enter a search term to find products.</p>
          </div>
        ) : products.length === 0 ? (
          <div className='py-20 text-center'>
            <p className='text-lg font-light text-text-muted'>No results for "{q}"</p>
            <p className='text-sm text-text-muted mt-2'>Try different keywords or browse our collections.</p>
            <div className='flex justify-center gap-4 mt-8'>
              <Link
                href='/products'
                className='text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors'
              >
                Browse All Products
              </Link>
              <Link
                href='/collections'
                className='text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors'
              >
                View Collections
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} />
          </>
        )}
      </div>
    </div>
  );
}
