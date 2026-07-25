import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Star } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductCard from '@/components/product/ProductCard';

export const metadata = {
  title: 'Premium Clothing Brand — CustomCollection',
  description:
    'Discover premium quality clothing at CustomCollection. Shop exclusive collections of oversized tees, hoodies, and more.',
};

// Revalidate homepage every 60 seconds
export const revalidate = 60;

async function getHomepageData() {
  try {
    return await apiGet(ENDPOINTS.CMS.HOMEPAGE, { next: { revalidate: 60 } });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageData();
  const featuredProducts = data?.featured_products || [];
  const newArrivals = data?.new_arrivals || [];
  const bestSellers = data?.best_sellers || [];
  const banner = data?.banners?.[0] || null;

  return (
    <div className='bg-background'>
      {/* ─── HERO ─── */}
      <section className='relative flex min-h-screen items-end overflow-hidden bg-primary'>
        {banner?.image_url ? (
          <Image
            src={banner.image_url}
            alt={banner.title || 'Hero'}
            fill
            priority
            className='object-cover opacity-50'
            sizes='100vw'
          />
        ) : (
          <div className='absolute inset-0 bg-gradient-to-br from-primary via-primary to-text-primary' />
        )}

        {/* Decorative grain */}
        <div className='absolute inset-0 opacity-[0.03] bg-[url("data:image/svg+xml,%3Csvg viewBox%3D%270 0 256 256%27 xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter id%3D%27noise%27%3E%3CfeTurbulence type%3D%27fractalNoise%27 baseFrequency%3D%270.9%27 numOctaves%3D%274%27 stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect width%3D%27100%25%27 height%3D%27100%25%27 filter%3D%27url(%23noise)%27%2F%3E%3C%2Fsvg%3E")]' />

        <div className='relative z-10 mx-auto max-w-7xl w-full px-6 pb-24 sm:px-8 lg:px-12'>
          <div className='max-w-2xl animate-fade-in-up'>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-6'>
              New Collection
            </p>
            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-light uppercase tracking-wider text-background leading-none'>
              {banner?.title || 'Wear the Difference'}
            </h1>
            <p className='mt-6 text-base sm:text-lg text-background/70 leading-relaxed max-w-lg'>
              {banner?.subtitle ||
                'Premium quality clothing crafted for those who dare to stand out. Every piece tells a story.'}
            </p>
            <div className='mt-10 flex flex-wrap gap-4'>
              <Link
                href='/products'
                className='inline-flex items-center gap-2 bg-accent text-background px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors'
              >
                Shop Now
                <ArrowRight size={14} />
              </Link>
              <Link
                href='/collections'
                className='inline-flex items-center gap-2 border border-background/40 text-background px-8 py-4 text-xs font-semibold uppercase tracking-widest hover:border-background transition-colors'
              >
                View Collections
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce'>
          <span className='text-[10px] font-medium uppercase tracking-[0.3em] text-background/50'>Scroll</span>
          <div className='h-8 w-px bg-background/30' />
        </div>
      </section>

      {/* ─── MARQUEE STRIP ─── */}
      <div className='overflow-hidden bg-accent py-3'>
        <div className='flex animate-marquee whitespace-nowrap'>
          {Array.from({ length: 6 }).map((_, i) => (
            <span key={i} className='mx-8 text-xs font-semibold uppercase tracking-[0.25em] text-background'>
              Premium Quality · Print On Demand · Free Shipping Above ₹999 · 100% Cotton
            </span>
          ))}
        </div>
      </div>

      {/* ─── FEATURED PRODUCTS ─── */}
      {featuredProducts.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
          <div className='flex items-end justify-between mb-10'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Curated for You</p>
              <h2 className='mt-2 text-3xl font-light uppercase tracking-widest text-text-primary'>
                Featured
              </h2>
            </div>
            <Link
              href='/products?is_featured=true'
              className='text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors link-underline'
            >
              View All <ArrowRight size={12} className='inline ml-1' />
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {featuredProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ─── BANNER CTA ─── */}
      <section className='relative overflow-hidden bg-surface'>
        <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-12 items-center'>
            <div className='space-y-6 animate-fade-in-up'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Why Choose Us</p>
              <h2 className='text-4xl font-light uppercase tracking-widest text-text-primary leading-tight'>
                Quality You Can Feel
              </h2>
              <p className='text-text-secondary leading-relaxed'>
                Every piece in our collection is crafted with premium materials and printed with precision. We believe in quality over quantity — each design is unique and made to order just for you.
              </p>
              <div className='grid grid-cols-2 gap-6'>
                {[
                  { label: 'Premium Cotton', desc: 'Heavy-weight 240 GSM fabric' },
                  { label: 'Print On Demand', desc: 'Unique, never mass-produced' },
                  { label: 'Free Shipping', desc: 'On orders above ₹999' },
                  { label: 'Easy Returns', desc: '7-day hassle-free returns' },
                ].map((f) => (
                  <div key={f.label}>
                    <p className='text-xs font-semibold uppercase tracking-wider text-text-primary'>{f.label}</p>
                    <p className='text-sm text-text-secondary mt-1'>{f.desc}</p>
                  </div>
                ))}
              </div>
              <Link
                href='/about'
                className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors link-underline'
              >
                Learn More <ArrowRight size={12} />
              </Link>
            </div>
            <div className='relative aspect-square bg-surface-hover flex items-center justify-center'>
              <div className='text-center space-y-2 p-8'>
                <p className='text-6xl font-light text-accent'>100%</p>
                <p className='text-sm font-semibold uppercase tracking-widest text-text-primary'>Premium Cotton</p>
                <div className='flex justify-center mt-4 gap-1'>
                  {[1,2,3,4,5].map((s) => <Star key={s} size={16} className='text-accent fill-accent' />)}
                </div>
                <p className='text-xs text-text-muted'>Rated 5 stars by our community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── NEW ARRIVALS ─── */}
      {newArrivals.length > 0 && (
        <section className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
          <div className='flex items-end justify-between mb-10'>
            <div>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Just Dropped</p>
              <h2 className='mt-2 text-3xl font-light uppercase tracking-widest text-text-primary'>
                New Arrivals
              </h2>
            </div>
            <Link
              href='/products?is_new_arrival=true'
              className='text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors link-underline'
            >
              View All <ArrowRight size={12} className='inline ml-1' />
            </Link>
          </div>
          <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {newArrivals.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ─── BEST SELLERS ─── */}
      {bestSellers.length > 0 && (
        <section className='bg-surface'>
          <div className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
            <div className='flex items-end justify-between mb-10'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Most Loved</p>
                <h2 className='mt-2 text-3xl font-light uppercase tracking-widest text-text-primary'>
                  Best Sellers
                </h2>
              </div>
              <Link
                href='/products?is_best_seller=true'
                className='text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors link-underline'
              >
                View All <ArrowRight size={12} className='inline ml-1' />
              </Link>
            </div>
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
              {bestSellers.slice(0, 4).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── COLLECTIONS STRIP ─── */}
      <section className='mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8'>
        <div className='text-center mb-10'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Explore</p>
          <h2 className='mt-2 text-3xl font-light uppercase tracking-widest text-text-primary'>Collections</h2>
        </div>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
          {[
            { label: 'Men', href: '/products?collection=men', bg: 'bg-zinc-900' },
            { label: 'Women', href: '/products?collection=women', bg: 'bg-stone-200' },
            { label: 'New Arrivals', href: '/products?is_new_arrival=true', bg: 'bg-accent' },
            { label: 'Oversized', href: '/products?collection=oversized', bg: 'bg-zinc-700' },
          ].map((col) => (
            <Link
              key={col.href}
              href={col.href}
              className={`${col.bg} flex items-end p-6 aspect-square group relative overflow-hidden`}
            >
              <div className='absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors' />
              <span className='relative text-xs font-semibold uppercase tracking-widest text-background flex items-center gap-2'>
                {col.label}
                <ArrowRight size={12} className='transition-transform group-hover:translate-x-1' />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className='bg-primary py-20'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4'>Limited Edition Drops</p>
          <h2 className='text-4xl sm:text-5xl font-light uppercase tracking-widest text-background mb-6'>
            Be the First to Know
          </h2>
          <p className='text-background/60 mb-10 max-w-md mx-auto'>
            Sign up to our newsletter for early access to new drops, exclusive offers, and styling inspiration.
          </p>
          <div className='flex max-w-md mx-auto gap-0'>
            <input
              type='email'
              placeholder='Your email address'
              className='flex-1 bg-transparent border border-background/30 text-background placeholder:text-background/40 px-5 py-3 text-sm focus:outline-none focus:border-accent transition-colors'
            />
            <button className='bg-accent text-background px-6 py-3 text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors flex-shrink-0'>
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
