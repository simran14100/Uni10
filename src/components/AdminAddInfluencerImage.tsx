import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner'; // Assuming you have a toast notification library
import { api } from '@/lib/api';

interface Product {
  _id: string;
  title: string;
}

interface AdminAddInfluencerImageProps {
  onImageAdded: () => void;
}


export const AdminAddInfluencerImage: React.FC<AdminAddInfluencerImageProps> = ({ onImageAdded }) => {
  const [influencerName, setInfluencerName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | ''>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const res = await api('/api/products');
        if (!res.ok) {
          throw new Error(res.json?.message || 'Failed to fetch products');
        }
        setProducts(res.json.data);
      } catch (err: any) {
        setProductsError(err.message);
        toast.error('Error fetching products:', err.message);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!influencerName || !selectedProductId || !imageFile) {
      toast.error('Please fill in all fields and select an image.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('influencerName', influencerName);
    formData.append('productId', selectedProductId);
    formData.append('image', imageFile);

    try {
      const res = await api('/api/admin/influencer-images', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(res.json?.message || 'Failed to add influencer image');
      }

      toast.success('Influencer image added successfully!');
      setInfluencerName('');
      setSelectedProductId('');
      setImageFile(null);
      onImageAdded(); // Notify parent component to refresh
    } catch (err: any) {
      toast.error('Error adding image:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>Add New Influencer Image</CardTitle>
        <CardDescription>Upload an image, enter influencer details, and link to a product.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="influencerName">Influencer Name</Label>
            <Input
              id="influencerName"
              value={influencerName}
              onChange={(e) => setInfluencerName(e.target.value)}
              placeholder="Enter influencer's name"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="productId">Select Product</Label>
            {productsLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading products...
              </div>
            ) : productsError ? (
              <div className="text-red-500 text-sm">Error: {productsError}</div>
            ) : products.length === 0 ? (
              <div className="text-gray-500 text-sm">No products found.</div>
            ) : (
              <Select onValueChange={setSelectedProductId} value={selectedProductId}>
                <SelectTrigger id="productId" className="w-full">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="imageFile">Influencer Image</Label>
            <Input
              id="imageFile"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
              required
            />
            {imageFile && <p className="text-sm text-gray-500">Selected: {imageFile.name}</p>}
          </div>

          <Button type="submit" className="w-full rounded-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Influencer Image
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

