import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Rating } from "@/components/ui/Rating";
import { Button } from "@/components/ui/button";
import { Loader2, Star, MessageSquare } from "lucide-react";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: string;
  username: string;
  email: string;
  rating: number;
  text: string;
  images: string[];
  status: string;
  approved: boolean;
  createdAt: string;
  product?: {
    _id: string;
    title: string;
    slug: string;
    images: string[];
  };
}

interface RecentReviewsSectionProps {
  limit?: number;
  showViewAll?: boolean;
}

export const RecentReviewsSection = ({ limit = 6, showViewAll = true }: RecentReviewsSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentReviews();
  }, [limit]);

  const fetchRecentReviews = async () => {
    try {
      setLoading(true);
      // Since we don't have a specific endpoint for recent reviews across all products,
      // we'll fetch from a general reviews endpoint or create one
      const { ok, json } = await api(`/api/reviews/recent?limit=${limit}`);
      if (ok && json?.data) {
        setReviews(json.data);
      } else {
        // Fallback: if no recent reviews endpoint, show empty state
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching recent reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reviews Yet</h3>
        <p className="text-gray-600">Be the first to share your experience with our products!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Reviews</h2>
          <p className="text-gray-600 mt-1">What our customers are saying</p>
        </div>
        {showViewAll && (
          <Button variant="outline">
            View All Reviews
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
            {/* Rating and Date */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Rating value={review.rating} onChange={() => {}} />
              </div>
              <span className="text-sm text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>

            {/* Review Text */}
            <div className="mb-4">
              <p className="text-gray-700 leading-relaxed">
                {truncateText(review.text)}
              </p>
            </div>

            {/* Reviewer Info */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{review.username}</p>
                {review.product && (
                  <p className="text-sm text-gray-600">
                    Reviewed: {review.product.title}
                  </p>
                )}
              </div>
              
              {review.images && review.images.length > 0 && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center mr-1">
                    <span className="text-xs">{review.images.length}</span>
                  </div>
                  <span>photos</span>
                </div>
              )}
            </div>

            {/* Product Link */}
            {review.product && (
              <div className="mt-4 pt-4 border-t">
                <a
                  href={`/product/${review.product.slug}`}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Product →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {showViewAll && reviews.length > 0 && (
        <div className="text-center">
          <Button variant="outline" size="lg">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  );
};

export default RecentReviewsSection;
