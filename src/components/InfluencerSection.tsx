import React, { useState, useEffect } from 'react';

import { Loader2, Star, TrendingUp, Clock, Play, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';



interface Product {

  _id: string;

  title: string;

  images: string[];

}



interface InfluencerDataItem {

  _id: string;

  videoUrl: string;

  productId: Product;

  createdAt: string;

  updatedAt: string;

}



// API utility type

declare const api: (url: string) => Promise<{ok: boolean, json: any}>;



export default function InfluencerSection() {

  const [influencerData, setInfluencerData] = useState<InfluencerDataItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedVideo, setSelectedVideo] = useState<InfluencerDataItem | null>(null);

  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);



  useEffect(() => {

    const fetchInfluencerData = async () => {

      setLoading(true);

      setError(null);

      try {

        // Check if api utility is available

        if (typeof api === 'function') {

          const res = await api('/api/influencer-data/public');

          if (!res.ok) {

            throw new Error(res.json?.message || 'Failed to fetch influencer data');

          }

          const data = res.json.data;

          setInfluencerData(data);

          if (data.length > 0) {

            setSelectedVideo(data[0]);

            setCurrentVideoIndex(0);

          }

        } else {

          // Fallback to fetch

          const response = await fetch('/api/influencer-data/public');

          const json = await response.json();

          if (!response.ok) {

            throw new Error(json?.message || 'Failed to fetch influencer data');

          }

          setInfluencerData(json.data);

          if (json.data.length > 0) {

            setSelectedVideo(json.data[0]);

            setCurrentVideoIndex(0);

          }

        }

      } catch (err: any) {

        setError(err.message);

      } finally {

        setLoading(false);

      }

    };

    fetchInfluencerData();

  }, []);



  if (loading) {

    return (

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white">

        <div className="container mx-auto px-4 text-center">

          <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />

          <p className="mt-4 text-gray-600">Loading influencer content...</p>

        </div>

      </section>

    );

  }



  if (error) {

    return (

      <section className="py-16">

        <div className="container mx-auto px-4 text-center text-red-500">

          <p>Error loading influencer data: {error}</p>

        </div>

      </section>

    );

  }



  if (!influencerData.length) {

    return null;

  }



  const otherVideos = influencerData.filter(item => item._id !== selectedVideo?._id);

  const handlePrevious = () => {
    const newIndex = currentVideoIndex === 0 ? influencerData.length - 1 : currentVideoIndex - 1;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(influencerData[newIndex]);
  };

  const handleNext = () => {
    const newIndex = currentVideoIndex === influencerData.length - 1 ? 0 : currentVideoIndex + 1;
    setCurrentVideoIndex(newIndex);
    setSelectedVideo(influencerData[newIndex]);
  };

  const handleVideoSelect = (index: number) => {
    setCurrentVideoIndex(index);
    setSelectedVideo(influencerData[index]);
  };

  return (
    <section className="py-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          {/* <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Featured Content</span>
          </div> */}

         
           <div className="text-center mb-12 md:mb-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
                      <div className="flex-1"></div>
                      <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                        Influencer Spotlight
                      </h2>
                      <div className="flex-1"></div>
                    </div>
                    {/* <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                     Watch real reviews from our community of creators and  influencer.
                    </p> */}
                  </div>
        </div>

        {/* Mobile View - Carousel */}
        <div className="lg:hidden mb-6">
          {/* Main Video Display */}
          <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            <div className="relative aspect-[9/16] w-full bg-gray-900 overflow-hidden">
              <video
                key={selectedVideo?._id}
                src={selectedVideo?.videoUrl}
                controls
                className="w-full h-full object-cover"
                preload="metadata"
                onLoadedMetadata={(e) => {
                  const videoElement = e.currentTarget;
                  if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                    videoElement.currentTime = 0.1;
                  }
                }}
              />
            </div>
          </div>

          {/* Carousel Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevious}
              className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              disabled={influencerData.length <= 1}
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <span className="text-sm text-gray-600 font-medium">
              {currentVideoIndex + 1} / {influencerData.length}
            </span>
            
            <button
              onClick={handleNext}
              className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
              disabled={influencerData.length <= 1}
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Video Cards Carousel */}
          {/* <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-3 pb-2">
              {influencerData.map((item, index) => (
                <div
                  key={item._id}
                  onClick={() => handleVideoSelect(index)}
                  className={`flex-shrink-0 w-32 cursor-pointer transition-all duration-300 ${
                    index === currentVideoIndex 
                      ? 'ring-2 ring-amber-600 scale-105' 
                      : 'hover:scale-105'
                  }`}
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative aspect-[9/16] bg-gray-900">
                      <video
                        src={item.videoUrl}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                        playsInline
                        onLoadedMetadata={(e) => {
                          const videoElement = e.currentTarget;
                          if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                            videoElement.currentTime = 0.1;
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>

        {/* Desktop View - Original Layout */}
        <div className="hidden lg:block">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Side: Large Featured Video */}
              <div className="lg:w-1/2">
                {selectedVideo && (
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
                    <div className="relative aspect-[3/4] w-full max-h-[600px] bg-gray-900 overflow-hidden">
                      <video
                        key={selectedVideo._id}
                        src={selectedVideo.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onLoadedMetadata={(e) => {
                          // Seek to first frame to show preview
                          const videoElement = e.currentTarget;
                          if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                            videoElement.currentTime = 0.1;
                          }
                        }}
                        onLoadedData={(e) => {
                          // Ensure first frame is shown
                          const videoElement = e.currentTarget;
                          if (videoElement.readyState >= 2) {
                            videoElement.currentTime = 0.1;
                          }
                        }}
                        onCanPlay={(e) => {
                          // Show first frame when video can play
                          const videoElement = e.currentTarget;
                          if (videoElement.currentTime === 0) {
                            videoElement.currentTime = 0.1;
                          }
                        }}
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedVideo.productId?.title || 'Featured Product'}
                        </h3>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Scrollable Grid */}
              <div className="lg:w-1/2">
                <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <div className="grid grid-cols-2 gap-4">
                    {otherVideos.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => setSelectedVideo(item)}
                        className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group"
                      >
                        <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden">
                          <video
                            src={item.videoUrl}
                            className="w-full h-full object-cover"
                            preload="metadata"
                            muted
                            playsInline
                            onLoadedMetadata={(e) => {
                              // Seek to first frame to show preview
                              const videoElement = e.currentTarget;
                              if (videoElement.duration > 0 && videoElement.readyState >= 2) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                            onLoadedData={(e) => {
                              // Ensure first frame is shown
                              const videoElement = e.currentTarget;
                              if (videoElement.readyState >= 2) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                            onCanPlay={(e) => {
                              // Show first frame when video can play
                              const videoElement = e.currentTarget;
                              if (videoElement.currentTime === 0) {
                                videoElement.currentTime = 0.1;
                              }
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                          <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                            <h4 className="font-bold text-white text-sm mb-1 line-clamp-2 drop-shadow-lg">
                              {item.productId?.title || 'Product Review'}
                            </h4>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show all videos button at the end */}
        <div className="text-center mt-12">
          <Link to="/videos">
            <button className="px-6 py-3 border border-primary text-base font-medium rounded-md text-white bg-primary hover:bg-primary/90 transition-colors">
              Show all videos
            </button>
          </Link>
        </div>

       

      </div>
    </section>
  );

}