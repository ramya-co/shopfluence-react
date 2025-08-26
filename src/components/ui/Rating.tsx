import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
  readonly?: boolean;
  onRatingChange?: (rating: number) => void;
}

export const Rating: React.FC<RatingProps> = ({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
  readonly = true,
  onRatingChange,
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const handleStarClick = (starRating: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[...Array(maxRating)].map((_, index) => {
          const starRating = index + 1;
          const isFilled = starRating <= rating;
          const isPartiallyFilled = !isFilled && starRating - 1 < rating;
          
          return (
            <div
              key={index}
              className={cn(
                'relative',
                !readonly && 'cursor-pointer hover:scale-110 transition-transform'
              )}
              onClick={() => handleStarClick(starRating)}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  'text-border stroke-current',
                  isFilled && 'fill-rating text-rating',
                )}
              />
              {isPartiallyFilled && (
                <Star
                  className={cn(
                    sizeClasses[size],
                    'absolute top-0 left-0 fill-rating text-rating'
                  )}
                  style={{
                    clipPath: `inset(0 ${100 - ((rating - Math.floor(rating)) * 100)}% 0 0)`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {showValue && (
        <span className={cn('text-muted-foreground ml-1', textSizeClasses[size])}>
          ({rating.toFixed(1)})
        </span>
      )}
    </div>
  );
};