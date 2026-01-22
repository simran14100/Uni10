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
    <Card className="group overflow-hidden rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 relative bg-white sm:max-w-xs">
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
      <div className="p-3 sm:p-4 bg-white rounded-b-xl flex flex-col justify-between flex-grow">
        <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-widest mb-1">
          {category}
        </p>
        <Link to={linkTo}>
          <h3 className="font-bold text-base sm:text-lg text-gray-800 hover:text-primary transition-colors line-clamp-2 min-h-[3rem]">
            {name}
          </h3>
        </Link>
        <div className="flex items-center mt-2 mb-2">
          <p className="text-lg sm:text-xl font-bold text-gray-800 uppercase">
            {discountedPrice ? (
              <>
                <span className="line-through text-gray-400 text-sm sm:text-base mr-1 sm:mr-2 whitespace-nowrap">₹{price.toLocaleString('en-IN')}</span>
                <span className="whitespace-nowrap">₹{discountedPrice.toLocaleString('en-IN')}</span>
              </>
            ) : (
              <span className="whitespace-nowrap">₹{price.toLocaleString('en-IN')}</span>
            )}
          </p>
        </div>
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center">
              <div className="flex items-center text-sm text-yellow-500">
                {rating ? (
                  <>
                    {'★'.repeat(Math.floor(rating))}
                    {'☆'.repeat(5 - Math.floor(rating))}
                    <span className="ml-1 text-gray-500 uppercase">({rating})</span>
                  </>
                ) : (
                  <>
                    {'☆'.repeat(5)}
                    <span className="ml-1 text-gray-400 text-xs uppercase">(No ratings)</span>
                  </>
                )}
              </div>
            </div>
            <Button onClick={handleAdd} size="icon" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md w-10 h-10 hidden sm:flex sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity sm:duration-300">
              <ShoppingCart className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>
          </div>
      </div>
    </Card>
  );
};
