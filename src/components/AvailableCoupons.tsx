import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Copy, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

type Coupon = {
  code: string;
  discount: number;
  expiryDate: string;
  offerText?: string;
  description?: string;
  termsAndConditions?: string;
};

type Props = {
  onUseNow?: (code: string) => void;
  productPrice: number;
  refreshTrigger?: number; // Add refreshTrigger prop
};

export const AvailableCoupons: React.FC<Props> = ({ onUseNow, productPrice, refreshTrigger }) => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        setLoading(true);
        const { ok, json } = await api('/api/coupons/active');
        if (ok && Array.isArray(json?.data)) {
          setCoupons(json.data);
        }
      } catch (error) {
        console.error('Failed to fetch coupons:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [refreshTrigger]);

  const handleUseNow = (code: string) => {
    if (onUseNow) {
      onUseNow(code);
      toast({ title: `Coupon ${code} copied to clipboard!` });
    }
  };

  const handleOpenModal = (content: string) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition(target.scrollLeft);
    setCanScrollLeft(target.scrollLeft > 0);
    setCanScrollRight(
      target.scrollLeft < target.scrollWidth - target.clientWidth - 10
    );
  };

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('coupon-scroll-container');
    if (container) {
      const scrollAmount = 250;
      const newPosition = direction === 'left' 
        ? container.scrollLeft - scrollAmount 
        : container.scrollLeft + scrollAmount;
      container.scrollTo({ left: newPosition, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = document.getElementById('coupon-scroll-container');
    if (container && coupons.length > 0) {
      setCanScrollRight(container.scrollWidth > container.clientWidth);
    }
  }, [coupons]);

  if (loading || coupons.length === 0) {
    return null;
  }

  return (
    <div className="my-4 bg-white dark:bg-slate-900">
      {/* Mobile collapsible header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="md:hidden w-full flex items-center justify-between p-3"
      >
        <h3 className="font-semibold text-sm text-foreground">Available Coupons</h3>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {/* Desktop or expanded mobile */}
      {expanded && (
        <div className="px-3 pb-3">
          <h3 className="hidden md:block font-semibold text-base mb-3 text-gray-900 dark:text-white">Available Coupons</h3>
          
          <div className="relative group">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}

            {/* Coupons Container */}
            <div 
              id="coupon-scroll-container"
              className="flex overflow-x-auto gap-3 pb-2 scroll-smooth snap-x snap-mandatory hide-scrollbar"
              onScroll={handleScroll}
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {coupons.map((coupon) => {
                const discountedPrice = productPrice * (1 - coupon.discount / 100);
                return (
                  <div
                    key={coupon.code}
                    className="relative px-3 py-2.5 rounded-md border-2 border-[#D4AF37] dark:border-yellow-600 bg-[#FFFEF7] dark:bg-yellow-900/20 flex-shrink-0 w-[240px] snap-start"
                  >
                    {/* Top Badge */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="text-xs">💰</span>
                        <span>Save extra with these offers</span>
                      </div>
                    </div>

                    {/* Offer Text */}
                    {coupon.offerText && (
                      <p className="text-base font-bold text-gray-900 dark:text-gray-900 mb-1">
                        {coupon.offerText} ₹{discountedPrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        {' '}<span className="text-xs text-gray-400 line-through font-normal">₹{productPrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                      </p>
                    )}

                    {/* Description */}
                    {coupon.description && (
                      <p className="text-xs text-red-800 dark:text-red-800 mb-2 flex items-center gap-1">
                        <Flame className="h-3 w-3" /> {coupon.description}
                      </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-dashed border-[#D4AF37]/40 dark:border-gray-600 my-2"></div>

                    {/* Code and T&C */}
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-1.5 cursor-pointer group/copy"
                        onClick={() => handleUseNow(coupon.code)}
                      >
                        <p className="text-sm font-semibold text-[#1F2937] dark:text-white">
                          Code: <span className="text-[#1F2937] dark:text-white">{coupon.code}</span>
                        </p>
                        <Copy className="h-3.5 w-3.5 text-[#1F2937] dark:text-gray-400 group-hover/copy:text-[#FDB022] transition-colors" />
                      </div>
                      {coupon.termsAndConditions && (
                        <button
                          onClick={() => handleOpenModal(coupon.termsAndConditions || '')}
                          className="text-xs text-[#2563EB] dark:text-blue-400 hover:underline focus:outline-none font-medium"
                        >
                          Offer T&C
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 shadow-lg rounded-full p-1.5 hover:bg-gray-50 dark:hover:bg-slate-700 transition-all opacity-0 group-hover:opacity-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            )}
          </div>

          {/* Progress Indicator */}
          {coupons.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-3">
              {coupons.map((_, index) => {
                const isActive = Math.abs(scrollPosition - (index * 250)) < 125;
                return (
                  <div
                    key={index}
                    className={`h-1.5 rounded-full transition-all ${
                      isActive 
                        ? 'w-6 bg-gray-600 dark:bg-gray-300' 
                        : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Details for the selected coupon offer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 text-sm text-gray-700 dark:text-gray-300">
            {modalContent ? (
              <div dangerouslySetInnerHTML={{ __html: modalContent.replace(/\n/g, '<br/>') }} />
            ) : (
              <p>No terms and conditions available for this coupon.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};