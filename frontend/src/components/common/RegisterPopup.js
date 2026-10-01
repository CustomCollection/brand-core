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
    // If user is already logged in, never show registration prompt
    if (user) return;

    // Check if user already saw or dismissed the prompt
    const seen = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (seen) return;

    // If popup is explicitly disabled in site configuration, don't show
    if (siteConfig && siteConfig.register_popup_enabled === false) return;

    // Show after exactly 5 seconds as requested
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 5000);

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
  const title = siteConfig?.register_popup_title || "DON'T FORGET TO REGISTER";
  const subtitle =
    siteConfig?.register_popup_subtitle ||
    'Create an account to track your orders, save items to your wishlist, and enjoy a faster checkout experience.';
  const btnText = siteConfig?.register_popup_btn_text || 'CREATE AN ACCOUNT';

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none animate-in fade-in duration-300'>
      {/* Click-away backdrop: completely transparent, keeps webpage background identical without any dark shade */}
      <div
        onClick={handleDismiss}
        className='fixed inset-0 bg-transparent pointer-events-auto cursor-default'
      />

      {/* Floating Modal Card */}
      <div
        className='pointer-events-auto relative w-full max-w-lg overflow-hidden border border-neutral-700 bg-neutral-950 shadow-[0_25px_60px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300'
        role='dialog'
        aria-modal='true'
        style={{
          backgroundImage: bgImage ? `url(${bgImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay inside the card only (so text is readable over the card's background image) */}
        <div className='absolute inset-0 bg-gradient-to-t from-black via-black/85 to-black/60 pointer-events-none' />

        {/* Close Button (z-50 ensures it is always clickable above content) */}
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleDismiss();
          }}
          className='absolute top-3 right-3 z-50 flex h-9 w-9 items-center justify-center rounded-full bg-black/80 text-white/90 hover:text-white hover:bg-neutral-800 transition-all cursor-pointer border border-white/30 shadow-lg active:scale-95'
          aria-label='Close popup'
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className='relative z-10 px-6 py-10 sm:px-10 sm:py-12 text-center text-white'>
          <p className='text-[11px] font-semibold uppercase tracking-[0.3em] text-accent mb-3'>
            Quick Reminder
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
