'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Bell, ArrowRight } from 'lucide-react';

export default function AnnouncementBar({ announcements = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Normalize announcements array
  const items = Array.isArray(announcements)
    ? announcements.filter((a) => a && a.text)
    : [];

  useEffect(() => {
    if (items.length > 0) {
      // Small entrance delay for smooth slide-in
      const timer = setTimeout(() => setIsVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [items.length]);

  if (items.length === 0 || !isVisible || currentIndex >= items.length) {
    return null;
  }

  const current = items[currentIndex];

  const handleDismiss = (e) => {
    e.stopPropagation();
    // Temporarily hide, advance to next, then show next if available
    setIsVisible(false);
    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((prev) => prev + 1);
        setIsVisible(true);
      }
    }, 300);
  };

  return (
    <aside
      aria-label='Announcement'
      className='fixed bottom-6 left-6 z-50 max-w-sm w-[calc(100vw-3rem)] animate-slide-in-bottom select-none'
    >
      <div className='relative flex items-start gap-3 p-4 bg-primary/95 text-background backdrop-blur-md border border-white/15 rounded-lg shadow-2xl transition-all hover:border-accent/40'>
        {/* Pulse icon */}
        <div className='flex-shrink-0 mt-0.5 p-2 bg-accent/20 text-accent rounded-full'>
          <Bell size={16} className='animate-pulse' />
        </div>

        {/* Content */}
        <div className='flex-1 pr-6'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='inline-block w-1.5 h-1.5 rounded-full bg-accent' />
            <p className='text-[10px] font-semibold uppercase tracking-[0.2em] text-accent'>
              Update {items.length > 1 ? `(${currentIndex + 1}/${items.length})` : ''}
            </p>
          </div>

          {current.link_url ? (
            <Link
              href={current.link_url}
              className='group block text-xs font-medium text-background/90 hover:text-accent transition-colors leading-relaxed'
            >
              <span>{current.text}</span>
              <span className='inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-accent ml-1.5 group-hover:translate-x-1 transition-transform'>
                <span>Explore</span>
                <ArrowRight size={10} />
              </span>
            </Link>
          ) : (
            <p className='text-xs font-medium text-background/90 leading-relaxed'>
              {current.text}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className='absolute top-3 right-3 p-1 text-background/50 hover:text-background hover:bg-white/10 rounded transition-colors'
          aria-label='Dismiss notification'
        >
          <X size={14} />
        </button>
      </div>
    </aside>
  );
}
