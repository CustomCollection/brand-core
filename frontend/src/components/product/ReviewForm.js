'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { apiPost } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

export default function ReviewForm({ productSlug, onSuccess }) {
  const toast = useToast();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.warning('Please select a rating.'); return; }

    setIsSubmitting(true);
    try {
      await apiPost(ENDPOINTS.REVIEWS.CREATE(productSlug), { rating, title, text });
      toast.success('Review submitted! It will appear after approval.');
      setRating(0);
      setTitle('');
      setText('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div>
        <p className='text-xs font-semibold uppercase tracking-wider text-text-primary mb-2'>Your Rating *</p>
        <div className='flex gap-1'>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type='button'
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                size={24}
                className={cn(
                  'transition-colors',
                  star <= (hoverRating || rating)
                    ? 'text-accent fill-accent'
                    : 'text-border fill-border'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className='text-xs font-semibold uppercase tracking-wider text-text-primary block mb-1'>
          Review Title
        </label>
        <input
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Summarise your experience'
          className='w-full border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-transparent focus:outline-none focus:border-primary transition-colors'
          maxLength={100}
        />
      </div>

      <div>
        <label className='text-xs font-semibold uppercase tracking-wider text-text-primary block mb-1'>
          Your Review
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Share your experience with this product…'
          rows={4}
          className='w-full border border-border px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted bg-transparent focus:outline-none focus:border-primary transition-colors resize-none'
        />
      </div>

      <Button type='submit' isLoading={isSubmitting}>
        Submit Review
      </Button>
    </form>
  );
}
