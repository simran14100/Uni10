import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/hooks/useWishlist";
import { toast } from "sonner";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  to?: string;
  slug?: string;
  images?: string[];
  discountedPrice?: number;
  rating?: number;
}

export const ProductCard = ({ id, name, price, image, category, to, slug, images, discountedPrice, rating }: ProductCardProps) => {
  const { user } = useAuth();
  const { addToCart } = (() => { try { return useCart(); } catch { return { addToCart: () => {} } as any; } })();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const primaryImage = images && images.length > 0 ? images[0] : image;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const item = { id, title: name, price, image: primaryImage };
    if (!user) {
      try {
        localStorage.setItem('uni_add_intent', JSON.stringify({ item, qty: 1 }));
      } catch {}
      navigate('/auth');
      return;
    }
    addToCart(item, 1);
    toast.success('Added to cart');
  };

  const src = (() => {
    const s = String(primaryImage || '');
    if (!s) return '/placeholder.svg';
    if (s.startsWith('http')) return s;
    return s.startsWith('/') ? s : `/uploads/${s}`;
  })();

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(id);
  };

  const linkTo = to || (slug && String(slug).trim() ? `/products/${slug}` : `/products/${id}`);

  return (
    <Card className="group overflow-hidden rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative bg-white">
      <Link to={linkTo} className="block">
        <div className="aspect-square overflow-hidden bg-gray-100 relative flex items-center justify-center rounded-t-xl">
          {discountedPrice && (
            <div className="absolute top-3 left-3 bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full z-10 shadow-md">
              -{( ( (price - discountedPrice) / price) * 100).toFixed(0)}%
            </div>
          )}
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <button
            onClick={handleWishlistClick}
            className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white rounded-full transition-all duration-200 z-10 shadow-md"
          >
            <Heart
              className="h-5 w-5 transition-all"
              fill={isInWishlist(id) ? 'currentColor' : 'none'}
              color={isInWishlist(id) ? 'hsl(var(--primary))' : 'currentColor'}
            />
          </button>
        </div>
      </Link>
      <div className="p-4 bg-white rounded-b-xl flex flex-col justify-between flex-grow">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">
          {category}
        </p>
        <Link to={linkTo}>
          <h3 className="font-bold text-lg text-gray-800 hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center">
            {rating && (
              <div className="flex items-center text-sm text-yellow-500">
                {'★'.repeat(Math.floor(rating))}
                {'☆'.repeat(5 - Math.floor(rating))}
                <span className="ml-1 text-gray-500 uppercase">({rating})</span>
              </div>
            )}
            <p className="text-xl font-bold text-gray-800 uppercase ml-4">
              {discountedPrice ? (
                <>
                  <span className="line-through text-gray-400 text-base mr-2">₹{price.toLocaleString('en-IN')}</span>
                  ₹{discountedPrice.toLocaleString('en-IN')}
                </>
              ) : (
                `₹${price.toLocaleString('en-IN')}`
              )}
            </p>
          </div>
          <Button onClick={handleAdd} size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md scale-100 group-hover:scale-100">
            <ShoppingCart className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </Card>
  );
};
