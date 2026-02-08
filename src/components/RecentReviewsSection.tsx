import { useEffect, useState } from 'react';
import { Star, Loader2, Quote, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

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
    name?: string;
    email?: string;
    profileImage?: string;
  };
  username?: string;
  email?: string;
  createdAt: string;
  images?: string[];
}

interface ReviewCardProps {
  review: Review;
  color: 'footer-dark' | 'footer-light';
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const ReviewCard = ({ review, color, isExpanded, onToggleExpand }: ReviewCardProps) => {
  const isDark = color === 'footer-dark';
  const bgGradient = isDark
    ? 'bg-gradient-to-br from-gray-900 to-black'
    : 'bg-gradient-to-br from-red-600 to-red-700';
  const borderColor = isDark ? 'border-red-500/30' : 'border-white/40';
  const quoteColor = isDark ? 'text-red-500/25' : 'text-white/30';
  const avatarBg = isDark ? 'bg-red-500/20' : 'bg-white/25';

  const needsTruncation = review.text.length > 150;

  return (
    <div className={`relative ${bgGradient} rounded-3xl p-6 sm:p-8 h-full min-h-[320px] flex flex-col shadow-xl`}>
      {/* Bottom Quote (moved from bottom) */}
      <Quote className={`absolute top-6 left-6 h-10 w-10 ${quoteColor} transform rotate-180`} />

      {/* Curved Border Frame */}
      <div className={`absolute top-4 left-4 right-4 bottom-4 border-2 ${borderColor} rounded-3xl pointer-events-none`} />

      {/* Profile Image */}
      <div className="relative z-10 flex justify-center mb-4 sm:mb-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-4 border-white/90 shadow-xl ring-2 ring-red-500/40">
          {review.userId?.profileImage ? (
            <img src={review.userId.profileImage} alt={review.username || review.userId.name || 'Anonymous'} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full ${avatarBg} backdrop-blur-sm flex items-center justify-center text-white text-xl sm:text-2xl font-bold`}>
              {(review.username || review.userId?.name)?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
        </div>
      </div>

      {/* Review Text */}
      <div className="relative z-10 flex-1 flex flex-col items-center mb-4 sm:mb-6">
        <p className={`text-white text-sm leading-relaxed text-center px-2 font-medium ${
          !isExpanded && needsTruncation 
            ? 'line-clamp-4 sm:line-clamp-none' 
            : ''
        }`}>
          {review.text}
        </p>
        
        {needsTruncation && (
          <button
            onClick={onToggleExpand}
            className="sm:hidden mt-2 flex items-center gap-1 text-red-200 hover:text-white text-xs font-medium transition-colors"
          >
            {isExpanded ? (
              <>
                <span>Read Less</span>
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                <span>Read More</span>
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* User Name and Rating */}
      <div className="relative z-10 text-center space-y-2">
        <p className="text-white font-bold text-base sm:text-lg">
          {review.username || review.userId?.name || 'Anonymous'}
        </p>
        
        {/* Rating Stars */}
        <div className="flex items-center justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 sm:h-4 sm:w-4 ${
                i < review.rating 
                  ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm' 
                  : 'fill-white/30 text-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Top Quote (moved from top) */}
      <Quote className={`absolute bottom-6 right-6 h-10 w-10 ${quoteColor}`} />
    </div>
  );
};

export default function RecentReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchRecentReviews = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching recent reviews...');
        
        if (typeof api === 'function') {
          const { ok, json } = await api('/api/reviews/recent?limit=6');
          console.log('📊 API Response:', { ok, json });
          if (ok) {
            console.log('✅ Reviews received:', json.data?.length || 0);
            setReviews(json.data);
          } else {
            console.log('❌ API Error:', json?.message);
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        } else {
          const response = await fetch('/api/reviews/recent?limit=6');
          const json = await response.json();
          console.log('📊 Fetch Response:', { status: response.status, json });
          
          if (response.ok) {
            console.log('✅ Reviews received:', json.data?.length || 0);
            setReviews(json.data);
          } else {
            console.log('❌ Fetch Error:', json?.message);
            setError(json?.message || 'Failed to fetch recent reviews.');
          }
        }
      } catch (err: any) {
        console.log('💥 Exception:', err);
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
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-600" />
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
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 rounded-full mb-2">
            <Star className="h-4 w-4 fill-red-600 text-red-600" />
            <span className="text-sm font-medium text-red-600">Customer Reviews</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            What Our Customers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Real experiences from real customers. See why they love shopping with us.
          </p>
        </div>

        {/* Reviews Slider */}
        <div className="relative max-w-7xl mx-auto mb-12">
          <Carousel opts={{ align: "start", loop: true }} className="w-full">
            <CarouselContent className="-ml-4 md:-ml-6">
              {reviews.map((review, index) => {
                const color = index % 2 === 0 ? 'footer-dark' : 'footer-light';
                const isExpanded = expandedReviews.has(review._id);
                const toggleExpand = () => {
                  setExpandedReviews(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(review._id)) {
                      newSet.delete(review._id);
                    } else {
                      newSet.add(review._id);
                    }
                    return newSet;
                  });
                };
                return (
                  <CarouselItem key={review._id} className="pl-4 md:pl-6 basis-full sm:basis-1/2 lg:basis-1/3">
                    <ReviewCard 
                      review={review} 
                      color={color} 
                      isExpanded={isExpanded}
                      onToggleExpand={toggleExpand}
                    />
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            {/* Navigation Buttons - Desktop */}
            <div className="hidden sm:flex gap-2 absolute -top-[72px] right-0">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 transition-all" />
              <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 transition-all" />
            </div>
            {/* Navigation Buttons - Mobile */}
            <div className="flex sm:hidden justify-center gap-2 mt-6">
              <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 transition-all" />
              <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-red-600 hover:bg-red-50 transition-all" />
            </div>
          </Carousel>
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