import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export const metadata = {
  title: 'Collections',
  description: 'Explore our curated collections of premium fashion.',
};

async function getCollections() {
  try {
    const data = await apiGet(ENDPOINTS.COLLECTIONS.LIST, { next: { revalidate: 3600 } });
    return data.results || data || [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="bg-background pt-24 pb-16 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light uppercase tracking-widest text-text-primary">Our Collections</h1>
          <div className="mx-auto mt-6 h-px w-24 bg-accent" />
          <p className="mt-6 text-text-secondary font-light max-w-2xl mx-auto">
            Discover our meticulously curated collections, designed to elevate your everyday wardrobe with premium materials and timeless aesthetics.
          </p>
        </div>

        {collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => (
              <Link 
                key={collection.slug} 
                href={`/products?collection=${collection.slug}`}
                className="group block relative h-96 overflow-hidden bg-surface transition-all duration-500 hover:shadow-xl"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={collection.image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop'}
                    alt={collection.name}
                    fill
                    className="object-cover transition-transform duration-[10s] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
                </div>
                
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-8 text-white">
                  <h2 className="text-3xl font-light tracking-wide mb-2 uppercase">{collection.name}</h2>
                  <p className="text-sm font-light text-white/80 line-clamp-2 mb-4 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                    {collection.description || 'Explore this premium collection.'}
                  </p>
                  <div className="flex items-center text-xs font-medium uppercase tracking-widest text-accent">
                    <span>Explore Collection</span>
                    <svg className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center text-text-secondary">
            <p className="text-sm uppercase tracking-widest">Collections are being updated. Check back soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
