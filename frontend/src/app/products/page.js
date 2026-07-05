import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductCard from '@/components/product/ProductCard';

export const metadata = {
  title: 'Shop All',
  description: 'Shop our premium collection of curated fashion.',
};

async function getProducts(searchParams) {
  try {
    const query = new URLSearchParams(searchParams).toString();
    const endpoint = query ? `${ENDPOINTS.PRODUCTS.LIST}?${query}` : ENDPOINTS.PRODUCTS.LIST;
    return await apiGet(endpoint, { cache: 'no-store' });
  } catch (error) {
    console.error('Error fetching products:', error);
    return { results: [], count: 0, next: null, previous: null };
  }
}

async function getFilters() {
  try {
    // Assuming backend provides these endpoints or we can derive them
    const [collections, tags] = await Promise.all([
      apiGet(ENDPOINTS.COLLECTIONS.LIST).catch(() => ({ results: [] })),
      apiGet(ENDPOINTS.TAGS.LIST).catch(() => ({ results: [] }))
    ]);
    return { collections: collections.results || [], tags: tags.results || [] };
  } catch {
    return { collections: [], tags: [] };
  }
}

export default async function ProductsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const [data, filters] = await Promise.all([
    getProducts(resolvedSearchParams),
    getFilters()
  ]);

  const products = data?.results || [];
  
  return (
    <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-background min-h-screen">
      <div className="mb-12 text-center pt-8">
        <h1 className="text-4xl font-light uppercase tracking-widest text-text-primary">Shop All</h1>
        <div className="mx-auto mt-4 h-px w-16 bg-accent" />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-10">
            {/* Collections */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4 border-b border-border pb-2">Collections</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/products" className="text-sm text-text-secondary hover:text-accent">
                    All Collections
                  </Link>
                </li>
                {filters.collections.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/products?collection=${c.slug}`} className="text-sm text-text-secondary hover:text-accent">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sizes (Hardcoded common sizes for UI mockup) */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4 border-b border-border pb-2">Size</h3>
              <div className="grid grid-cols-3 gap-2">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                  <Link 
                    href={`/products?size=${size}`} 
                    key={size}
                    className="border border-border py-2 text-center text-xs text-text-secondary hover:border-accent hover:text-accent transition-colors"
                  >
                    {size}
                  </Link>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4 border-b border-border pb-2">Color</h3>
              <div className="flex flex-wrap gap-3">
                {[
                  { name: 'Black', hex: '#000000' },
                  { name: 'White', hex: '#FFFFFF' },
                  { name: 'Navy', hex: '#000080' },
                  { name: 'Beige', hex: '#F5F5DC' }
                ].map((color) => (
                  <Link 
                    href={`/products?color=${color.name.toLowerCase()}`}
                    key={color.name}
                    className="h-6 w-6 rounded-full border border-border shadow-sm hover:scale-110 transition-transform"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Tags */}
            {filters.tags.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary mb-4 border-b border-border pb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((t) => (
                    <Link 
                      href={`/products?tag=${t.slug}`}
                      key={t.slug}
                      className="bg-surface px-3 py-1 text-xs text-text-secondary hover:bg-accent hover:text-primary transition-colors"
                    >
                      {t.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
            <span className="text-sm text-text-secondary">{data?.count || products.length} Products</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-secondary">Sort by:</span>
              <select className="bg-transparent text-sm text-text-primary focus:outline-none focus:ring-0 cursor-pointer">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-text-muted">No products found matching your criteria.</p>
              <Link href="/products" className="mt-4 inline-block text-sm text-accent hover:underline">
                Clear all filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {(data?.next || data?.previous) && (
            <div className="mt-16 flex justify-center gap-4 border-t border-border pt-8">
              {data.previous && (
                <Link href={`/products?page=${new URL(data.previous).searchParams.get('page') || 1}`} className="px-6 py-2 text-sm border border-border hover:border-accent hover:text-accent transition-colors">
                  Previous
                </Link>
              )}
              {data.next && (
                <Link href={`/products?page=${new URL(data.next).searchParams.get('page') || 2}`} className="px-6 py-2 text-sm border border-border hover:border-accent hover:text-accent transition-colors">
                  Next
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
