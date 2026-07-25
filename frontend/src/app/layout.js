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

async function getAnnouncement() {
  try {
    const data = await apiGet(ENDPOINTS.CMS.HOMEPAGE, {
      next: { revalidate: 300 },
    });
    const active = (data?.announcements || []).find((a) => a.text);
    return active || null;
  } catch {
    return null;
  }
}

export const metadata = {
  title: {
    default: 'CustomCollection — Premium Clothing Brand',
    template: '%s | CustomCollection',
  },
  description:
    'Shop premium quality clothing at CustomCollection. Discover our exclusive collections of oversized tees, hoodies, and more.',
  keywords: ['clothing', 'fashion', 'premium', 'tshirts', 'hoodies', 'CustomCollection'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CustomCollection',
  },
};

export default async function RootLayout({ children }) {
  const announcement = await getAnnouncement();

  return (
    <html lang='en' className={inter.variable}>
      <head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
      </head>
      <body className='font-sans antialiased'>
        <AuthProvider>
          <ToastProvider>
            <CartProvider>
              <WishlistProvider>
                {announcement && (
                  <AnnouncementBar
                    text={announcement.text}
                    linkUrl={announcement.link_url}
                  />
                )}
                <Header />
                <main className='min-h-screen'>{children}</main>
                <Footer />
                <CartDrawer />
              </WishlistProvider>
            </CartProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
