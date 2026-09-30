'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ContactModal from '@/components/cms/ContactModal';

// Clean inline SVGs for social media (zero external dependency issues)
function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>
      <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
    </svg>
  );
}

function TwitterIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>
      <path d='M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z' />
    </svg>
  );
}

function YoutubeIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>
      <path d='M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17' />
      <polygon points='10 15 15 12 10 9 10 15' fill='currentColor' />
    </svg>
  );
}

function FacebookIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>
      <path d='M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' />
    </svg>
  );
}

export default function Footer({ initialSiteConfig = null }) {
  const [config, setConfig] = useState(initialSiteConfig);
  const [collections, setCollections] = useState([]);
  const [isContactOpen, setIsContactOpen] = useState(false);

  useEffect(() => {
    const handleOpenContact = () => setIsContactOpen(true);
    window.addEventListener('open-contact-modal', handleOpenContact);

    async function loadData() {
      try {
        const [configRes, colRes] = await Promise.all([
          apiGet(ENDPOINTS.CMS.SITE_CONFIG),
          apiGet(ENDPOINTS.COLLECTIONS.LIST),
        ]);
        if (configRes) setConfig(configRes);
        if (Array.isArray(colRes)) setCollections(colRes);
      } catch (err) {
        console.error('Failed to load footer dynamic data:', err);
      }
    }
    loadData();

    return () => window.removeEventListener('open-contact-modal', handleOpenContact);
  }, []);

  const brandName = config?.brand_name || 'CustomCollection';
  const year = new Date().getFullYear();

  return (
    <>
      <footer className='border-t border-border bg-primary text-background'>
        <div className='mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4'>
            {/* ─── Col 1: Brand & Socials ─── */}
            <div className='lg:col-span-1 space-y-4'>
              {config?.logo_url ? (
                <Link href='/' className='inline-block group'>
                  <img
                    src={
                      config.logo_url.includes('cloudinary.com') && !config.logo_url.includes('e_trim')
                        ? config.logo_url.replace('/image/upload/', '/image/upload/e_trim/')
                        : config.logo_url
                    }
                    alt={brandName}
                    className='h-16 sm:h-20 md:h-24 w-auto max-w-[280px] sm:max-w-[340px] object-contain transition-transform group-hover:scale-105'
                  />
                </Link>
              ) : (
                <p className='text-xl font-light uppercase tracking-[0.2em] text-background'>
                  {brandName}
                </p>
              )}

              <p className='text-sm text-background/60 leading-relaxed max-w-xs'>
                {config?.brand_tagline || 'Premium clothing for the modern generation.'}
              </p>

              {/* Social Links from SiteConfig */}
              <div className='pt-2 flex items-center gap-4'>
                {config?.instagram_url && (
                  <a
                    href={config.instagram_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-white/5 hover:bg-white/15 text-background/70 hover:text-accent rounded-full transition-colors'
                    aria-label='Instagram'
                  >
                    <InstagramIcon size={18} />
                  </a>
                )}
                {config?.twitter_url && (
                  <a
                    href={config.twitter_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-white/5 hover:bg-white/15 text-background/70 hover:text-accent rounded-full transition-colors'
                    aria-label='Twitter'
                  >
                    <TwitterIcon size={18} />
                  </a>
                )}
                {config?.youtube_url && (
                  <a
                    href={config.youtube_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-white/5 hover:bg-white/15 text-background/70 hover:text-accent rounded-full transition-colors'
                    aria-label='YouTube'
                  >
                    <YoutubeIcon size={18} />
                  </a>
                )}
                {config?.facebook_url && (
                  <a
                    href={config.facebook_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='p-2 bg-white/5 hover:bg-white/15 text-background/70 hover:text-accent rounded-full transition-colors'
                    aria-label='Facebook'
                  >
                    <FacebookIcon size={18} />
                  </a>
                )}
              </div>
            </div>

            {/* ─── Col 2: Dynamic Shop / Collections ─── */}
            <div>
              <h3 className='text-xs font-semibold uppercase tracking-widest text-background mb-4'>
                Shop
              </h3>
              <ul className='space-y-3'>
                {collections.length > 0 ? (
                  collections.map((col) => (
                    <li key={col.id}>
                      <Link
                        href={`/collections/${col.slug}`}
                        className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                      >
                        {col.name}
                      </Link>
                    </li>
                  ))
                ) : (
                  <>
                    <li>
                      <Link
                        href='/collections'
                        className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                      >
                        All Collections
                      </Link>
                    </li>
                    <li>
                      <Link
                        href='/products'
                        className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                      >
                        All Products
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* ─── Col 3: Account Links ─── */}
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

            {/* ─── Col 4: Info & Contact ─── */}
            <div>
              <h3 className='text-xs font-semibold uppercase tracking-widest text-background mb-4'>
                Info & Support
              </h3>
              <ul className='space-y-3'>
                <li>
                  <Link
                    href='/about'
                    className='text-sm text-background/60 hover:text-accent transition-colors link-underline'
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => setIsContactOpen(true)}
                    className='text-sm text-background/60 hover:text-accent transition-colors text-left flex items-center gap-1.5'
                  >
                    <MessageSquare size={13} />
                    <span>Contact Us</span>
                  </button>
                </li>

                {config?.contact_email && (
                  <li className='pt-1'>
                    <a
                      href={`mailto:${config.contact_email}`}
                      className='text-sm text-background/60 hover:text-accent transition-colors flex items-center gap-2'
                    >
                      <Mail size={14} className='text-accent/80' />
                      <span className='truncate'>{config.contact_email}</span>
                    </a>
                  </li>
                )}

                {config?.contact_phone && (
                  <li>
                    <a
                      href={`tel:${config.contact_phone}`}
                      className='text-sm text-background/60 hover:text-accent transition-colors flex items-center gap-2'
                    >
                      <Phone size={14} className='text-accent/80' />
                      <span>{config.contact_phone}</span>
                    </a>
                  </li>
                )}

                {config?.address && (
                  <li className='flex items-start gap-2 text-sm text-background/60 pt-1'>
                    <MapPin size={15} className='text-accent/80 flex-shrink-0 mt-0.5' />
                    <span className='leading-relaxed text-xs'>{config.address}</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* ─── Bottom Copyright ─── */}
          <div className='mt-12 border-t border-background/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4'>
            <p className='text-xs text-background/50'>
              {config?.footer_text || `© ${year} ${brandName}. All rights reserved.`}
            </p>
            <p className='text-xs text-background/50'>Designed in India. Made with love.</p>
          </div>
        </div>
      </footer>

      {/* Global Contact Modal */}
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
    </>
  );
}
