'use client';

import { useState } from 'react';
import { classNames } from '@/lib/utils';

export default function AnnouncementBar({
  message = 'Free shipping on orders over ₹999',
  link,
  linkText,
  dismissible = true,
  className,
}) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div
      className={classNames(
        'relative bg-primary px-4 py-2.5 text-center text-xs font-medium tracking-wider text-white sm:text-sm',
        className
      )}
      role="banner"
    >
      <div className="mx-auto max-w-7xl">
        <p className="inline">
          {message}
          {link && linkText && (
            <>
              {' '}
              <a
                href={link}
                className="underline underline-offset-2 transition-colors hover:text-accent"
              >
                {linkText}
              </a>
            </>
          )}
        </p>
      </div>

      {dismissible && (
        <button
          onClick={() => setIsVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/60 transition-colors hover:text-white"
          aria-label="Dismiss announcement"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
