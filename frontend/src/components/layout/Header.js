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
import { apiGet } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { cn } from '@/lib/utils';

export default function Header({ initialSiteConfig = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { totalItems, openCart } = useCart();
  const { count: wishlistCount } = useWishlist();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileShopOpen, setIsMobileShopOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [siteConfig, setSiteConfig] = useState(initialSiteConfig);
  const searchInputRef = useRef(null);
  const accountRef = useRef(null);
  const shopRef = useRef(null);

  const isHomepage = pathname === '/';

  // Fetch or refresh site configuration for dynamic logo and brand name
  useEffect(() => {
    apiGet(ENDPOINTS.CMS.SITE_CONFIG)
      .then((cfg) => {
        if (cfg) setSiteConfig(cfg);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    // Call once initially to set correct state
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus();
  }, [isSearchOpen]);

  // Close account and shop dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setIsAccountOpen(false);
      }
      if (shopRef.current && !shopRef.current.contains(e.target)) {
        setIsShopOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMobileOpen(false);
    setIsSearchOpen(false);
    setIsShopOpen(false);
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

  // Transparent header on homepage when not scrolled; solid white when scrolled or on subpages
  const transparent = isHomepage && !isScrolled;

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
          transparent
            ? 'bg-transparent border-b border-transparent hover:bg-white/95 hover:backdrop-blur-md hover:border-neutral-100 hover:shadow-sm'
            : 'bg-white/95 backdrop-blur-md border-b border-neutral-100 shadow-sm'
        )}
      >
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='flex h-20 sm:h-24 items-center justify-between'>
            {/* Left: Mobile menu toggle + Nav */}
            <div className='flex items-center gap-6'>
              <button
                className='lg:hidden transition-colors text-text-primary hover:text-accent'
                onClick={() => setIsMobileOpen((v) => !v)}
                aria-label='Toggle menu'
              >
                {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <nav className='hidden lg:flex items-center'>
                {/* Shop Dropdown with arrow icon */}
                <div
                  className='relative'
                  ref={shopRef}
                  onMouseEnter={() => setIsShopOpen(true)}
                  onMouseLeave={() => setIsShopOpen(false)}
                >
                  <button
                    type='button'
                    onClick={(e) => {
                      e.preventDefault();
                      setIsShopOpen((v) => !v);
                    }}
                    className='flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-text-primary hover:text-accent transition-colors py-2 group cursor-pointer'
                    aria-expanded={isShopOpen}
                  >
                    <span>Shop</span>
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200 text-text-primary/70 group-hover:text-accent',
                        isShopOpen && 'rotate-180'
                      )}
                    />
                  </button>

                  {/* Dropdown Menu (Box style, no rounded corners, no numbering) */}
                  {isShopOpen && (
                    <div className='absolute top-full left-0 pt-2 z-50'>
                      <div className='w-52 rounded-none bg-white p-2 shadow-2xl border border-neutral-200 backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-150'>
                        <Link
                          href='/collections'
                          onClick={() => setIsShopOpen(false)}
                          className='flex flex-col px-3.5 py-2.5 rounded-none text-xs font-medium text-text-primary hover:bg-neutral-50 hover:text-accent transition-colors group/item'
                        >
                          <span className='font-semibold uppercase tracking-wider'>Collections</span>
                          <span className='text-[11px] text-text-muted font-normal mt-0.5 group-hover/item:text-text-secondary'>
                            Curated seasonal drops
                          </span>
                        </Link>
                        <div className='my-1 h-px bg-neutral-100' />
                        <Link
                          href='/products'
                          onClick={() => setIsShopOpen(false)}
                          className='flex flex-col px-3.5 py-2.5 rounded-none text-xs font-medium text-text-primary hover:bg-neutral-50 hover:text-accent transition-colors group/item'
                        >
                          <span className='font-semibold uppercase tracking-wider'>All Products</span>
                          <span className='text-[11px] text-text-muted font-normal mt-0.5 group-hover/item:text-text-secondary'>
                            Complete catalog & filters
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Center: Brand Logo / Name */}
            <Link
              href='/'
              className='absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-transform hover:scale-105'
            >
              {siteConfig?.logo_url || siteConfig?.logo ? (
                <img
                  src={siteConfig.logo_url || siteConfig.logo}
                  alt={siteConfig.brand_name || 'CustomCollection'}
                  className='h-8 sm:h-9 md:h-10 w-auto max-w-[140px] sm:max-w-[180px] object-contain'
                />
              ) : (
                <span className='text-lg sm:text-2xl font-light uppercase tracking-[0.2em] text-text-primary'>
                  {siteConfig?.brand_name || 'CustomCollection'}
                </span>
              )}
            </Link>

            {/* Right: Icons */}
            <div className='flex items-center gap-2.5 sm:gap-4'>
              {/* Search */}
              <button
                className='transition-colors text-text-primary hover:text-accent cursor-pointer'
                onClick={() => setIsSearchOpen((v) => !v)}
                aria-label='Search'
              >
                <Search size={20} />
              </button>

              {/* Wishlist (authenticated only) */}
              {user && (
                <Link
                  href='/account/wishlist'
                  className='relative transition-colors text-text-primary hover:text-accent'
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
                  className='flex items-center gap-1 transition-colors text-text-primary hover:text-accent cursor-pointer'
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
                className='relative transition-colors text-text-primary hover:text-accent cursor-pointer'
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
        <div className='fixed inset-0 z-30 bg-background pt-20 animate-slide-down lg:hidden overflow-y-auto'>
          <nav className='flex flex-col border-t border-border'>
            {/* Mobile Shop Accordion */}
            <div className='border-b border-border'>
              <button
                onClick={() => setIsMobileShopOpen((v) => !v)}
                className='w-full flex items-center justify-between px-6 py-4 text-sm font-semibold uppercase tracking-widest text-text-primary hover:bg-surface transition-colors'
              >
                <span>Shop</span>
                <ChevronDown
                  size={16}
                  className={cn('transition-transform duration-200', isMobileShopOpen && 'rotate-180')}
                />
              </button>
              {isMobileShopOpen && (
                <div className='bg-surface/50 px-6 py-2 space-y-1 border-t border-border/40'>
                  <Link
                    href='/collections'
                    onClick={() => setIsMobileOpen(false)}
                    className='block py-2.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent transition-colors'
                  >
                    Collections
                  </Link>
                  <Link
                    href='/products'
                    onClick={() => setIsMobileOpen(false)}
                    className='block py-2.5 text-xs font-semibold uppercase tracking-wider text-text-primary hover:text-accent transition-colors'
                  >
                    All Products
                  </Link>
                </div>
              )}
            </div>

            <div className='border-b border-border px-6 py-4'>
              {user ? (
                <>
                  <p className='text-xs text-text-muted mb-3'>Signed in as {user.email}</p>
                  <Link
                    href='/account/profile'
                    onClick={() => setIsMobileOpen(false)}
                    className='block text-sm font-medium text-text-primary mb-2 hover:text-accent transition-colors'
                  >
                    My Profile
                  </Link>
                  <Link
                    href='/account/orders'
                    onClick={() => setIsMobileOpen(false)}
                    className='block text-sm font-medium text-text-primary mb-2 hover:text-accent transition-colors'
                  >
                    My Orders
                  </Link>
                  <Link
                    href='/account/addresses'
                    onClick={() => setIsMobileOpen(false)}
                    className='block text-sm font-medium text-text-primary mb-2 hover:text-accent transition-colors'
                  >
                    Addresses
                  </Link>
                  <Link
                    href='/account/wishlist'
                    onClick={() => setIsMobileOpen(false)}
                    className='block text-sm font-medium text-text-primary mb-2 hover:text-accent transition-colors'
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      handleLogout();
                    }}
                    className='text-sm font-medium text-error mt-2 cursor-pointer'
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className='flex gap-4'>
                  <Link
                    href='/login'
                    onClick={() => setIsMobileOpen(false)}
                    className='text-sm font-semibold uppercase tracking-widest text-primary hover:text-accent'
                  >
                    Sign In
                  </Link>
                  <Link
                    href='/register'
                    onClick={() => setIsMobileOpen(false)}
                    className='text-sm font-semibold uppercase tracking-widest text-accent hover:underline'
                  >
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
