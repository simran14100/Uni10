import React, { useEffect, useState } from 'react';
import { Star, Loader2, Quote } from 'lucide-react';

// Add this type for the API utility
declare const api: (url: string) => Promise<{ok: boolean, json: any}>;

const TRUNCATE_LENGTH = 120;

interface Review {
  _id: string;
  text: string;
  rating: number;
  productId: {
    _id: string;
    title: string;
    slug: string;
    images?: string[];
  };
  userId: {
    _id: string;
    name?: string; // Make name optional if username is preferred
    email?: string;
    profileImage?: string;
  };
  username?: string; // Add top-level username
  email?: string; // Add top-level email
  createdAt: string;
  images?: string[];
}

interface ReviewCardProps {
  review: Review;
  color: 'red' | 'blue';
}

const ReviewCard = ({ review, color }: ReviewCardProps) => {
  const bgColor = color === 'blue' ? 'bg-[#1a1d2e]' : 'bg-red-600';
  const borderColor = color === 'blue' ? 'border-gray-600' : 'border-red-500';
  const quoteColor = color === 'blue' ? 'text-gray-600' : 'text-red-400';

  return (
    <div className={`relative ${bgColor} rounded-3xl p-8 h-full min-h-[320px] flex flex-col`}>
      {/* Top Left Quote */}
      <Quote className={`absolute top-6 left-6 h-10 w-10 ${quoteColor} opacity-40`} />

      {/* Curved Border Frame */}
      <div className={`absolute top-4 left-4 right-4 bottom-4 border-2 ${borderColor} rounded-3xl pointer-events-none`} />

      {/* Profile Image - Positioned at top */}
      <div className="relative z-10 flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
          {review.userId?.profileImage ? (
            <img src={review.userId.profileImage} alt={review.username || review.userId.name || 'Anonymous'} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-2xl font-bold">
              {(review.username || review.userId?.name)?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div className="relative z-10 flex-1 flex items-center mb-6">
        <p className="text-white text-sm leading-relaxed text-center px-2">
          {review.text}
        </p>
      </div>

      {/* User Name and Rating at Bottom */}
      <div className="relative z-10 text-center space-y-2">
        <p className="text-white font-bold text-lg">
          {review.username || review.userId?.name || 'Anonymous'}
        </p>
        
        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-400 text-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Right Quote */}
      <Quote className={`absolute bottom-6 right-6 h-10 w-10 ${quoteColor} opacity-40 transform rotate-180`} />
    </div>
  );
};

export default function RecentReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        
        // Check if api utility is available
        if (typeof api === 'function') {
          const { ok, json } = await api('/api/reviews/recent?limit=6');
          if (ok) {
            setReviews(json.data);
          } else {
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        } else {
          // Fallback to fetch
          const response = await fetch('/api/reviews/recent?limit=6');
          const json = await response.json();
          
          if (response.ok) {
            setReviews(json.data);
          } else {
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm text-gray-600">Loading customer reviews...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto text-center">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto text-center">
          <p className="text-gray-500">No reviews yet. Be the first to share your experience!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full mb-2">
            <Star className="h-4 w-4 fill-blue-600 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Customer Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real experiences from real customers. See why they love shopping with us.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-12">
          {reviews.map((review, index) => {
            const color = index % 2 === 0 ? 'red' : 'blue';
            return (
              <ReviewCard key={review._id} review={review} color={color} />
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Join thousands of satisfied customers
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-900">4.9/5</span>
            </div>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-gray-600">
              Based on {reviews.length}+ reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}