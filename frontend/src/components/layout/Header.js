'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';
import { BRAND_NAME } from '@/lib/constants';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

const navigation = [
  { name: 'New Arrivals', href: '/products?collection=new-arrivals' },
  { name: 'Collections', href: '/collections' },
  { name: 'Men', href: '/products?category=men' },
  { name: 'Women', href: '/products?category=women' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  
  const { itemCount, setIsCartOpen } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { isAuthenticated } = useAuth();

  const isHome = pathname === '/';
  const isTransparent = isHome && !isScrolled && !isMobileMenuOpen && !isSearchOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={classNames(
        'fixed top-0 z-40 w-full transition-all duration-300',
        isTransparent 
          ? 'bg-transparent border-transparent text-white' 
          : 'border-b border-border bg-background/95 backdrop-blur-md text-text-primary shadow-sm'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={classNames(
            "p-2 transition-colors lg:hidden",
            isTransparent ? "text-white hover:text-accent" : "text-text-primary hover:text-accent"
          )}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          )}
        </button>

        {/* Desktop nav */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8" aria-label="Main navigation">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                "link-underline text-xs font-medium uppercase tracking-wider transition-colors",
                isTransparent ? "text-white/90 hover:text-white" : "text-text-secondary hover:text-text-primary"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Logo */}
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0 lg:mx-auto">
          <span className="text-lg font-light tracking-widest sm:text-xl">
            <span className="font-semibold">C</span>ustom<span className="font-semibold">C</span>ollection
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Search */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className={classNames(
              "p-2 transition-colors",
              isTransparent ? "text-white hover:text-white/70" : "text-text-secondary hover:text-text-primary"
            )}
            aria-label="Search"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className={classNames(
              "relative hidden p-2 transition-colors sm:block",
              isTransparent ? "text-white hover:text-white/70" : "text-text-secondary hover:text-text-primary"
            )}
            aria-label={`Wishlist, ${wishlistItems.length} items`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
            </svg>
            {wishlistItems.length > 0 && (
              <span className={classNames(
                "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center text-[9px] font-bold rounded-full",
                isTransparent ? "bg-white text-primary" : "bg-accent text-primary"
              )}>
                {wishlistItems.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link
            href={isAuthenticated ? '/account' : '/login'}
            className={classNames(
              "hidden p-2 transition-colors sm:block",
              isTransparent ? "text-white hover:text-white/70" : "text-text-secondary hover:text-text-primary"
            )}
            aria-label="Account"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </Link>

          {/* Cart */}
          {/* Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className={classNames(
              "relative p-2 transition-colors",
              isTransparent ? "text-white hover:text-white/70" : "text-text-secondary hover:text-text-primary"
            )}
            aria-label={`Shopping bag, ${itemCount} items`}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            {itemCount > 0 && (
              <span className={classNames(
                "absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center text-[9px] font-bold rounded-full",
                isTransparent ? "bg-white text-primary" : "bg-accent text-primary"
              )}>
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search overlay */}
      {isSearchOpen && (
        <div className="border-t border-border bg-background px-4 py-4 animate-slide-down sm:px-6 lg:px-8 text-text-primary">
          <div className="mx-auto max-w-2xl">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="search"
                placeholder="Search for products..."
                className="w-full border-b border-border bg-transparent py-3 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
                autoFocus
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary"
                aria-label="Close search"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background lg:hidden animate-slide-down text-text-primary">
          <nav className="flex flex-col px-4 py-6" aria-label="Mobile navigation">
            {navigation.map((item) => (
               <Link
                 key={item.name}
                 href={item.href}
                 onClick={() => setIsMobileMenuOpen(false)}
                 className="border-b border-border-light py-4 text-sm font-medium uppercase tracking-wider transition-colors hover:text-accent"
               >
                 {item.name}
               </Link>
            ))}

            <div className="mt-6 flex flex-col gap-4">
              <Link
                href="/wishlist"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
                Wishlist
              </Link>
              <Link
                href={isAuthenticated ? '/account' : '/login'}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                {isAuthenticated ? 'My Account' : 'Sign In'}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
