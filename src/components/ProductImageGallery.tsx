import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images?: string[];
  productTitle?: string;
  selectedColor?: string;
  colorImages?: Record<string, string[]>;
  colorVariants?: Array<{
    colorName: string;
    colorCode?: string;
    images: string[];
    primaryImageIndex?: number;
  }>;
  productId?: string;
  showWishlistButton?: boolean;
  showShareButton?: boolean;
  onWishlistClick?: () => void;
  onShareClick?: () => void;
  isInWishlist?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;
  const isLocalBase = (() => {
    try {
      return (
        API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1")
      );
    } catch {
      return false;
    }
  })();
  const isHttpsPage = (() => {
    try {
      return location.protocol === "https:";
    } catch {
      return false;
    }
  })();
  if (s.startsWith("/uploads") || s.startsWith("uploads")) {
    if (API_BASE && !(isLocalBase && isHttpsPage)) {
      const base = API_BASE.endsWith("/")
        ? API_BASE.slice(0, -1)
        : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    } else {
      return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
    }
  }
  return s;
};

export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images = [],
  productTitle = 'Product',
  selectedColor,
  colorImages,
  colorVariants,
  productId,
  showWishlistButton = false,
  showShareButton = false,
  onWishlistClick,
  onShareClick,
  isInWishlist = false,
}) => {
  console.log('images prop:', images);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [thumbScrollPos, setThumbScrollPos] = useState(0);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Global mouse up handler to clear active states
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Clear any active states by removing focus from all elements
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Remove any active classes from buttons
      document.querySelectorAll('button:active').forEach(el => {
        (el as HTMLElement).blur();
      });
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Get images for the selected color
  // First, try the new colorVariants structure
  // Then fallback to old colorImages structure
  // Finally, fallback to default images
  const getImagesForSelectedColor = (): string[] => {
    if (selectedColor) {
      // Try new colorVariants structure first
      if (colorVariants && Array.isArray(colorVariants)) {
        const variant = colorVariants.find(cv => cv.colorName === selectedColor);
        if (variant && Array.isArray(variant.images) && variant.images.length > 0) {
          return variant.images;
        }
      }

      // Fallback to old colorImages structure
      if (colorImages && typeof colorImages === 'object' && colorImages[selectedColor]?.length > 0) {
        const primaryColorImage = colorImages[selectedColor][0];
        // Filter out the primaryColorImage from the general images to avoid duplication
        const filteredGeneralImages = images.filter(img => img !== primaryColorImage);
        return [primaryColorImage, ...filteredGeneralImages];
      }
    }

    // Default fallback to general product images
    return images;
  };

  // Get the primary image index for the selected color
  const getPrimaryImageIndex = (): number => {
    if (!selectedColor || !colorVariants) return 0;

    const variant = colorVariants.find(cv => cv.colorName === selectedColor);
    return variant?.primaryImageIndex ?? 0;
  };

  const imagesToUse = getImagesForSelectedColor();
  const primaryIndex = getPrimaryImageIndex();

  console.log('imagesToUse:', imagesToUse);

  // When color changes, set the main image to the primary image for that color
  useEffect(() => {
    setSelectedIndex(primaryIndex);
  }, [selectedColor, primaryIndex]);

  const validImages = imagesToUse
    .filter((img) => img && String(img).length > 0)
    .map(resolveImage);

  console.log('validImages:', validImages);
  console.log('validImages.length:', validImages.length);

  if (validImages.length === 0) {
    return (
      <div className="w-full aspect-square bg-secondary rounded-lg flex items-center justify-center">
        <div className="text-center">
          <img
            src="/placeholder.svg"
            alt={productTitle}
            className="w-32 h-32 object-contain mx-auto opacity-50"
          />
          <p className="text-muted-foreground text-sm mt-2">No image available</p>
        </div>
      </div>
    );
  }

  const mainImage = validImages[selectedIndex];
  const hasMultiple = validImages.length > 1;

  const thumbnailImages = validImages.filter((_, idx) => idx !== selectedIndex);

  const handlePrevThumbnail = () => {
    if (thumbScrollPos > 0) {
      setThumbScrollPos(Math.max(0, thumbScrollPos - 100));
    }
  };

  const handleNextThumbnail = () => {
    const maxScroll = Math.max(0, validImages.length * 100 - 400);
    if (thumbScrollPos < maxScroll) {
      setThumbScrollPos(Math.min(maxScroll, thumbScrollPos + 100));
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Main Image */}
      <div
        className="relative w-full bg-secondary rounded-lg overflow-hidden group cursor-zoom-in"
        style={{ aspectRatio: '1' }}
      >
        <img
          src={mainImage}
          alt={productTitle}
          className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
        />

        {/* Wishlist and Share Buttons */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {showWishlistButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onWishlistClick?.();
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-200 shadow-md"
              aria-label="Add to wishlist"
            >
              <Heart
                className="h-5 w-5 transition-all"
                fill={isInWishlist ? 'rgb(239, 68, 68)' : 'none'}
                color={isInWishlist ? 'rgb(239, 68, 68)' : 'rgb(0, 0, 0)'}
              />
            </button>
          )}
          {showShareButton && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onShareClick?.();
              }}
              className="p-2 bg-white/90 hover:bg-white rounded-full transition-all duration-200 shadow-md"
              aria-label="Share product"
            >
              <Share2 className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Arrows and Counter (visible on both mobile and desktop) */}
        {hasMultiple && (
          <>
            <button
              onClick={() => setSelectedIndex((i) => (i - 1 + validImages.length) % validImages.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 text-foreground p-2 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setSelectedIndex((i) => (i + 1) % validImages.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/60 hover:bg-background/80 text-foreground p-2 rounded-full transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-background/60 text-foreground text-xs px-3 py-1.5 rounded-full">
              {selectedIndex + 1} / {validImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails Section */}
      {hasMultiple && (
        <div>
          <div className="relative">
            {/* Mobile: Horizontal Scroll */}
            {isMobile ? (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {thumbnailImages.map((img, idx) => (
                  <button
                    key={img}
                    onClick={() => setSelectedIndex(validImages.indexOf(img))}
                    className={cn(
                      'flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all aspect-square',
                      selectedIndex === idx
                        ? 'border-primary shadow-md'
                        : 'border-gray-300 hover:border-gray-400'
                    )}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        console.error('Failed to load image:', target.src);
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            ) : (
              /* Desktop: Grid with Navigation */
              <div className="space-y-2">
                <div className="relative flex items-center gap-2">
                {(() => {
                  const canScrollPrev = thumbScrollPos > 0;
                  return (
                    <button
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={handlePrevThumbnail}
                      className={cn(
                        "absolute -left-10 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md transition-all duration-200 z-10 focus:outline-none border border-border",
                        canScrollPrev 
                          ? "opacity-100 bg-background/80 hover:bg-background/95 active:bg-background/80" 
                          : "opacity-0 pointer-events-none"
                      )}
                      style={{
                        opacity: canScrollPrev ? 1 : 0,
                        pointerEvents: canScrollPrev ? 'auto' : 'none',
                        transition: 'all 200ms ease-in-out',
                        WebkitUserSelect: 'none',
                        userSelect: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        outline: 'none'
                      }}
                      aria-label="Previous thumbnails"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  );
                })()}


                  <div className="flex-1 overflow-hidden">
                    <div
                      className="flex gap-2 transition-transform duration-200"
                      style={{ transform: `translateX(-${thumbScrollPos}px)` }}
                    >
                      {thumbnailImages.map((img, idx) => (
                        <button
                          key={img}
                          onClick={() => setSelectedIndex(validImages.indexOf(img))}
                          className={cn(
                            'flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all aspect-square',
                            selectedIndex === idx
                              ? 'border-primary shadow-md'
                              : 'border-gray-300 hover:border-gray-400'
                          )}
                        >
                          <img
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.currentTarget as HTMLImageElement;
                              console.error('Failed to load image:', target.src);
                              target.src = '/placeholder.svg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {(() => {
                    const canScrollNext = thumbScrollPos < Math.max(0, validImages.length * 88 - 400);
                    return (
                      <button
                        onClick={handleNextThumbnail}
                        className={cn(
                          "absolute -right-10 top-1/2 -translate-y-1/2 p-2 rounded-full shadow-md transition-all duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 border border-border",
                          canScrollNext 
                            ? "opacity-100 bg-background/80 hover:bg-background/95 active:bg-background/80" 
                            : "opacity-0 pointer-events-none"
                        )}
                        style={{
                          opacity: canScrollNext ? 1 : 0,
                          pointerEvents: canScrollNext ? 'auto' : 'none',
                          transition: 'all 200ms ease-in-out',
                          WebkitUserSelect: 'none',
                          userSelect: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          outline: 'none'
                        }}
                        aria-label="Next thumbnails"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    );
                  })()}
                </div>

                {/* Image Counter */}
                <p className="text-xs text-gray-600 text-center mt-1">
                  {selectedIndex + 1} / {validImages.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
