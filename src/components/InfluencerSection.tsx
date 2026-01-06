
import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Loader2 } from 'lucide-react';

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

export const InfluencerSection = () => {
  const [influencerData, setInfluencerData] = useState<InfluencerDataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfluencerData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api('/api/admin/influencer-data');
        if (!res.ok) throw new Error(res.json?.message || 'Failed to fetch influencer data');
        setInfluencerData(res.json.data);
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
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-gray-600">Loading influencer content...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center text-red-500">
          <p>Error loading influencer data: {error}</p>
        </div>
      </section>
    );
  }

  if (!influencerData.length) {
    return null; // Don't render section if no data
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gray-100">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-center mb-10">
          <span className="text-primary">Influencer</span> Spotlight
        </h2>
        <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
          <CarouselContent className="-ml-4">
            {influencerData.map((item) => (
              <CarouselItem key={item._id} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <CardContent className="p-0 flex-grow flex flex-col">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>{/* 16:9 Aspect Ratio */}
                      <video
                        src={item.videoUrl}
                        controls
                        className="absolute top-0 left-0 w-full h-full object-cover rounded-t-lg"
                      />
                    </div>
                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <h3 className="text-lg font-semibold mb-2">Product: {item.productId?.title || 'N/A'}</h3>
                      <p className="text-sm text-gray-600">Discover this product in action!</p>
                      {/* Link to product page could be added here */}
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute -left-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 bg-white shadow-md transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
          <CarouselNext className="absolute -right-12 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full border-2 bg-white shadow-md transition-all duration-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
        </Carousel>
      </div>
    </section>
  );
};
