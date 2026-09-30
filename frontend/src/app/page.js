import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductCard from '@/components/product/ProductCard';
import HeroSlider from '@/components/cms/HeroSlider';

export const metadata = {
  title: 'Premium Clothing Brand — CustomCollection',
  description:
    'Discover premium quality clothing at CustomCollection. Shop exclusive collections of oversized tees, hoodies, and more.',
};

// Revalidate homepage every 10 seconds for real-time admin sync
export const revalidate = 10;

async function getHomepageData() {
  try {
    return await apiGet(ENDPOINTS.CMS.HOMEPAGE, { next: { revalidate: 10 } });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageData();
  const banners = data?.banners || [];
  const sections = data?.sections || [];
  const featuredProducts = data?.featured_products || [];

  return (
    <div className='bg-background'>
      {/* ─── HERO BANNER SLIDER ─── */}
      <HeroSlider banners={banners} />

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

      {/* ─── DYNAMIC HOMEPAGE SECTIONS (FROM CMS) ─── */}
      {sections.length > 0 ? (
        sections.map((section) => (
          <section key={section.id} className='mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8 border-b border-border/40 last:border-b-0'>
            <div className='flex items-end justify-between mb-8 sm:mb-10'>
              <div>
                {section.subtitle && (
                  <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>
                    {section.subtitle}
                  </p>
                )}
                <h2 className='mt-2 text-2xl sm:text-3xl font-light uppercase tracking-widest text-text-primary'>
                  {section.title || section.collection_name}
                </h2>
              </div>
              <Link
                href={`/collections/${section.collection_slug}`}
                className='text-xs font-semibold uppercase tracking-widest text-text-secondary hover:text-accent transition-colors link-underline'
              >
                View All <ArrowRight size={12} className='inline ml-1' />
              </Link>
            </div>

            {section.products?.length > 0 ? (
              <div className='grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                {section.products.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className='text-sm text-text-muted py-8 text-center'>
                No products found in this collection yet.
              </p>
            )}
          </section>
        ))
      ) : (
        /* Fallback if no sections have been added in admin yet */
        featuredProducts.length > 0 && (
          <section className='mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8'>
            <div className='flex items-end justify-between mb-8 sm:mb-10'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Curated for You</p>
                <h2 className='mt-2 text-2xl sm:text-3xl font-light uppercase tracking-widest text-text-primary'>
                  Featured
                </h2>
              </div>
              <Link
                href='/collections'
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
        )
      )}

      {/* ─── WHY CHOOSE US (KEPT AS REQUESTED) ─── */}
      <section className='relative overflow-hidden bg-surface'>
        <div className='mx-auto max-w-7xl px-4 py-12 sm:py-20 sm:px-6 lg:px-8'>
          <div className='grid lg:grid-cols-2 gap-8 sm:gap-12 items-center'>
            <div className='space-y-6 animate-fade-in-up'>
              <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent'>Why Choose Us</p>
              <h2 className='text-2xl sm:text-4xl font-light uppercase tracking-widest text-text-primary leading-tight'>
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
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={16} className='text-accent fill-accent' />
                  ))}
                </div>
                <p className='text-xs text-text-muted'>Rated 5 stars by our community</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
