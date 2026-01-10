import React, { useState, useEffect } from 'react';
import { Loader2, Star, TrendingUp, Clock } from 'lucide-react';

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

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-2">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Featured Content</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            <span className="text-purple-600">Influencer</span> Spotlight
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Watch real reviews from our community of creators and influencers
          </p>
        </div>

        {/* Video Layout */}
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Side: Large Featured Video */}
            <div className="lg:w-1/2">
              {selectedVideo && (
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-4">
                  <div className="relative aspect-[3/4] w-full max-h-[600px] bg-gray-900">
                    <video
                      key={selectedVideo._id}
                      src={selectedVideo.videoUrl}
                      controls
                      className="w-full h-full object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23111827' width='100' height='100'/%3E%3C/svg%3E"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedVideo.productId?.title || 'Featured Product'}
                      </h3>
                      <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-lg">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">4.7</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <Clock className="h-4 w-4" />
                      <span>5 mins</span>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Watch this comprehensive review and discover why this product is loved by our community.
                    </p>
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
                      <div className="relative aspect-[9/16] bg-gray-900">
                        <video
                          src={item.videoUrl}
                          className="w-full h-full object-cover"
                          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23111827' width='100' height='100'/%3E%3C/svg%3E"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <h4 className="font-bold text-white text-sm mb-1 line-clamp-2">
                            {item.productId?.title || 'Product Review'}
                          </h4>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium text-white">4.7</span>
                            </div>
                            <div className="flex items-center gap-1 text-white text-xs">
                              <Clock className="h-3 w-3" />
                              <span>5 mins</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-white rounded-2xl shadow-md">
            <div className="text-left">
              <p className="text-3xl font-bold text-purple-600">{influencerData.length}+</p>
              <p className="text-sm text-gray-600">Video Reviews</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div className="text-left">
              <p className="text-3xl font-bold text-purple-600">50K+</p>
              <p className="text-sm text-gray-600">Total Views</p>
            </div>
            <div className="h-12 w-px bg-gray-200" />
            <div className="text-left">
              <p className="text-3xl font-bold text-purple-600">4.8</p>
              <p className="text-sm text-gray-600">Avg Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}