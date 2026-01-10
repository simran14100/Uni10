import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { products } from "@/data/products";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const ProductSlider = ({ className }: { className?: string }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const headings = [
    "Own the sky",
    "TRAVEL-READY CO-ORDS",
    "NOBERO'S ACTIVE WEAR",
  ];
  const subHeadings = [
    "In style",
    "BUY 2 OR MORE GET 10%OFF",
    "JUST LAUNCHED",
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const handleSlideChange = (emblaApi: any) => {
    setCurrentSlide(emblaApi.selectedScrollSnap());
  };

  return (
    <div className={`relative w-full overflow-hidden ${className}`}>
      <Carousel
        plugins={[plugin.current]}
        onSelect={handleSlideChange}
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
        <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-[#283e74] shadow-md hover:bg-gray-100 transition-all duration-300" />
        <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-white text-[#283e74] shadow-md hover:bg-gray-100 transition-all duration-300" />
      </Carousel>
    </div>
  );
};

