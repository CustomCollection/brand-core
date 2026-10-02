'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HeroSlider({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const activeBanners = banners.filter((b) => b && b.image_url);
  const total = activeBanners.length;

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Auto-slide interval (paused on hover or touch)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, goToNext, currentIndex]);

  // Touch swipe support for mobile
  const handleTouchStart = (e) => {
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
  };

  if (total === 0) {
    return (
      <section className='relative flex min-h-[50vh] sm:min-h-[70vh] md:min-h-screen items-center justify-center overflow-hidden bg-primary'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-background' />
        <div className='relative z-10 text-center px-4 max-w-3xl mx-auto'>
          <p className='text-[10px] sm:text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-3 sm:mb-4'>
            Premium Apparel
          </p>
          <h1 className='text-3xl sm:text-5xl md:text-6xl font-light uppercase tracking-widest text-background mb-4 sm:mb-6'>
            CustomCollection
          </h1>
          <p className='text-xs sm:text-sm text-background/70 tracking-wide max-w-lg mx-auto mb-6 sm:mb-8'>
            Exclusive heavyweight cotton oversized tees and streetwear essentials.
          </p>
          <Link
            href='/collections'
            className='inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors'
          >
            <span>Explore Shop</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section
      className='relative w-full aspect-[16/9] sm:aspect-[16/9] md:aspect-auto md:min-h-[85vh] lg:min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950 select-none group'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Images Carousel */}
      {activeBanners.map((banner, index) => {
        const isActive = index === currentIndex;
        const hasOverlayContent =
          banner.show_content !== false &&
          (Boolean(banner.title) ||
            Boolean(banner.subtitle) ||
            (Boolean(banner.link_text) && Boolean(banner.link_url)));

        return (
          <div
            key={banner.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            {banner.link_url ? (
              <Link
                href={banner.link_url}
                className='absolute inset-0 block w-full h-full'
              >
                <Image
                  src={banner.image_url}
                  alt={banner.title || 'Hero Banner'}
                  fill
                  priority={index === 0}
                  className='object-cover object-center'
                  sizes='(max-width: 768px) 100vw, 100vw'
                />
                {hasOverlayContent && (
                  <div className='absolute inset-0 bg-black/35 group-hover:bg-black/25 transition-colors' />
                )}
              </Link>
            ) : (
              <>
                <Image
                  src={banner.image_url}
                  alt={banner.title || 'Hero Banner'}
                  fill
                  priority={index === 0}
                  className='object-cover object-center'
                  sizes='(max-width: 768px) 100vw, 100vw'
                />
                {hasOverlayContent && (
                  <div className='absolute inset-0 bg-black/35' />
                )}
              </>
            )}

            {/* Optional Banner Text Overlay only if show_content is enabled */}
            {hasOverlayContent && (
              <div className='absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 pointer-events-none'>
                <div className='max-w-3xl space-y-2 sm:space-y-4'>
                  {banner.subtitle && (
                    <p className='text-[10px] sm:text-xs md:text-sm font-semibold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-accent drop-shadow-md'>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.title && (
                    <h2 className='text-xl sm:text-3xl md:text-5xl lg:text-6xl font-light uppercase tracking-widest text-background drop-shadow-lg leading-tight'>
                      {banner.title}
                    </h2>
                  )}
                  {banner.link_text && banner.link_url && (
                    <div className='pt-1 sm:pt-3 pointer-events-auto'>
                      <Link
                        href={banner.link_url}
                        className='inline-flex items-center gap-1.5 sm:gap-2 px-4 py-2 sm:px-8 sm:py-3.5 bg-accent text-background text-[10px] sm:text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors shadow-lg'
                      >
                        <span>{banner.link_text}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Desktop Prev / Next Nav Arrows (shown on hover if multiple banners) */}
      {total > 1 && (
        <>
          <button
            type='button'
            onClick={goToPrev}
            aria-label='Previous slide'
            className='hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm'
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type='button'
            onClick={goToNext}
            aria-label='Next slide'
            className='hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 items-center justify-center rounded-full bg-black/40 text-white/90 hover:bg-black/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm'
          >
            <ChevronRight size={22} />
          </button>
        </>
      )}

      {/* Dots Indicator (Only shown if multiple banners) */}
      {total > 1 && (
        <div className='absolute bottom-3 sm:bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/10'>
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? 'w-5 sm:w-7 h-1.5 sm:h-2 bg-accent'
                  : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-background/50 hover:bg-background/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
