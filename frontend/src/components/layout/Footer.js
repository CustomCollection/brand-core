import Link from 'next/link';
import { Instagram, Twitter } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

async function getSiteConfig() {
  try {
    return await apiGet(ENDPOINTS.CMS.SITE_CONFIG, {
      next: { revalidate: 3600 },
    });
  } catch {
    return null;
  }
}

export default async function Footer() {
  const config = await getSiteConfig();
  const brandName = config?.brand_name || 'CustomCollection';
  const year = new Date().getFullYear();

  return (
    <footer className='border-t border-border bg-primary text-background'>
      <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4'>
          {/* Brand */}
          <div className='lg:col-span-1'>
            <p className='text-lg font-light uppercase tracking-[0.2em] text-background'>
              {brandName}
            </p>
            <p className='mt-4 text-sm text-background/60 leading-relaxed'>
              {config?.brand_tagline || 'Premium clothing for the modern generation.'}
            </p>
            {/* Social links */}
            <div className='mt-6 flex gap-4'>
              {config?.instagram_url && (
                <a
                  href={config.instagram_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-background/60 hover:text-accent transition-colors'
                  aria-label='Instagram'
                >
                  <Instagram size={18} />
                </a>
              )}
              {config?.twitter_url && (
                <a
                  href={config.twitter_url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-background/60 hover:text-accent transition-colors'
                  aria-label='Twitter'
                >
                  <Twitter size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className='text-xs font-semibold uppercase tracking-widest text-background mb-4'>
              Shop
            </h3>
            <ul className='space-y-3'>
              {[
                { label: 'New Arrivals', href: '/products?is_new_arrival=true' },
                { label: 'All Products', href: '/products' },
                { label: 'Collections', href: '/collections' },
                { label: 'Men', href: '/products?collection=men' },
                { label: 'Women', href: '/products?collection=women' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className='text-xs font-semibold uppercase tracking-widest text-background mb-4'>
              Account
            </h3>
            <ul className='space-y-3'>
              {[
                { label: 'My Profile', href: '/account/profile' },
                { label: 'My Orders', href: '/account/orders' },
                { label: 'My Wishlist', href: '/account/wishlist' },
                { label: 'Addresses', href: '/account/addresses' },
                { label: 'Sign In', href: '/login' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className='text-xs font-semibold uppercase tracking-widest text-background mb-4'>
              Info
            </h3>
            <ul className='space-y-3'>
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {config?.contact_email && (
                <li>
                  <a
                    href={`mailto:${config.contact_email}`}
                    className='text-sm text-background/60 hover:text-accent transition-colors'
                  >
                    {config.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-background/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
          <p className='text-xs text-background/40'>
            {config?.footer_text ||
              `© ${year} ${brandName}. All rights reserved.`}
          </p>
          <p className='text-xs text-background/40'>Designed in India. Made with love.</p>
        </div>
      </div>
    </footer>
  );
}
