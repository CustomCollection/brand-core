import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import AnnouncementBar from '@/components/layout/AnnouncementBar';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

async function getAnnouncements() {
  try {
    const data = await apiGet(ENDPOINTS.CMS.HOMEPAGE, {
      next: { revalidate: 10 },
    });
    return Array.isArray(data?.announcements) ? data.announcements : [];
  } catch {
    return [];
  }
}

async function getSiteConfig() {
  try {
    const data = await apiGet(ENDPOINTS.CMS.SITE_CONFIG, {
      next: { revalidate: 10 },
    });
    return data || null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const config = await getSiteConfig();
  const title = config?.meta_title || config?.brand_name || 'CustomCollection — Premium Clothing Brand';
  const description = config?.meta_description || 'Shop premium quality clothing at CustomCollection.';
  const favicon = config?.favicon_url || config?.logo_url || '/favicon.ico';

  return {
    title: {
      default: title,
      template: `%s | ${config?.brand_name || 'CustomCollection'}`,
    },
    description,
    keywords: ['clothing', 'fashion', 'premium', 'tshirts', 'hoodies', config?.brand_name || 'CustomCollection'],
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_IN',
      siteName: config?.brand_name || 'CustomCollection',
      images: config?.logo_url ? [{ url: config.logo_url }] : [],
    },
  };
}

export default async function RootLayout({ children }) {
  const [announcements, config] = await Promise.all([
    getAnnouncements(),
    getSiteConfig(),
  ]);

  const favicon = config?.favicon_url || config?.logo_url;

  return (
    <html lang='en' className={inter.variable}>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        {favicon && <link rel='icon' href={favicon} />}
        {favicon && <link rel='shortcut icon' href={favicon} />}
        {favicon && <link rel='apple-touch-icon' href={favicon} />}
      </head>
      <body className='font-sans antialiased'>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                <AnnouncementBar announcements={announcements} />
                <Header initialSiteConfig={config} />
                <main className='min-h-screen'>{children}</main>
                <Footer initialSiteConfig={config} />
                <CartDrawer />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
