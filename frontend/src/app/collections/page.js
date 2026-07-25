import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Collections',
  description: 'Explore all collections at CustomCollection.',
};

async function getCollections() {
  try {
    const data = await apiGet(ENDPOINTS.COLLECTIONS.LIST, {
      next: { revalidate: 300 },
    });
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className='bg-background pt-16'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='mb-12 text-center'>
          <h1 className='text-4xl font-light uppercase tracking-widest text-text-primary'>Collections</h1>
          <div className='mx-auto mt-4 h-px w-12 bg-accent' />
          <p className='mt-4 text-text-muted text-sm'>Explore our curated collections</p>
        </div>

        {collections.length === 0 ? (
          <div className='text-center py-20'>
            <p className='text-text-muted'>No collections available.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className='group relative overflow-hidden bg-surface block'
              >
                {/* Image */}
                <div className='aspect-[4/3] relative overflow-hidden bg-surface-hover'>
                  {collection.image_url ? (
                    <Image
                      src={collection.image_url}
                      alt={collection.name}
                      fill
                      sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                      className='object-cover transition-transform duration-500 group-hover:scale-105'
                    />
                  ) : (
                    <div className='flex h-full items-center justify-center'>
                      <span className='text-4xl font-light text-border uppercase tracking-widest'>
                        {collection.name[0]}
                      </span>
                    </div>
                  )}
                  <div className='absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors' />
                </div>

                {/* Info */}
                <div className='absolute inset-0 flex flex-col justify-end p-6'>
                  <p className='text-lg font-light uppercase tracking-widest text-background'>
                    {collection.name}
                  </p>
                  <div className='flex items-center justify-between mt-1'>
                    <p className='text-xs text-background/70'>
                      {collection.product_count} products
                    </p>
                    <ArrowRight
                      size={16}
                      className='text-background/70 transition-transform group-hover:translate-x-1'
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
