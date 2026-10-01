'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { X, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const STORAGE_KEY = 'cc_register_prompt_seen';

export default function RegisterPopup({ siteConfig = null }) {
  const router = useRouter();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // If user is logged in, never show the registration popup
    if (user) return;

    // Check if user already saw or dismissed the popup
    const seen = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (seen) return;

    // If popup is explicitly disabled in site configuration, don't show
    if (siteConfig && siteConfig.register_popup_enabled === false) return;

    // Small polite delay after initial load before popping up
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, siteConfig]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // localStorage may fail in private mode
    }
    setIsOpen(false);
  };

  const handleRegisterClick = () => {
    handleDismiss();
    router.push('/register');
  };

  if (!isOpen || user) return null;

  const bgImage = siteConfig?.register_popup_bg_image;
  const title = siteConfig?.register_popup_title || 'JOIN THE CLUB & GET 10% OFF';
  const subtitle =
    siteConfig?.register_popup_subtitle ||
    'Sign up now to get early access to drops, exclusive collections, and member-only discounts.';
  const btnText = siteConfig?.register_popup_btn_text || 'CREATE AN ACCOUNT';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300'>
      {/* Backdrop */}
      <div
        onClick={handleDismiss}
        className='absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity cursor-pointer'
      />

      {/* Modal Dialog */}
      <div
        className='relative w-full max-w-lg overflow-hidden border border-white/15 bg-black shadow-2xl animate-in zoom-in-95 duration-300'
        role='dialog'
        aria-modal='true'
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay over background image for crystal clear text readability */}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none' />

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className='absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/80 transition-colors cursor-pointer border border-white/10'
          aria-label='Close popup'
        >
          <X size={16} />
        </button>

        {/* Content */}
        <div className='relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center text-white'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-accent mb-3'>
            Exclusive Welcome Offer
          </p>

          <h2 className='text-2xl sm:text-3xl font-light uppercase tracking-widest text-white mb-4 leading-tight'>
            {title}
          </h2>

          <p className='text-xs sm:text-sm text-white/75 max-w-md mx-auto mb-8 leading-relaxed font-light'>
            {subtitle}
          </p>

          <div className='space-y-3 max-w-xs mx-auto'>
            <button
              onClick={handleRegisterClick}
              className='w-full inline-flex items-center justify-center gap-2 bg-white text-black hover:bg-accent hover:text-white px-6 py-3.5 text-xs font-semibold uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer'
            >
              <span>{btnText}</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={() => {
                handleDismiss();
                router.push('/login');
              }}
              className='block w-full text-center text-[11px] text-white/60 hover:text-white transition-colors uppercase tracking-wider py-1 cursor-pointer'
            >
              Already a member? <span className='underline font-medium text-white/80'>Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
