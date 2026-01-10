import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Loader2, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

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
    name: string;
    email?: string;
  };
  createdAt: string;
  images?: string[];
}

interface ReviewContentProps {
  review: Review;
}

const ReviewContent = ({ review }: ReviewContentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isTruncated = review.text.length > TRUNCATE_LENGTH;
  const displayedText = isExpanded || !isTruncated
    ? review.text
    : `${review.text.slice(0, TRUNCATE_LENGTH)}...`;

  return (
    <div className="space-y-3">
      {/* Rating Stars */}
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-5 w-5 transition-colors',
              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
            )}
          />
        ))}
      </div>

      {/* Review Text with Quote Icon */}
      <div className="relative">
        <Quote className="absolute -top-1 -left-1 h-8 w-8 text-gray-200 dark:text-gray-700" />
        <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300 pl-6 italic">
          "{displayedText}"
        </p>
      </div>

      {/* Read More Button */}
      {isTruncated && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {isExpanded ? '← Show Less' : 'Read More →'}
        </button>
      )}

      {/* Customer Info */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
        <p className="font-semibold text-sm text-gray-900 dark:text-white">
          {review.userId?.name || 'Anonymous'}
        </p>
        {review.userId?.email && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {review.userId.email}
          </p>
        )}
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {new Date(review.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </p>
      </div>

      {/* Product Link */}
      {review.productId?.title && (
        <Link 
          to={`/product/${review.productId.slug}`} 
          className="inline-flex items-center text-xs text-gray-600 dark:text-gray-400 hover:text-primary transition-colors group"
        >
          <span className="group-hover:underline">Reviewed: {review.productId.title}</span>
          <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      )}
    </div>
  );
};

export const RecentReviewsSection = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api('/api/reviews/recent?limit=6');
        if (ok) {
          setReviews(json.data);
        } else {
          setError(json?.message || 'Failed to fetch recent reviews.');
          toast({
            title: 'Error',
            description: json?.message || 'Failed to fetch recent reviews.',
            variant: 'destructive',
          });
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred.');
        toast({
          title: 'Error',
          description: err.message || 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRecentReviews();
  }, [toast]);

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">Loading customer reviews...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <p className="text-red-500 text-sm">Error: {error}</p>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto text-center">
          <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to share your experience!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-2">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-medium text-primary">Customer Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Real experiences from real customers. See why they love shopping with us.
          </p>
        </div>

        {/* Reviews Carousel */}
        <div className="relative max-w-7xl mx-auto">
          <Carousel 
            opts={{ 
              align: "start", 
              loop: true,
              skipSnaps: false,
            }} 
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {reviews.map((review) => {
                const reviewImage = review.images?.[0];
                const productImage = review.productId?.images?.[0];
                const displayImage = reviewImage || productImage;

                return (
                  <CarouselItem 
                    key={review._id} 
                    className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
                  >
                    <Card className="h-full bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
                      {displayImage && (
                        <div className="relative flex items-center justify-center min-h-[14rem] overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img
                            src={displayImage}
                            alt={review.productId?.title || 'Product'}
                            className="max-w-full max-h-[14rem] object-contain transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      
                      <CardContent className="p-6">
                        <ReviewContent review={review} />
                      </CardContent>
                    </Card>
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {/* Navigation Buttons */}
            <CarouselPrevious className="hidden md:flex -left-5 h-11 w-11 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300" />
            <CarouselNext className="hidden md:flex -right-5 h-11 w-11 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-110 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300" />
          </Carousel>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Join thousands of satisfied customers
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="font-semibold text-gray-900 dark:text-white">4.9/5</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <span className="text-gray-600 dark:text-gray-400">
              Based on {reviews.length}+ reviews
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};