'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { classNames } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function AccountSidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out.');
      router.push('/');
    } catch {
      toast.error('Failed to log out.');
    }
  };

  const navigation = [
    { name: 'Profile Overview', href: '/profile' },
    { name: 'Addresses', href: '/addresses' },
    { name: 'Orders', href: '/orders' },
  ];

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="mb-8 px-4">
        <p className="text-sm text-text-secondary">Welcome back,</p>
        <p className="text-lg font-medium text-primary">
          {user?.first_name ? `${user.first_name} ${user.last_name}` : 'User'}
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={classNames(
                'px-4 py-3 text-sm transition-colors duration-200 border-l-2',
                isActive
                  ? 'border-primary bg-surface font-medium text-primary'
                  : 'border-transparent text-text-secondary hover:bg-surface hover:text-primary hover:border-border'
              )}
            >
              {item.name}
            </Link>
          );
        })}
        <div className="mt-8 px-4 border-t border-border pt-6">
          <Button 
            variant="ghost" 
            onClick={handleLogout} 
            className="w-full justify-start px-0 text-error hover:text-error hover:bg-error-light focus-visible:ring-error/50"
          >
            Sign Out
          </Button>
        </div>
      </nav>
    </aside>
  );
}
