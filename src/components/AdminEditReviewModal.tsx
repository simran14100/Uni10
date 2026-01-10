import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rating } from '@/components/ui/Rating';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Loader2, Upload, X } from 'lucide-react';

export interface AdminReview {
  _id: string;
  productId: { _id: string; title: string; slug: string; };
  userId: { _id: string; name: string; email: string; };
  username: string;
  email: string;
  rating: number;
  text: string;
  images: string[];
  comment?: string;
  status: 'pending' | 'published' | 'rejected';
  createdAt: string;
}

interface AdminEditReviewModalProps {
  review: AdminReview | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReview: AdminReview) => void;
}

export const AdminEditReviewModal = ({ review, isOpen, onClose, onSave }: AdminEditReviewModalProps) => {
  const { toast } = useToast();
  const [currentRating, setCurrentRating] = useState(0);
  const [currentUsername, setCurrentUsername] = useState('');
  const [currentEmail, setCurrentEmail] = useState('');
  const [currentText, setCurrentText] = useState('');
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [currentComment, setCurrentComment] = useState<string | undefined>(undefined);
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'published' | 'rejected'>('published');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (review) {
      setCurrentRating(review.rating);
      setCurrentUsername(review.username || '');
      setCurrentEmail(review.email || '');
      setCurrentText(review.text);
      setCurrentImages(review.images || []);
      setCurrentComment(review.comment);
      setCurrentStatus(review.status);
    }
  }, [review]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 3 images total (including existing ones)
    if (currentImages.length + files.length > 3) {
      toast({
        title: "Upload limit reached",
        description: "You can upload a maximum of 3 images per review.",
        variant: "destructive",
      });
      return;
    }

    setUploadingImages(true);
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    try {
      const { ok, json } = await api('/api/uploads/images', { method: 'POST', body: formData });
      if (ok) {
        setCurrentImages((prev) => [...prev, ...json.data.urls]);
        toast({
          title: "Images uploaded",
          description: `${json.data.urls.length} image(s) uploaded successfully.`, 
        });
      } else {
        toast({
          title: "Upload failed",
          description: json?.message || "Failed to upload images.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Upload error",
        description: error.message || "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setUploadingImages(false);
      // Clear the input field to allow re-uploading same file if needed
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    setCurrentImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!review) return;

    // Basic validation
    if (currentRating < 1 || currentRating > 5) {
      toast({ title: "Validation Error", description: "Rating must be between 1 and 5.", variant: "destructive" });
      return;
    }
    if (currentText.trim().length < 20 || currentText.trim().length > 1000) {
      toast({ title: "Validation Error", description: "Review text must be between 20 and 1000 characters.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: currentUsername.trim(),
        email: currentEmail.trim(),
        rating: currentRating,
        text: currentText.trim(),
        images: currentImages,
        comment: currentComment?.trim() || undefined,
        status: currentStatus,
      };
      const { ok, json } = await api(`/api/admin/reviews/${review._id}`, { method: 'PUT', body: JSON.stringify(payload) });
      if (ok) {
        onSave(json.data);
        toast({ title: "Review Updated", description: "Review updated successfully." });
        onClose();
      } else {
        toast({ title: "Update Failed", description: json?.message || "Failed to update review.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Update Error", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!review) return null; // Don't render if no review is passed

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Review for "{review.productId.title}"</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">Username</Label>
            <Input
              id="username"
              value={currentUsername}
              onChange={(e) => setCurrentUsername(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">Email</Label>
            <Input
              id="email"
              type="email"
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              required
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rating" className="text-right">Rating</Label>
            <div className="col-span-3">
              <Rating value={currentRating} onChange={setCurrentRating} />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="text" className="text-right">Review Text</Label>
            <Textarea
              id="text"
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              required
              rows={5}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="comment" className="text-right">Admin Comment</Label>
            <Textarea
              id="comment"
              value={currentComment || ''}
              onChange={(e) => setCurrentComment(e.target.value)}
              rows={3}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">Status</Label>
            <Select value={currentStatus} onValueChange={(val: 'pending' | 'published' | 'rejected') => setCurrentStatus(val)}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload Section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="imageUpload" className="text-right">Images</Label>
            <div className="col-span-3 flex flex-wrap gap-2">
              {currentImages.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-md overflow-hidden group">
                  <img src={img} alt={`Review image ${index + 1}`} className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {currentImages.length < 3 && (
                <label htmlFor="imageUpload" className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                  {uploadingImages ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="sr-only">Upload images</span>
                </label>
              )}
              <Input
                id="imageUpload"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handleImageUpload}
                disabled={uploadingImages || currentImages.length >= 3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading || uploadingImages}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

