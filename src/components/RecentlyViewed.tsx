import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, History, ShoppingBag } from "lucide-react";
import { api } from "@/lib/api";
import { useWishlist } from "@/hooks/useWishlist";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";

interface RecentProduct {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  image_url?: string;
  images?: string[];
  category?: string;
  stock?: number;
  slug?: string;
  discount?: {
    type: "flat" | "percentage";
    value: number;
  };
  isBestSeller?: boolean;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;
  const isLocalBase = (() => {
    try {
      return (
        API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1")
      );
    } catch {
      return false;
    }
  })();
  const isHttpsPage = (() => {
    try {
      return location.protocol === "https:";
    } catch {
      return false;
    }
  })();
  if (s.startsWith("/uploads") || s.startsWith("uploads")) {
    if (API_BASE && !(isLocalBase && isHttpsPage)) {
      const base = API_BASE.endsWith("/")
        ? API_BASE.slice(0, -1)
        : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
    return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
  }
  return s;
};

const calculateDiscountedPrice = (
  price: number,
  discount?: { type: "flat" | "percentage"; value: number }
) => {
  if (!discount || discount.value === 0) return price;
  if (discount.type === "percentage") {
    return price - (price * discount.value) / 100;
  }
  return price - discount.value;
};

export const RecentlyViewed = ({
  excludeProductId,
}: {
  excludeProductId: string;
}) => {
  const { getList } = useRecentlyViewed();
  const [products, setProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const loadRecent = async () => {
      const list = getList().filter(
        (item) => String(item.id) !== String(excludeProductId)
      );
      if (list.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const results = await Promise.all(
          list.map(async (item) => {
            const idOrSlug = item.slug || item.id;
            const { ok, json } = await api(
              `/api/products/${idOrSlug}?_t=${Date.now()}`
            );
            if (ok && json?.data) return json.data as RecentProduct;
            return null;
          })
        );
        const valid = results.filter(
          (p): p is RecentProduct => p != null && !!(p._id || p.id)
        );
        setProducts(valid);
      } catch (e) {
        console.error("Failed to load recently viewed:", e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    if (excludeProductId) {
      loadRecent();
    }
  }, [excludeProductId, getList]);

  if (loading) {
    return (
      <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tighter mb-6 sm:mb-8 flex items-center gap-2">
          <History className="h-6 w-6 text-muted-foreground" />
          Recently Viewed
        </h2>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 sm:w-48 animate-pulse"
              >
                <div className="aspect-square bg-muted rounded-lg mb-3 sm:mb-4" />
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-4 w-3/4 bg-muted rounded" />
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-border">
      <h2 className="text-xl sm:text-2xl font-bold tracking-tighter mb-6 sm:mb-8 flex items-center gap-2">
        <History className="h-6 w-6 text-muted-foreground" />
        Recently Viewed
      </h2>
      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 py-10 px-4 text-center">
          <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-4">
            Products you view will appear here. Browse the shop to build your history.
          </p>
          <Button asChild variant="outline" size="sm">
            <Link to="/shop">Browse Shop</Link>
          </Button>
        </div>
      ) : (
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-3 sm:-mx-4 px-3 sm:px-4">
        {products.map((product) => {
          const id = product._id || product.id;
          const slug = product.slug || "";
          const title = product.title || product.name || "Product";
          const price = Number(product.price || 0);
          const image = resolveImage(
            product.image_url || product.images?.[0]
          );
          const stock = Number(product.stock || 0);
          const discount = product.discount;
          const finalPrice = calculateDiscountedPrice(price, discount);
          const discountLabel =
            discount && discount.value > 0
              ? discount.type === "percentage"
                ? `${discount.value}% off`
                : `₹${discount.value} off`
              : null;
          const productLink = slug
            ? `/products/${slug}`
            : `/product/${id}`;

          const handleWishlistClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(id);
          };

          return (
            <div
              key={id}
              className="flex-shrink-0 w-40 sm:w-48 group relative"
            >
              <Link to={productLink} className="block">
                <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {stock === 0 && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white font-semibold text-xs sm:text-sm">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {product.isBestSeller && (
                      <Badge className="absolute top-2 left-2 bg-orange-500 hover:bg-orange-600 text-xs sm:text-sm">
                        Best Seller
                      </Badge>
                    )}
                    {discountLabel && (
                      <Badge className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-xs sm:text-sm">
                        {discountLabel}
                      </Badge>
                    )}
                    <button
                      onClick={handleWishlistClick}
                      className="absolute bottom-2 right-2 p-2 bg-white/80 hover:bg-white rounded-full transition-all duration-200 z-10 shadow-md"
                    >
                      <Heart
                        className="h-4 w-4 transition-all"
                        fill={
                          isInWishlist(id) ? "currentColor" : "none"
                        }
                        color={
                          isInWishlist(id)
                            ? "hsl(var(--primary))"
                            : "currentColor"
                        }
                      />
                    </button>
                  </div>
                  <div className="p-3 sm:p-4 flex flex-col flex-grow">
                    <h3 className="font-semibold text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                      {title}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-sm sm:text-base font-bold">
                        ₹{finalPrice.toLocaleString("en-IN")}
                      </span>
                      {discount && discount.value > 0 && (
                        <span className="text-xs sm:text-sm text-muted-foreground line-through">
                          ₹{price.toLocaleString("en-IN")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-yellow-500 mt-2">
                      {"★".repeat(5)}
                      <span className="ml-1 text-gray-500 uppercase">
                        (5)
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};
