import React, { useState, useEffect } from 'react';
import { Star, User, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useToast } from '../../hooks/use-toast';
import ReviewForm from '@/components/product/ReviewForm';

interface Review {
  id: number;
  rating: number;
  title: string;
  comment: string;
  user_name: string;
  user_username: string;
  can_edit: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  slug: string;
  name: string;
  average_rating: number;
  review_count: number;
  reviews?: Review[];
}

interface ReviewSectionProps {
  product: Product;
  onReviewUpdate?: () => void;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ product, onReviewUpdate }) => {
  const { state } = useAuth();
  const { user, isAuthenticated } = state;
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>(product.reviews || []);
  const [loading, setLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await api.products.reviews(product.slug);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.results || data);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product.slug) {
      loadReviews();
    }
  }, [product.slug]);

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      setLoading(true);
      
      if (editingReview) {
        // Update existing review
        const response = await api.reviews.update(editingReview.id, reviewData);
        if (response.ok) {
          toast({
            title: "Review updated successfully!",
            description: "Your review has been updated.",
          });
          setEditingReview(null);
        } else {
          throw new Error('Failed to update review');
        }
      } else {
        // Create new review
        const response = await api.products.createReview(product.slug, {
          ...reviewData,
          product: product.id
        });
        if (response.ok) {
          toast({
            title: "Review submitted successfully!",
            description: "Thank you for your feedback.",
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit review');
        }
      }
      
      setShowReviewForm(false);
      await loadReviews();
      onReviewUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    
    try {
      setLoading(true);
      const response = await api.reviews.delete(reviewId);
      if (response.ok) {
        toast({
          title: "Review deleted",
          description: "Your review has been deleted successfully.",
        });
        await loadReviews();
        onReviewUpdate?.();
      } else {
        throw new Error('Failed to delete review');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' = 'md') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClass} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const userHasReviewed = reviews.some(review => 
    review.user_username === user?.username
  );

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Customer Reviews</CardTitle>
            {isAuthenticated && !userHasReviewed && (
              <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Write a Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Write a Review for {product.name}</DialogTitle>
                  </DialogHeader>
                  <ReviewForm
                    onSubmit={handleReviewSubmit}
                    loading={loading}
                    initialData={editingReview}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {renderStars(product.average_rating)}
              <span className="text-lg font-medium">
                {product.average_rating?.toFixed(1) || '0.0'}
              </span>
            </div>
            <span className="text-gray-600">
              ({product.review_count || 0} {product.review_count === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading && reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
              <p className="text-gray-600 mb-4">
                Be the first to share your thoughts about this product.
              </p>
              {isAuthenticated && (
                <Dialog open={showReviewForm} onOpenChange={setShowReviewForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Write the First Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Write a Review for {product.name}</DialogTitle>
                    </DialogHeader>
                    <ReviewForm
                      onSubmit={handleReviewSubmit}
                      loading={loading}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {review.user_name || review.user_username}
                      </h4>
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating, 'sm')}
                        <span className="text-sm text-gray-600">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {review.can_edit && (
                    <div className="flex items-center gap-2">
                      <Dialog 
                        open={editingReview?.id === review.id} 
                        onOpenChange={(open) => setEditingReview(open ? review : null)}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Your Review</DialogTitle>
                          </DialogHeader>
                          <ReviewForm
                            onSubmit={handleReviewSubmit}
                            loading={loading}
                            initialData={review}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteReview(review.id)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-medium text-gray-900">{review.title}</h5>
                  <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  {review.updated_at !== review.created_at && (
                    <p className="text-sm text-gray-500">
                      Updated on {new Date(review.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
