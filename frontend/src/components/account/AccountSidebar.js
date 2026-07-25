'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, MapPin, Package, Heart, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'My Profile', href: '/account/profile', icon: User },
  { label: 'My Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <aside className='w-full lg:w-64 flex-shrink-0'>
      <div className='sticky top-24 space-y-1'>
        {/* User info */}
        {user && (
          <div className='px-4 py-4 mb-4 bg-surface border border-border'>
            <p className='text-sm font-semibold text-text-primary'>
              {user.first_name} {user.last_name}
            </p>
            <p className='text-xs text-text-muted mt-0.5 truncate'>{user.email}</p>
          </div>
        )}

        {/* Nav items */}
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors border-l-2',
                active
                  ? 'border-accent text-text-primary bg-surface'
                  : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className='flex items-center gap-3 px-4 py-3 text-sm font-medium text-error hover:bg-error-light transition-colors w-full border-l-2 border-transparent mt-4'
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
