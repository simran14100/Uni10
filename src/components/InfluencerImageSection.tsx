import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AdminAddInfluencerImage } from './AdminAddInfluencerImage';
import { Image, User, Package, Loader2 } from 'lucide-react';
import { api } from '@/lib/api'; // Assuming @/lib/api is the correct path for your API utility

interface Product {
  _id: string;
  title: string;
  images: string[];
}

interface InfluencerImageItem {
  _id: string;
  imageUrl: string;
  influencerName: string;
  productId: Product;
  updatedAt: string;
}


export default function InfluencerImageSection() {
  const [showAddForm, setShowAddForm] = useState(false); // New state
  const [influencerImages, setInfluencerImages] = useState<InfluencerImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInfluencerImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api('/api/influencer-images/public');
      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to fetch influencer images');
      }
      const data = res.json.data;
      setInfluencerImages(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfluencerImages();
  }, [fetchInfluencerImages]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Influencer Image Spotlight</h2>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="rounded-full">
          {showAddForm ? 'Cancel Add' : 'Add New Image'}
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-8">
          <AdminAddInfluencerImage onImageAdded={() => { fetchInfluencerImages(); setShowAddForm(false); }} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <p className="ml-3 text-gray-600">Loading influencer images...</p>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">
          Error: {error}
        </div>
      ) : influencerImages.length === 0 ? (
        <div className="text-gray-500 text-center py-4">
          No influencer images found.
        </div>
      ) : (
        <div className="masonry-grid" style={{ columnCount: 3, columnGap: '1.5rem' }}>
          {influencerImages.map((item) => (
            <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105" style={{ breakInside: 'avoid-column', marginBottom: '1.5rem' }}>
              <img src={item.imageUrl} alt={item.influencerName} className="w-full h-auto object-cover" />
              <div className="p-4">
              <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-1">{item.productId?.title || 'Product'}</h3>
              <p className="text-sm text-gray-600 flex items-center mb-1">
                <User className="h-4 w-4 mr-2 text-blue-500" />
                {item.influencerName}
              </p>
              <p className="text-xs text-gray-500 flex items-center">
                <Package className="h-4 w-4 mr-2 text-green-500" />
                Product: {item.productId?.title}
              </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

