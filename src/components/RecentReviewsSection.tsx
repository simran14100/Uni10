import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const TRUNCATE_LENGTH = 150; // Max characters before truncation

interface Review {
  _id: string;
  text: string;
  rating: number;
  productId: {
    _id: string;
    title: string;
    slug: string;
    images?: string[]; // Add images property
  };
  userId: {
    _id: string;
    name: string;
  };
  createdAt: string;
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
    <div>
      <div className="flex items-center mb-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={cn(
              'h-4 w-4',
              i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            )}
          />
        ))}
      </div>
      <CardTitle className="text-base font-semibold line-clamp-2 mb-1">
        {review.productId?.title ? (
          <Link to={`/product/${review.productId.slug}`} className="hover:underline">
            {review.productId.title}
          </Link>
        ) : (
          "Product: N/A"
        )}
      </CardTitle>
      <p className="text-xs text-muted-foreground mb-2">
        On {new Date(review.createdAt).toLocaleDateString()}
      </p>
      <CardContent className="p-0 pt-2 border-t border-gray-100 dark:border-gray-800">
        <p className="text-sm text-muted-foreground mb-2">{displayedText}</p>
        {isTruncated && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-primary hover:underline font-medium"
          >
            {isExpanded ? 'Show Less' : 'Read More'}
          </button>
        )}
      </CardContent>
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
        const { ok, json } = await api('/api/reviews/recent?limit=5'); // Fetch up to 5 recent reviews
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
      <section className="container py-12 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading recent reviews...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container py-12 text-center">
        <p className="text-red-500">Error: {error}</p>
      </section>
    );
  }

  if (reviews.length === 0) {
    return (
      <section className="container py-12 text-center">
        <p className="text-muted-foreground">No recent reviews to display.</p>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">What Our Customers Say</h2>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-4">
            {reviews.map((review) => (
              <CarouselItem key={review._id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <Card className="flex flex-row items-start p-4 h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                  {(review.images && review.images.length > 0) || (review.productId.images && review.productId.images.length > 0) ? (
                    <div className="w-28 flex-shrink-0 mr-4 rounded-md overflow-hidden">
                      <img
                        src={review.images && review.images.length > 0 ? review.images[0] : (review.productId.images ? review.productId.images[0] : '')}
                        alt={review.productId.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  ) : null}
                  <div className="flex-grow flex flex-col justify-between h-full">
                    <ReviewContent review={review} />
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 bg-white shadow-md transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:-left-12 sm:h-10 sm:w-10" />
          <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 bg-white shadow-md transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:-right-12 sm:h-10 sm:w-10" />
        </Carousel>
      </div>
    </section>
  );
};
