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

export const ProductSlider = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const headings = [
    "DEFINE YOUR UNIVERSE",
    "Discover The Premium",
    "Elevate Your Space with",
  ];
  const subHeadings = [
    "",
    "Furniture in Our Partroll Store",
    "Elegant Furniture Designs",
  ];

  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: false })
  );

  const handleSlideChange = (emblaApi: any) => {
    setCurrentSlide(emblaApi.selectedScrollSnap());
  };

  return (
    <div className="relative w-full overflow-hidden">
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
              <div className="relative h-[600px] w-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

