import { Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';

function StarRating({ rating, max = 5 }) {
  return (
    <div className='flex gap-0.5' aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          size={14}
          className={i < rating ? 'text-accent fill-accent' : 'text-border fill-border'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <div className='border-b border-border py-6 last:border-0'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <p className='text-sm font-semibold text-text-primary'>{review.user_name}</p>
          <p className='text-xs text-text-muted mt-0.5'>{formatDate(review.created_at)}</p>
        </div>
        <StarRating rating={review.rating} />
      </div>
      {review.title && (
        <p className='mt-3 text-sm font-medium text-text-primary'>{review.title}</p>
      )}
      {review.text && (
        <p className='mt-2 text-sm text-text-secondary leading-relaxed'>{review.text}</p>
      )}
    </div>
  );
}

export default function ReviewList({ reviews, count, averageRating }) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className='py-8 text-center'>
        <p className='text-text-muted text-sm'>No reviews yet. Be the first to review this product!</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary */}
      {averageRating && (
        <div className='flex items-center gap-4 mb-6 pb-6 border-b border-border'>
          <div className='text-center'>
            <p className='text-4xl font-light text-text-primary'>{averageRating}</p>
            <p className='text-xs text-text-muted mt-1'>out of 5</p>
          </div>
          <div>
            <div className='flex gap-0.5 mb-1'>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.round(averageRating)
                      ? 'text-accent fill-accent'
                      : 'text-border fill-border'
                  }
                />
              ))}
            </div>
            <p className='text-sm text-text-secondary'>{count} review{count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {/* Reviews */}
      <div>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}
