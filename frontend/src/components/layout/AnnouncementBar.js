'use client';

import { useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export default function AnnouncementBar({ text, linkUrl }) {
  const [dismissed, setDismissed] = useState(false);

  if (!text || dismissed) return null;

  return (
    <div className='relative bg-primary px-8 py-2 text-center'>
      <p className='text-xs font-medium tracking-wide text-background'>
        {linkUrl ? (
          <Link href={linkUrl} className='hover:text-accent transition-colors'>
            {text}
          </Link>
        ) : (
          text
        )}
      </p>
      <button
        onClick={() => setDismissed(true)}
        className='absolute right-4 top-1/2 -translate-y-1/2 text-background/60 hover:text-background transition-colors'
        aria-label='Dismiss announcement'
      >
        <X size={14} />
      </button>
    </div>
  );
}
