import { Suspense } from 'react';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';
import { buildQueryString } from '@/lib/utils';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { SORT_OPTIONS } from '@/lib/constants';

export const metadata = {
  title: 'Shop All Products',
  description: 'Browse our full collection of premium clothing.',
};

async function getProducts(params) {
  try {
    const { page = 1, collection, tag, min_price, max_price, size, color,
      is_featured, is_best_seller, is_new_arrival, ordering = '-created_at', search } = params;

    const query = buildQueryString({
      page,
      collection,
      tag,
      min_price,
      max_price,
      size,
      color,
      is_featured,
      is_best_seller,
      is_new_arrival,
      ordering,
      search,
    });

    return await apiGet(`${ENDPOINTS.PRODUCTS.LIST}${query ? '?' + query : ''}`, {
      cache: 'no-store',
    });
  } catch {
    return { results: [], count: 0, total_pages: 0, current_page: 1 };
  }
}

async function getFilters() {
  try {
    const [collections, tags, sizes, colors] = await Promise.all([
      apiGet(ENDPOINTS.COLLECTIONS.LIST).catch(() => []),
      apiGet(ENDPOINTS.TAGS.LIST).catch(() => []),
      apiGet(ENDPOINTS.PRODUCTS.SIZES).catch(() => []),
      apiGet(ENDPOINTS.PRODUCTS.COLORS).catch(() => []),
    ]);
    return {
      collections: Array.isArray(collections) ? collections : [],
      tags: Array.isArray(tags) ? tags : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      colors: Array.isArray(colors) ? colors : [],
    };
  } catch {
    return { collections: [], tags: [], sizes: [], colors: [] };
  }
}

function FilterLink({ href, isActive, children }) {
  return (
    <Link
      href={href}
      className={`block text-sm py-1.5 transition-colors ${
        isActive
          ? 'text-text-primary font-semibold'
          : 'text-text-secondary hover:text-text-primary'
      }`}
    >
      {isActive ? '\u2022 ' : ''}{children}
    </Link>
  );
}

export default async function ProductsPage({ searchParams }) {
  const resolvedParams = await searchParams;
  const [data, filters] = await Promise.all([
    getProducts(resolvedParams),
    getFilters(),
  ]);

  const products = data?.results || [];
  const totalPages = data?.total_pages || 0;
  const currentPage = data?.current_page || 1;
  const count = data?.count || 0;

  const activeCollection = resolvedParams.collection || '';
  const activeTag = resolvedParams.tag || '';
  const activeSize = resolvedParams.size || '';
  const activeColor = resolvedParams.color || '';
  const activeOrdering = resolvedParams.ordering || '-created_at';

  // Build a URL preserving current params but changing one
  const makeFilterUrl = (key, value) => {
    const params = new URLSearchParams(resolvedParams);
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('page'); // Reset pagination on filter change
    return `/products?${params.toString()}`;
  };

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* Page header */}
        <div className='mb-8 border-b border-border pb-6'>
          <h1 className='text-3xl font-light uppercase tracking-widest text-text-primary'>Shop All</h1>
          <p className='text-sm text-text-muted mt-1'>{count} product{count !== 1 ? 's' : ''}</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-10'>
          {/* ─── Sidebar Filters ─── */}
          <aside className='w-full lg:w-56 flex-shrink-0'>
            <div className='space-y-8'>
              {/* Sort */}
              <div>
                <h3 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3 border-b border-border pb-2'>
                  Sort By
                </h3>
                <div className='space-y-0.5'>
                  {SORT_OPTIONS.map((opt) => (
                    <FilterLink
                      key={opt.value}
                      href={makeFilterUrl('ordering', opt.value)}
                      isActive={activeOrdering === opt.value}
                    >
                      {opt.label}
                    </FilterLink>
                  ))}
                </div>
              </div>

              {/* Collections */}
              {filters.collections.length > 0 && (
                <div>
                  <h3 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3 border-b border-border pb-2'>
                    Collection
                  </h3>
                  <div className='space-y-0.5'>
                    <FilterLink href='/products' isActive={!activeCollection}>
                      All
                    </FilterLink>
                    {filters.collections.map((c) => (
                      <FilterLink
                        key={c.id}
                        href={makeFilterUrl('collection', c.slug)}
                        isActive={activeCollection === c.slug}
                      >
                        {c.name}
                      </FilterLink>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {filters.sizes.length > 0 && (
                <div>
                  <h3 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3 border-b border-border pb-2'>
                    Size
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {filters.sizes.map((s) => (
                      <Link
                        key={s.id}
                        href={makeFilterUrl('size', activeSize === s.name ? '' : s.name)}
                        className={`h-8 min-w-[32px] px-2 border text-xs font-medium transition-all flex items-center justify-center ${
                          activeSize === s.name
                            ? 'border-primary bg-primary text-background'
                            : 'border-border text-text-primary hover:border-primary'
                        }`}
                      >
                        {s.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Colors */}
              {filters.colors.length > 0 && (
                <div>
                  <h3 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3 border-b border-border pb-2'>
                    Color
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {filters.colors.map((c) => (
                      <Link
                        key={c.id}
                        href={makeFilterUrl('color', activeColor === c.name ? '' : c.name)}
                        title={c.name}
                        aria-label={c.name}
                        className={`h-7 w-7 rounded-full border-2 transition-all ${
                          activeColor === c.name
                            ? 'border-primary scale-110'
                            : 'border-transparent hover:border-border'
                        }`}
                        style={{ backgroundColor: c.hex_code }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {filters.tags.length > 0 && (
                <div>
                  <h3 className='text-xs font-semibold uppercase tracking-widest text-text-primary mb-3 border-b border-border pb-2'>
                    Style
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {filters.tags.map((t) => (
                      <Link
                        key={t.id}
                        href={makeFilterUrl('tag', activeTag === t.slug ? '' : t.slug)}
                        className={`px-3 py-1 border text-xs font-medium transition-all ${
                          activeTag === t.slug
                            ? 'border-primary bg-primary text-background'
                            : 'border-border text-text-primary hover:border-primary'
                        }`}
                      >
                        {t.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear filters */}
              {(activeCollection || activeTag || activeSize || activeColor) && (
                <Link
                  href='/products'
                  className='text-xs font-semibold uppercase tracking-widest text-error hover:text-error/80 transition-colors'
                >
                  Clear Filters ×
                </Link>
              )}
            </div>
          </aside>

          {/* ─── Product grid ─── */}
          <div className='flex-1'>
            {products.length === 0 ? (
              <div className='flex flex-col items-center justify-center py-24 text-center'>
                <p className='text-lg font-light text-text-muted'>No products found.</p>
                <p className='text-sm text-text-muted mt-2'>Try adjusting your filters.</p>
                <Link href='/products' className='mt-6 text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors'>
                  Clear all filters
                </Link>
              </div>
            ) : (
              <>
                <div className='grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4'>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
