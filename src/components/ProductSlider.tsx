import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselApi,
} from "@/components/ui/carousel";
import { products } from "@/data/products";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [api, setApi] = React.useState<CarouselApi>();
  
  React.useEffect(() => {
    if (!api) {
      return;
    }

    api.on("select", () => {
      setCurrentSlide(api.selectedScrollSnap());
    });
  }, [api]);

  const scrollPrev = React.useCallback(() => {
    if (api) api.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    if (api) api.scrollNext();
  }, [api]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        setApi={setApi}
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {products.map((product, index) => (
            <CarouselItem key={product.id}>
              <div className="relative w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Hide the default buttons */}
        <style>
          {`
            [data-carousel="previous"],
            [data-carousel="next"] {
              display: none !important;
            }
          `}
        </style>
      </Carousel>
      
      {/* Custom Navigation Buttons */}
      <div className="absolute inset-0 flex items-center justify-between p-4  pointer-events-none">
        <button
          onClick={scrollPrev}
          className="h-12 w-12 flex items-center justify-center bg-transparent text-white hover:text-[#283e74] pointer-events-auto transition-all duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
        <button
          onClick={scrollNext}
          className="h-12 w-12 flex items-center justify-center bg-transparent text-white hover:text-[#283e74] pointer-events-auto transition-all duration-300"
          aria-label="Next slide"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      </div>
    </div>
  );
};