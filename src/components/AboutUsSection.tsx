import React from 'react';
import { Plane, Luggage, Package, Feather, Home } from "lucide-react";

const AboutUsSection = () => {
  return (
    <section className="bg-gradient-to-br from-[#2d3e6f] to-[#1a2d5e] text-white py-8 lg:py-12 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
          {/* Left Section: Text and Features */}
          <div className="lg:w-[45%] space-y-6">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight">OUR STORY</h2>
            
            <p className="text-sm lg:text-base leading-relaxed text-gray-100 opacity-90">
              UNI10 is all about modern, on-the-move must-haves. We aim to merge
              high-fashion minimalism with the uniqueness and comfort of athleisure.
              Our collections are crafted with the best of fabric and premium cotton
              and our silhouettes are high on the trend quotient. Elevate your every day
              look with our stylish and functional essentials, travel wear, and lounge
              wear. You'll always be adventure-ready with UNI10.
            

We source luxe, sustainable fabrics—from buttery-soft premium cottons and breathable linens to innovative technical blends that offer stretch and structure. Our silhouettes are meticulously cut to flatter the form, offering a modern, trend-aware fit that prioritizes freedom of movement without sacrificing a polished aesthetic.

UNI10 is more than apparel; it's an enabler of experience. We outfit you for the fluidity of contemporary life, ensuring you are prepared, confident, and impeccably styled for any scenario. Our mission is to ensure that you never have to choose between looking exceptional and feeling empowered to move.

Elevate your everyday. Embrace the fluid. Be adventure-ready, always—with UNI10.
            </p>

            {/* Features Grid */}
         
          </div>

          {/* Right Section: Image Gallery */}
          <div className="lg:w-[50%] w-full">
            <div className="relative rounded-none overflow-hidden">
              {/* Image Grid */}
              <div className="grid grid-cols-4 gap-0 h-64 lg:h-72">
                {/* Image 1 */}
                <div className="col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-700">
                  <img
                    src="https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=600&fit=crop"
                    alt="Model in green outfit"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image 2 */}
                <div className="col-span-1 bg-gradient-to-br from-slate-600 to-slate-700">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop"
                    alt="Model in athletic wear"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image 3 */}
                <div className="col-span-1 bg-gradient-to-br from-stone-500 to-stone-600">
                  <img
                    src="https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=600&fit=crop"
                    alt="Model in casual wear"
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image 4 */}
                <div className="col-span-1 bg-gradient-to-br from-sky-400 to-sky-500">
                  <img
                    src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=600&fit=crop"
                    alt="Model in graphic tee"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Bottom Banner */}
              <div className="bg-[#3a4d7a] bg-opacity-90 text-white text-center py-3 lg:py-4">
                <h3 className="text-base lg:text-xl font-bold uppercase tracking-[0.2em] lg:tracking-[0.3em]">
                  PERFECT FOR ALL OCCASIONS
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutUsSection;