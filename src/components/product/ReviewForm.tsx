import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

interface ReviewFormProps {
  onSubmit: (data: ReviewFormData) => void;
  loading?: boolean;
  initialData?: {
    rating: number;
    title: string;
    comment: string;
  } | null;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ onSubmit, loading = false, initialData = null }) => {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: initialData?.rating || 0,
    title: initialData?.title || '',
    comment: initialData?.comment || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        rating: initialData.rating,
        title: initialData.title,
        comment: initialData.comment,
      });
    }
  }, [initialData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'Comment is required';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'Comment must be at least 10 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }));
    }
  };

  const handleInputChange = (field: keyof ReviewFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Rating */}
      <div className="space-y-2">
        <Label>Rating *</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingClick(star)}
              className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= formData.rating
                    ? 'text-yellow-400 fill-current hover:text-yellow-500'
                    : 'text-gray-300 hover:text-gray-400'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating > 0 ? `${formData.rating}/5` : 'Click to rate'}
          </span>
        </div>
        {errors.rating && (
          <p className="text-sm text-red-600">{errors.rating}</p>
        )}
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="review-title">Review Title *</Label>
        <Input
          id="review-title"
          type="text"
          placeholder="Summarize your review in a few words"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          className={errors.title ? 'border-red-500' : ''}
          maxLength={100}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Comment */}
      <div className="space-y-2">
        <Label htmlFor="review-comment">Your Review *</Label>
        <Textarea
          id="review-comment"
          placeholder="Share your thoughts about this product..."
          value={formData.comment}
          onChange={(e) => handleInputChange('comment', e.target.value)}
          className={errors.comment ? 'border-red-500' : ''}
          rows={4}
          maxLength={1000}
        />
        <div className="flex justify-between items-center">
          {errors.comment && (
            <p className="text-sm text-red-600">{errors.comment}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {formData.comment.length}/1000 characters
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="min-w-[120px]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Submitting...
            </div>
          ) : (
            initialData ? 'Update Review' : 'Submit Review'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
