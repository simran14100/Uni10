import React, { useState } from 'react';
import { Plane, Luggage, Package, Feather, Home } from "lucide-react";

const AboutUsSection = () => {
  const [isReadMore, setIsReadMore] = useState(false);
  return (
    <section className="bg-gradient-to-br  from-gray-900 via-black to-gray-800 text-white py-12 lg:py-20 relative overflow-hidden" 
             style={{
               backgroundImage: 'url(/bg.jpeg)',
               backgroundSize: 'cover',
               backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat'
             }}>
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60"></div>
      {/* Decorative Elements */}
      <div className="absolute top-12 left-8 text-red-600 text-6xl font-bold opacity-30">///</div>
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-red-600 rounded-tl-full opacity-10"></div>
      <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-blue-600 rounded-full opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
          {/* Left Section: Text and Features */}
          <div className="lg:w-[48%] space-y-6">
            <div className="inline-block">
              <p className="text-xs font-semibold mb-2 text-red-500 tracking-wider uppercase">About UNI10</p>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                OUR STORY
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-red-600 to-blue-600 mt-3 rounded-full"></div>
            </div>
            
            <div className="space-y-5 text-gray-200">
              <p className="text-base lg:text-lg leading-relaxed">
                UNI10 is all about modern, on-the-move must-haves. We aim to merge
                high-fashion minimalism with the uniqueness and comfort of athleisure.
                Our collections are crafted with the best of fabric and premium cotton
                and our silhouettes are high on the trend quotient.
              </p>

              {!isReadMore && (
                <button 
                  onClick={() => setIsReadMore(true)}
                  className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider transition-colors duration-200 flex items-center gap-2"
                >
                  Read More
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {isReadMore && (
                <>
                  <p className="text-sm lg:text-base leading-relaxed opacity-90">
                    We source luxe, sustainable fabrics—from buttery-soft premium cottons and breathable linens to innovative technical blends that offer stretch and structure. Our silhouettes are meticulously cut to flatter the form, offering a modern, trend-aware fit that prioritizes freedom of movement without sacrificing a polished aesthetic.
                  </p>

                  <p className="text-sm lg:text-base leading-relaxed opacity-90">
                    UNI10 is more than apparel; it's an enabler of experience. We outfit you for the fluidity of contemporary life, ensuring you are prepared, confident, and impeccably styled for any scenario.
                  </p>

                  <button 
                    onClick={() => setIsReadMore(false)}
                    className="text-red-500 hover:text-red-400 font-semibold text-sm uppercase tracking-wider transition-colors duration-200 flex items-center gap-2"
                  >
                    Read Less
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-gray-700 hover:border-red-600 transition-all">
                <div className="w-10 h-10 bg-red-600 bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                  <Plane className="w-5 h-5 text-red-500" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Travel Ready</h3>
                <p className="text-xs text-gray-400">Perfect for adventures</p>
              </div>
              
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-2xl border border-gray-700 hover:border-blue-600 transition-all">
                <div className="w-10 h-10 bg-blue-600 bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                  <Feather className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Premium Comfort</h3>
                <p className="text-xs text-gray-400">Luxe sustainable fabrics</p>
              </div>
            </div>
          </div>

          {/* Right Section: Image Gallery */}
          <div className="lg:w-[48%] w-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-gray-800">
              {/* Image Grid */}
              <div className="grid grid-cols-4 gap-0 h-72 lg:h-96">
                {/* Image 1 */}
                <div className="col-span-1 bg-gradient-to-br from-emerald-600 to-emerald-700 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=400&h=600&fit=crop"
                    alt="Model in green outfit"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
                
                {/* Image 2 */}
                <div className="col-span-1 bg-gradient-to-br from-slate-600 to-slate-700 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=600&fit=crop"
                    alt="Model in athletic wear"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
                
                {/* Image 3 */}
                <div className="col-span-1 bg-gradient-to-br from-stone-500 to-stone-600 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=400&h=600&fit=crop"
                    alt="Model in casual wear"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
                
                {/* Image 4 */}
                <div className="col-span-1 bg-gradient-to-br from-sky-400 to-sky-500 relative group">
                  <img
                    src="https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&h=600&fit=crop"
                    alt="Model in graphic tee"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent opacity-0 group-hover:opacity-40 transition-opacity"></div>
                </div>
              </div>
              
              {/* Bottom Banner */}
              <div className="bg-gradient-to-r from-red-600 via-red-700 to-blue-700 text-white text-center py-4 lg:py-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <h3 className="text-sm lg:text-xl font-bold uppercase tracking-[0.15em] lg:tracking-[0.25em] relative z-10">
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