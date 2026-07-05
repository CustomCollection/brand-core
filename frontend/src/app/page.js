import Link from 'next/link';
import Image from 'next/image';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ProductCard from '@/components/product/ProductCard';

export const metadata = {
  title: 'Home',
};

async function getHomepageData() {
  try {
    return await apiGet(ENDPOINTS.CMS.HOMEPAGE, { next: { revalidate: 60 } });
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}

export default async function HomePage() {
  const data = await getHomepageData();

  // Fallbacks in case API fails
  const heroData = data?.hero || {
    title: 'Custom Collection',
    subtitle: 'Premium fashion, meticulously curated for the modern individual.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop',
    cta_text: 'Explore',
    cta_link: '/products',
  };

  const announcement = data?.announcement_bar || {
    is_active: false,
    text: '',
  };

  const sections = data?.sections || [];

  return (
    <main className="flex min-h-screen flex-col bg-background">
      {/* Announcement Bar */}
      {announcement.is_active && (
        <div className="bg-primary px-4 py-2 text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-accent">
            {announcement.text}
          </p>
        </div>
      )}

      {/* Main Hero: Custom Design (Coming Soon) */}
      <section className="relative h-[95vh] w-full flex items-center justify-center overflow-hidden bg-[#0a0a0a] px-6">
        <div className="absolute inset-0 z-0">
          {/* Abstract dark luxury background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] via-[#0a0a0a] to-[#000000] opacity-90" />
          {/* Subtle grid pattern or grain can go here, using a CSS class or absolute div */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
        
        <div className="relative z-10 text-center flex flex-col items-center mt-12 max-w-4xl mx-auto">
          <div className="inline-block border border-accent/30 px-6 py-2 mb-8 animate-fade-in">
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-accent">
              Coming Soon
            </span>
          </div>
          
          <h1 className="mb-6 text-5xl font-extralight leading-tight tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl animate-fade-in-up animate-delay-100">
            Design Your Own
            <span className="block font-medium text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#e5c17e] to-accent mt-2">
              Signature Piece
            </span>
          </h1>
          
          <p className="mx-auto mt-8 max-w-2xl text-base font-light leading-relaxed text-white/60 sm:text-lg animate-fade-in-up animate-delay-200">
            Unleash your creativity. Our upcoming custom design studio will allow you to craft premium, personalized apparel that speaks your exact style language.
          </p>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce flex flex-col items-center gap-2 text-white/40">
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Dynamic Sections (Featured Collections, Best Sellers, etc.) */}
      <div className="bg-background pt-10 pb-20">
        {sections.length > 0 ? (
          sections.map((section, index) => (
            <section key={index} className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-border/40 first:border-0">
              <div className="mb-16 text-center flex flex-col items-center">
                <h2 className="text-3xl font-light tracking-[0.2em] text-text-primary uppercase">{section.title}</h2>
                <div className="mt-8 h-px w-12 bg-accent/60" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16">
                {section.items?.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
              
              {section.view_all_link && (
                <div className="mt-20 text-center">
                  <Link href={section.view_all_link} className="group inline-flex items-center gap-3 text-sm font-medium uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors">
                    <span>View All {section.title}</span>
                    <svg className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </section>
          ))
        ) : (
          /* Fallback for when API fails or returns no sections */
          <section className="py-32 px-4 sm:px-6 lg:px-8 text-center text-text-secondary border-t border-border/40">
            <h2 className="text-2xl font-light tracking-[0.2em] text-text-primary uppercase mb-6">Latest Arrivals</h2>
            <p className="text-sm uppercase tracking-widest opacity-60">Curated collections are being updated</p>
          </section>
        )}
      </div>

      {/* About Brand & Newsletter Section (Minimal Luxury) */}
      <section className="border-t border-border bg-surface py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-accent text-xs font-medium uppercase tracking-[0.3em] mb-6 block">Our Philosophy</span>
          <h2 className="text-3xl sm:text-4xl font-light leading-relaxed text-text-primary mb-10">
            Elevating everyday essentials through meticulous craftsmanship and uncompromising quality.
          </h2>
          <p className="text-text-secondary font-light max-w-2xl mx-auto mb-16 leading-loose">
            We believe that true luxury lies in the details. Every piece in our collection is thoughtfully designed to blend modern aesthetics with timeless comfort, creating garments that transcend seasonal trends.
          </p>
          
          <div className="max-w-md mx-auto">
            <h3 className="text-sm font-medium uppercase tracking-widest text-text-primary mb-6">Join The Club</h3>
            <form className="flex border-b border-text-primary pb-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder:text-text-muted px-2 outline-none"
                required
              />
              <button type="submit" className="text-xs font-semibold uppercase tracking-widest hover:text-accent transition-colors px-2">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
