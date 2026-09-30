'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

export default function HeroSlider({ banners = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

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

  // 10-second auto-slide interval (paused on hover or touch)
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      goToNext();
    }, 10000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [total, isPaused, goToNext, currentIndex]);

  if (total === 0) {
    return (
      <section className='relative flex min-h-screen items-center justify-center overflow-hidden bg-primary'>
        <div className='absolute inset-0 bg-gradient-to-b from-primary via-primary/95 to-background' />
        <div className='relative z-10 text-center px-4 max-w-3xl mx-auto'>
          <p className='text-xs font-semibold uppercase tracking-[0.3em] text-accent mb-4'>
            Premium Apparel
          </p>
          <h1 className='text-5xl sm:text-6xl font-light uppercase tracking-widest text-background mb-6'>
            CustomCollection
          </h1>
          <p className='text-sm text-background/70 tracking-wide max-w-lg mx-auto mb-8'>
            Exclusive heavyweight cotton oversized tees and streetwear essentials.
          </p>
          <Link
            href='/collections'
            className='inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors'
          >
            <span>Explore Shop</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  const currentBanner = activeBanners[currentIndex];

  return (
    <section
      className='relative flex min-h-[85vh] sm:min-h-screen items-center justify-center overflow-hidden bg-neutral-900 select-none group'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Banner Images Carousel */}
      {activeBanners.map((banner, index) => {
        const isActive = index === currentIndex;
        const hasOverlayContent =
          banner.show_content !== false &&
          (Boolean(banner.title) || Boolean(banner.subtitle) || (Boolean(banner.link_text) && Boolean(banner.link_url)));

        return (
          <div
            key={banner.id || index}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
            }`}
          >
            {banner.link_url ? (
              <Link href={banner.link_url} className='absolute inset-0 block w-full h-full'>
                <Image
                  src={banner.image_url}
                  alt={banner.title || 'Hero Banner'}
                  fill
                  priority={index === 0}
                  className='object-cover'
                  sizes='100vw'
                />
                {hasOverlayContent && (
                  <div className='absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors' />
                )}
              </Link>
            ) : (
              <>
                <Image
                  src={banner.image_url}
                  alt={banner.title || 'Hero Banner'}
                  fill
                  priority={index === 0}
                  className='object-cover'
                  sizes='100vw'
                />
                {hasOverlayContent && <div className='absolute inset-0 bg-black/30' />}
              </>
            )}

            {/* Optional Banner Text Overlay only if show_content is enabled */}
            {hasOverlayContent && (
              <div className='absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-6 pointer-events-none'>
                <div className='max-w-3xl space-y-4'>
                  {banner.subtitle && (
                    <p className='text-xs sm:text-sm font-semibold uppercase tracking-[0.3em] text-accent drop-shadow-md'>
                      {banner.subtitle}
                    </p>
                  )}
                  {banner.title && (
                    <h2 className='text-4xl sm:text-6xl font-light uppercase tracking-widest text-background drop-shadow-lg'>
                      {banner.title}
                    </h2>
                  )}
                  {banner.link_text && banner.link_url && (
                    <div className='pt-4 pointer-events-auto'>
                      <Link
                        href={banner.link_url}
                        className='inline-flex items-center gap-2 px-8 py-3.5 bg-accent text-background text-xs font-semibold uppercase tracking-widest hover:bg-accent-dark transition-colors shadow-lg'
                      >
                        <span>{banner.link_text}</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Navigation Buttons (Only shown if multiple banners) */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              goToPrev();
            }}
            aria-label='Previous slide'
            className='absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 text-background/80 hover:text-background hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-all rounded-full opacity-80 group-hover:opacity-100 hover:scale-105'
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
            aria-label='Next slide'
            className='absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/40 text-background/80 hover:text-background hover:bg-black/70 backdrop-blur-sm border border-white/10 transition-all rounded-full opacity-80 group-hover:opacity-100 hover:scale-105'
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className='absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-2 bg-black/30 backdrop-blur-sm rounded-full border border-white/10'>
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-7 h-2 bg-accent'
                    : 'w-2 h-2 bg-background/50 hover:bg-background/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
