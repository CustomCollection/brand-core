import Link from 'next/link';
import { BRAND_NAME } from '@/lib/constants';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

async function getSiteConfig() {
  try {
    return await apiGet(ENDPOINTS.CMS.SITE_CONFIG, { next: { revalidate: 3600 } });
  } catch (error) {
    console.error('Error fetching site config:', error);
    return null;
  }
}

const defaultFooterLinks = {
  shop: {
    title: 'Shop',
    links: [
      { name: 'New Arrivals', href: '/products?collection=new-arrivals' },
      { name: 'Best Sellers', href: '/products?collection=best-sellers' },
      { name: 'Collections', href: '/collections' },
    ],
  },
  help: {
    title: 'Help',
    links: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Shipping & Returns', href: '/shipping-returns' },
      { name: 'FAQs', href: '/faqs' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
    ],
  },
};

export default async function Footer() {
  const config = await getSiteConfig();
  
  const footerData = config?.footer_links || defaultFooterLinks;
  const socialLinks = config?.social_links || [];
  const siteDescription = config?.site_description || 'Premium fashion, meticulously curated for the modern individual. Quality craftsmanship meets contemporary design.';

  return (
    <footer className="border-t border-border bg-surface text-text-primary">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <span className="text-lg font-light tracking-widest text-text-primary">
                {BRAND_NAME.split('C')[0]}
                <span className="font-semibold">C</span>
                {BRAND_NAME.split('C').slice(1).join('C').replace('ollection', '')}
                <span className="font-semibold">C</span>ollection
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-text-secondary">
              {siteDescription}
            </p>
            {/* Social links */}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    className="text-text-muted transition-colors hover:text-accent"
                    aria-label={social.name}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {/* Simplified social icon for fallback */}
                    <span className="text-xs uppercase tracking-wider">{social.name}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Link columns */}
          {Object.entries(footerData).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-text-primary">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href || link.url || '#'}
                      className="text-sm text-text-secondary transition-colors hover:text-accent"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mt-16 border-t border-border pt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-xs text-text-muted transition-colors hover:text-accent">
              Privacy
            </Link>
            <Link href="/terms" className="text-xs text-text-muted transition-colors hover:text-accent">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
