import { useState } from 'react';
import { Star, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import type { Review } from '@/types';

interface ReviewSectionProps {
  reviews: Review[];
  onAddReview?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
}

export function ReviewSection({ reviews, onAddReview }: ReviewSectionProps) {
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'recent') {
      return b.createdAt - a.createdAt;
    }
    // In a real app, we'd sort by helpful votes
    return b.score - a.score;
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <div className="flex gap-2">
          <Button
            variant={sortBy === 'recent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('recent')}
          >
            Recent
          </Button>
          <Button
            variant={sortBy === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSortBy('helpful')}
          >
            Most Helpful
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <div
            key={review.id}
            className="rounded-lg border bg-card p-4 shadow-sm"
          >
            <div className="mb-2 flex items-start justify-between">
              <div>
                <span className="font-medium">{review.userName}</span>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(new Date(review.createdAt).toISOString())}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{(review.score / 10).toFixed(1)}</span>
                </div>
                <Button variant="ghost" size="sm">
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Helpful
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.summary}</p>
          </div>
        ))}
      </div>
    </section>
  );
}