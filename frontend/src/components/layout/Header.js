'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'New Arrivals', href: '/products?is_new_arrival=true' },
  { label: 'Collections', href: '/collections' },
  { label: 'Men', href: '/products?collection=men' },
  { label: 'Women', href: '/products?collection=women' },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const searchInputRef = useRef(null);
  const accountRef = useRef(null);

  const isHomepage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Close account dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    },
    [searchQuery, router]
  );

  const handleLogout = async () => {
    await logout();
    router.push('/');
    setIsAccountOpen(false);
  };

  const transparent = isHomepage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          transparent
            ? 'bg-transparent'
            : 'bg-background/95 backdrop-blur-sm border-b border-border shadow-sm'
        )}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-16 items-center justify-between'>
            {/* Left: Mobile menu toggle + Nav */}
            <div className='flex items-center gap-6'>
              <button
                className={cn(
                  'lg:hidden transition-colors',
                  transparent ? 'text-background' : 'text-text-primary'
                )}
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label='Toggle menu'
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <nav className='hidden lg:flex items-center gap-8'>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-xs font-semibold uppercase tracking-widest transition-colors link-underline',
                      transparent
                        ? 'text-background hover:text-background/80'
                        : 'text-text-primary hover:text-accent'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: Logo */}
            <Link
              href='/'
              className={cn(
                'absolute left-1/2 -translate-x-1/2 text-lg font-light uppercase tracking-[0.25em] transition-colors',
                transparent ? 'text-background' : 'text-text-primary'
              )}
            >
              CustomCollection
            </Link>

            {/* Right: Icons */}
            <div className='flex items-center gap-4'>
              {/* Search */}
              <button
                className={cn(
                  'transition-colors',
                  transparent ? 'text-background' : 'text-text-primary hover:text-accent'
                )}
                onClick={() => setIsSearchOpen((v) => !v)}
                aria-label='Search'
              >
                <Search size={20} />
              </button>

              {/* Wishlist (authenticated only) */}
              {user && (
                <Link
                  href='/account/wishlist'
                  className={cn(
                    'relative transition-colors',
                    transparent ? 'text-background' : 'text-text-primary hover:text-accent'
                  )}
                  aria-label='Wishlist'
                >
                  <Heart size={20} />
                  {wishlistCount > 0 && (
                    <span className='absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent text-background text-[10px] font-semibold flex items-center justify-center'>
                      {wishlistCount > 9 ? '9+' : wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Account */}
              <div className='relative' ref={accountRef}>
                <button
                  className={cn(
                    'flex items-center gap-1 transition-colors',
                    transparent ? 'text-background' : 'text-text-primary hover:text-accent'
                  )}
                  onClick={() => setIsAccountOpen((v) => !v)}
                  aria-label='Account'
                >
                  <User size={20} />
                  {user && (
                    <ChevronDown
                      size={12}
                      className={cn(
                        'transition-transform',
                        isAccountOpen && 'rotate-180'
                      )}
                    />
                  )}
                </button>

                {isAccountOpen && (
                  <div className='absolute right-0 top-full mt-2 w-44 bg-background border border-border shadow-lg z-50 animate-scale-in'>
                    {user ? (
                      <>
                        <div className='px-4 py-3 border-b border-border'>
                          <p className='text-xs font-semibold text-text-primary truncate'>
                            {user.first_name} {user.last_name}
                          </p>
                          <p className='text-xs text-text-muted truncate mt-0.5'>
                            {user.email}
                          </p>
                        </div>
                        <div className='py-1'>
                          <Link
                            href='/account/profile'
                            className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                          >
                            My Profile
                          </Link>
                          <Link
                            href='/account/orders'
                            className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                          >
                            My Orders
                          </Link>
                          <Link
                            href='/account/addresses'
                            className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                          >
                            Addresses
                          </Link>
                          <Link
                            href='/account/wishlist'
                            className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                          >
                            Wishlist
                          </Link>
                        </div>
                        <div className='border-t border-border py-1'>
                          <button
                            onClick={handleLogout}
                            className='w-full text-left px-4 py-2 text-sm text-error hover:bg-error-light transition-colors'
                          >
                            Sign Out
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className='py-1'>
                        <Link
                          href='/login'
                          className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                        >
                          Sign In
                        </Link>
                        <Link
                          href='/register'
                          className='block px-4 py-2 text-sm text-text-primary hover:bg-surface transition-colors'
                        >
                          Create Account
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Cart */}
              <button
                className={cn(
                  'relative transition-colors',
                  transparent ? 'text-background' : 'text-text-primary hover:text-accent'
                )}
                onClick={openCart}
                aria-label='Shopping cart'
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className='absolute -top-2 -right-2 h-4 w-4 rounded-full bg-accent text-background text-[10px] font-semibold flex items-center justify-center'>
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search overlay */}
        {isSearchOpen && (
          <div className='border-t border-border bg-background'>
            <form
              onSubmit={handleSearch}
              className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex gap-4'
            >
              <input
                ref={searchInputRef}
                type='search'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder='Search for products, collections…'
                className='flex-1 border-b border-border bg-transparent py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors'
                aria-label='Search'
              />
              <button
                type='submit'
                className='text-xs font-semibold uppercase tracking-widest text-primary hover:text-accent transition-colors'
              >
                Search
              </button>
              <button
                type='button'
                onClick={() => setIsSearchOpen(false)}
                className='text-text-muted hover:text-text-primary transition-colors'
                aria-label='Close search'
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {isMobileOpen && (
        <div className='fixed inset-0 z-30 bg-background pt-16 animate-slide-down lg:hidden'>
          <nav className='flex flex-col border-t border-border'>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className='border-b border-border px-6 py-4 text-sm font-semibold uppercase tracking-widest text-text-primary hover:bg-surface transition-colors'
              >
                {link.label}
              </Link>
            ))}
            <div className='border-b border-border px-6 py-4'>
              {user ? (
                <>
                  <p className='text-xs text-text-muted mb-3'>Signed in as {user.email}</p>
                  <Link href='/account/profile' className='block text-sm font-medium text-text-primary mb-2'>My Profile</Link>
                  <Link href='/account/orders' className='block text-sm font-medium text-text-primary mb-2'>My Orders</Link>
                  <Link href='/account/wishlist' className='block text-sm font-medium text-text-primary mb-2'>Wishlist</Link>
                  <button onClick={handleLogout} className='text-sm font-medium text-error mt-2'>Sign Out</button>
                </>
              ) : (
                <div className='flex gap-4'>
                  <Link href='/login' className='text-sm font-semibold uppercase tracking-widest text-primary'>Sign In</Link>
                  <Link href='/register' className='text-sm font-semibold uppercase tracking-widest text-accent'>Create Account</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
