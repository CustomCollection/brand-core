'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ImageGallery({ images, productName }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className='aspect-[3/4] bg-surface flex items-center justify-center'>
        <p className='text-text-muted text-sm'>No image available</p>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className='flex flex-col gap-4 lg:flex-row-reverse lg:gap-4'>
      {/* Main image */}
      <div className='relative flex-1 overflow-hidden bg-surface'>
        <div
          className='aspect-[3/4] relative cursor-zoom-in'
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <Image
            src={activeImage.image_url}
            alt={activeImage.alt_text || productName}
            fill
            sizes='(max-width: 768px) 100vw, 50vw'
            className={cn(
              'object-cover transition-transform duration-500',
              isZoomed ? 'scale-125' : 'scale-100'
            )}
            priority
          />
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className='absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background flex items-center justify-center transition-colors'
                aria-label='Previous image'
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className='absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 bg-background/80 hover:bg-background flex items-center justify-center transition-colors'
                aria-label='Next image'
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          <button className='absolute top-3 right-3 h-8 w-8 bg-background/80 flex items-center justify-center' aria-label='Zoom'>
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className='flex gap-2 overflow-x-auto lg:flex-col lg:w-20 lg:overflow-y-auto lg:max-h-[600px]'>
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              onClick={() => setActiveIndex(idx)}
              className={cn(
                'flex-shrink-0 relative overflow-hidden border-2 transition-all',
                'w-16 h-20 lg:w-full lg:aspect-square',
                idx === activeIndex ? 'border-primary' : 'border-transparent hover:border-border'
              )}
              aria-label={`View image ${idx + 1}`}
            >
              <Image
                src={img.image_url}
                alt={img.alt_text || `${productName} ${idx + 1}`}
                fill
                sizes='80px'
                className='object-cover'
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
