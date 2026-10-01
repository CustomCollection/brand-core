'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Phone, MessageSquare, ArrowRight, Check } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import ContactModal from '@/components/cms/ContactModal';

// Clean inline SVG for Instagram
function InstagramIcon({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className={className}>
      <rect width='20' height='20' x='2' y='2' rx='5' ry='5' />
      <path d='M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' />
      <line x1='17.5' x2='17.51' y1='6.5' y2='6.5' />
    </svg>
  );
}

export default function Footer({ initialSiteConfig = null }) {
  const [config, setConfig] = useState(initialSiteConfig);
  const [collections, setCollections] = useState([]);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [subscriberEmail, setSubscriberEmail] = useState('');
  const [submittingSub, setSubmittingSub] = useState(false);
  const [subMessage, setSubMessage] = useState(null);
  const [subError, setSubError] = useState(null);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!subscriberEmail || !subscriberEmail.includes('@')) {
      setSubError('Please enter a valid email address');
      return;
    }
    setSubmittingSub(true);
    setSubError(null);
    setSubMessage(null);
    try {
      const res = await apiPost(ENDPOINTS.CMS.SUBSCRIBE, { email: subscriberEmail });
      setSubMessage(res?.message || 'Thank you for subscribing!');
      setSubscriberEmail('');
    } catch (err) {
      setSubError(err?.message || 'Subscription failed. Please try again.');
    } finally {
      setSubmittingSub(false);
    }
  };

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
              <Link href='/' className='inline-block group'>
                <p className='text-xs font-semibold uppercase tracking-widest text-white group-hover:text-accent transition-colors'>
                  CustomCollection
                </p>
              </Link>

              <p className='text-sm text-background/60 leading-relaxed max-w-xs'>
                {config?.brand_tagline || 'Premium clothing for the modern generation.'}
              </p>

              {/* Follow Us - Instagram only */}
              <div className='pt-2 space-y-2'>
                <p className='text-xs font-semibold uppercase tracking-widest text-background'>
                  Follow Us
                </p>
                <a
                  href={config?.instagram_url || 'https://instagram.com'}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2.5 text-sm text-background/80 hover:text-accent transition-colors'
                  aria-label='Instagram'
                >
                  <InstagramIcon size={20} />
                  <span>Instagram</span>
                </a>
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
              </ul>

              {/* ─── Newsletter / Get In Touch Box (Reference: media_1790832947917.png) ─── */}
              <div className='pt-5 border-t border-background/15 mt-5'>
                <h4 className='text-xs font-semibold uppercase tracking-widest text-background mb-2'>
                  Get In Touch
                </h4>
                <p className='text-xs text-background/60 mb-2.5 leading-relaxed'>
                  Subscribe for special drops & updates.
                </p>
                <form onSubmit={handleSubscribe} className='relative max-w-xs'>
                  <div className='relative flex items-center border border-white/20 bg-black/25 hover:border-white/40 focus-within:border-accent transition-colors'>
                    <input
                      type='email'
                      value={subscriberEmail}
                      onChange={(e) => {
                        setSubscriberEmail(e.target.value);
                        if (subError) setSubError(null);
                        if (subMessage) setSubMessage(null);
                      }}
                      placeholder='Email'
                      required
                      className='w-full bg-transparent px-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none pr-9'
                    />
                    <button
                      type='submit'
                      disabled={submittingSub}
                      className='absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-50 cursor-pointer'
                      aria-label='Subscribe'
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  {subMessage && (
                    <p className='mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium'>
                      <Check size={12} /> {subMessage}
                    </p>
                  )}
                  {subError && (
                    <p className='mt-2 text-[11px] text-rose-400 font-medium'>
                      {subError}
                    </p>
                  )}
                </form>
              </div>
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
