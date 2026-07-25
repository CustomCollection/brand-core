import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { buildQueryString } from '@/lib/utils';
import ProductCard from '@/components/product/ProductCard';
import Pagination from '@/components/ui/Pagination';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const collection = await apiGet(ENDPOINTS.COLLECTIONS.DETAIL(slug));
    return {
      title: collection.meta_title || collection.name,
      description: collection.meta_description || collection.description,
    };
  } catch {
    return { title: 'Collection Not Found' };
  }
}

async function getCollection(slug) {
  try {
    return await apiGet(ENDPOINTS.COLLECTIONS.DETAIL(slug));
  } catch {
    return null;
  }
}

async function getProducts(slug, page = 1) {
  try {
    const query = buildQueryString({ collection: slug, page });
    return await apiGet(`${ENDPOINTS.PRODUCTS.LIST}?${query}`, { cache: 'no-store' });
  } catch {
    return { results: [], count: 0, total_pages: 0, current_page: 1 };
  }
}

export default async function CollectionDetailPage({ params, searchParams }) {
  const { slug } = await params;
  const resolvedSearch = await searchParams;
  const page = parseInt(resolvedSearch.page || '1', 10);

  const [collection, data] = await Promise.all([
    getCollection(slug),
    getProducts(slug, page),
  ]);

  if (!collection) notFound();

  const products = data?.results || [];
  const totalPages = data?.total_pages || 0;
  const currentPage = data?.current_page || 1;

  return (
    <div className='bg-background pt-16'>
      {/* Hero */}
      <div className='relative bg-primary py-20 overflow-hidden'>
        {collection.image_url && (
          <Image
            src={collection.image_url}
            alt={collection.name}
            fill
            className='object-cover opacity-30'
            sizes='100vw'
            priority
          />
        )}
        <div className='relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center'>
          <nav className='flex justify-center items-center gap-2 text-xs text-background/60 mb-6'>
            <Link href='/' className='hover:text-background transition-colors'>Home</Link>
            <span>/</span>
            <Link href='/collections' className='hover:text-background transition-colors'>Collections</Link>
            <span>/</span>
            <span className='text-background'>{collection.name}</span>
          </nav>
          <h1 className='text-4xl font-light uppercase tracking-widest text-background'>
            {collection.name}
          </h1>
          {collection.description && (
            <p className='mt-4 text-background/70 max-w-xl mx-auto text-sm leading-relaxed'>
              {collection.description}
            </p>
          )}
          <p className='mt-2 text-xs text-background/50'>{data?.count || 0} products</p>
        </div>
      </div>

      {/* Products */}
      <div className='mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {products.length === 0 ? (
          <div className='py-20 text-center'>
            <p className='text-text-muted'>No products in this collection yet.</p>
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
