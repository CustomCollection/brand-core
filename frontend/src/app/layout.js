import { Inter } from 'next/font/google';
import '@/app/globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ToastProvider } from '@/components/ui/Toast';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: {
    default: 'CustomCollection — Premium Fashion, Redefined',
    template: '%s | CustomCollection',
  },
  description:
    'Discover premium, curated fashion at CustomCollection. Shop the finest clothing designed for the modern individual.',
  keywords: ['fashion', 'premium clothing', 'designer wear', 'custom collection', 'online shopping'],
  authors: [{ name: 'CustomCollection' }],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'CustomCollection',
    title: 'CustomCollection — Premium Fashion, Redefined',
    description:
      'Discover premium, curated fashion at CustomCollection. Shop the finest clothing designed for the modern individual.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CustomCollection — Premium Fashion, Redefined',
    description:
      'Discover premium, curated fashion at CustomCollection.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ToastProvider>
                <Header />
                <div className="flex-1">
                  {children}
                </div>
                <Footer />
                <CartDrawer />
              </ToastProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
