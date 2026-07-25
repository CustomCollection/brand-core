'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      ref={overlayRef}
      className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in'
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={cn(
          'relative w-full bg-background shadow-2xl animate-scale-in',
          SIZES[size] || SIZES.md
        )}
        role='dialog'
        aria-modal='true'
      >
        {(title || showClose) && (
          <div className='flex items-center justify-between border-b border-border px-6 py-4'>
            {title && (
              <h2 className='text-sm font-semibold uppercase tracking-widest text-text-primary'>
                {title}
              </h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className='text-text-muted hover:text-text-primary transition-colors ml-auto'
                aria-label='Close modal'
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        <div className='px-6 py-6'>{children}</div>
      </div>
    </div>,
    document.body
  );
}
