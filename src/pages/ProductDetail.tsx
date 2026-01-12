import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Ruler,
  ArrowRight,
  Banknote,
  Truck,
  RefreshCcw,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { cn, escapeHtml } from "@/lib/utils";
import { SizeChartModal } from "@/components/SizeChartModal";
import { SizeChartTableModal } from "@/components/SizeChartTableModal";
import { ReviewModal } from "@/components/ReviewModal";
import ReviewsList from "@/components/ReviewsList";
import { AvailableCoupons } from "@/components/AvailableCoupons";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { RelatedProducts } from "@/components/RelatedProducts";
import { ShareButton } from "@/components/ShareButton";
import { useCouponRefresh } from "@/hooks/useCouponRefresh";

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
    } else {
      return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
    }
  }
  return s;
};

type P = {
  _id?: string;
  id?: string;
  name: string;
  title?: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  image_url?: string;
  stock?: number;
  description?: string;
  paragraph1?: string;
  paragraph2?: string;
  longDescription?: string;
  highlights?: string[];
  specs?: Array<{ key: string; value: string }>;
  createdAt?: string;
  updatedAt?: string;
  sizes?: string[];
  trackInventoryBySize?: boolean;
  sizeInventory?: Array<{ code: string; label: string; qty: number }>;
  sizeChartUrl?: string;
  sizeChartTitle?: string;
  sizeChart?: {
    title?: string;
    rows?: Array<{ sizeLabel: string; chest: string; brandSize: string }>;
    guidelines?: string;
    diagramUrl?: string;
    fieldLabels?: Record<string, string>;
  };
  colors?: string[];
  colorImages?: Record<string, string[]>;
  colorVariants?: Array<{
    colorName: string;
    colorCode?: string;
    images: string[];
    primaryImageIndex?: number;
  }>;
  colorInventory?: Array<{ color: string; qty: number }>;
  discount?: { type: 'percentage' | 'flat'; value: number };
  sku?: string;
  tags?: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  averageRating?: number;
  reviewCount?: number;
};

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { refreshKey } = useCouponRefresh(); // Use global refreshKey

  const [product, setProduct] = useState<P | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  // ✅ NEW: selected color
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showSizeChartTable, setShowSizeChartTable] = useState(false);
  const [sizeStockError, setSizeStockError] = useState<string>("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewKey, setReviewKey] = useState(0);
  const [isVerifiedBuyer, setIsVerifiedBuyer] = useState(false);
  const [activeTab, setActiveTab] = useState<"description" | "additional" | "reviews">("description");

  const descriptionRef = useRef<HTMLDivElement>(null);

  // ✅ Product fast fetch – Fetch by slug or ID
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setLoading(true);

        if (!slug) {
          throw new Error("Missing product identifier");
        }

        // ✅ Always use /api/products/:idOrSlug
        // Backend khud decide karega ki yeh ID hai ya slug
        const { ok, json } = await api(`/api/products/${slug}`);

        if (!ok) {
          throw new Error(json?.message || json?.error || "Failed to load product");
        }

        if (!ignore) {
          const productData = json?.data as P;

        setProduct(productData);
        setSelectedSize(""); // product change pe size reset
        console.log("Product data loaded:", productData);

          // ✅ Pehla color set karo:
          // 1) colorVariants[0].colorName
          // 2) warna colors[0]
          const firstColor =
            productData?.colorVariants?.[0]?.colorName ||
            productData?.colors?.[0] ||
            "";

          setSelectedColor(firstColor);
          setQuantity(1);
        }
      } catch (e: any) {
        if (!ignore) {
          toast({
            title: e?.message || "Failed to load product",
            variant: "destructive",
          });
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [slug, toast]);

  // ✅ Scroll top on product change (UX smooth)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [slug]);

  // ✅ Dynamic meta tags for social sharing (SEO + shareable URLs)
  useEffect(() => {
    if (!product) {
      document.title = "uni10 - Premium Streetwear & Lifestyle";
      return;
    }

    const productTitle = product.title || product.name || "Product";
    const productPrice = Number(product.price || 0);
    const priceStr = productPrice.toLocaleString("en-IN");

    // Use SEO title if available, otherwise use default format
    const pageTitle = product.seo?.title || `${productTitle} - ₹${priceStr} | uni10`;

    // Use SEO description if available, otherwise use product description
    const description = product.seo?.description || product.description || `Shop ${productTitle} at uni10. Premium streetwear and lifestyle products.`;
    const imageUrl = resolveImage(product.image_url || (product.images?.[0] || ""));

    // Update page title
    document.title = pageTitle;

    // Update or create meta description
    let descriptionMeta = document.querySelector('meta[name="description"]');
    if (!descriptionMeta) {
      descriptionMeta = document.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      document.head.appendChild(descriptionMeta);
    }
    descriptionMeta.setAttribute("content", description);

    // Update or create meta keywords if SEO keywords are provided
    if (product.seo?.keywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement("meta");
        keywordsMeta.setAttribute("name", "keywords");
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute("content", product.seo.keywords);
    }

    // Update or create OG title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", pageTitle);

    // Update or create OG description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement("meta");
      ogDesc.setAttribute("property", "og:description");
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute("content", description);

    // Update or create OG image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement("meta");
      ogImage.setAttribute("property", "og:image");
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute("content", imageUrl);

    // Update or create OG type
    let ogType = document.querySelector('meta[property="og:type"]');
    if (!ogType) {
      ogType = document.createElement("meta");
      ogType.setAttribute("property", "og:type");
      document.head.appendChild(ogType);
    }
    ogType.setAttribute("content", "product");

    // Update or create OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement("meta");
      ogUrl.setAttribute("property", "og:url");
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute("content", window.location.href);

    // Update or create canonical link for SEO
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", `${window.location.origin}/products/${slug}`);

    // Update Twitter card image
    let twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (!twitterImage) {
      twitterImage = document.createElement("meta");
      twitterImage.setAttribute("name", "twitter:image");
      document.head.appendChild(twitterImage);
    }
    twitterImage.setAttribute("content", imageUrl);

    // Update Twitter title
    let twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (!twitterTitle) {
      twitterTitle = document.createElement("meta");
      twitterTitle.setAttribute("name", "twitter:title");
      document.head.appendChild(twitterTitle);
    }
    twitterTitle.setAttribute("content", pageTitle);

    // Update Twitter description
    let twitterDesc = document.querySelector('meta[name="twitter:description"]');
    if (!twitterDesc) {
      twitterDesc = document.createElement("meta");
      twitterDesc.setAttribute("name", "twitter:description");
      document.head.appendChild(twitterDesc);
    }
    twitterDesc.setAttribute("content", description);
  }, [product, slug]);

  // ✅ Verified buyer check (runs AFTER product shown – does not block UI)
  useEffect(() => {
    const checkVerifiedBuyer = async () => {
      if (!user || !product?._id && !product?.id) {
        setIsVerifiedBuyer(false);
        return;
      }

      try {
        const { ok, json } = await api("/api/orders/mine");
        if (!ok || !Array.isArray(json?.data)) {
          setIsVerifiedBuyer(false);
          return;
        }

        const productId = product._id || product.id;
        const hasPurchased = json.data.some(
          (order: any) =>
            Array.isArray(order.items) &&
            order.items.some(
              (item: any) =>
                String(item.productId || item.id) === String(productId)
            )
        );

        setIsVerifiedBuyer(hasPurchased);
      } catch {
        setIsVerifiedBuyer(false);
      }
    };

    // Sirf tab run kare jab product change ho
    if (product) {
      checkVerifiedBuyer();
    }
  }, [user, product]);

  const img = useMemo(
    () =>
      resolveImage(
        product?.image_url || (product?.images?.[0] || "")
      ),
    [product]
  );
  const title = useMemo(
    () => product?.title || product?.name || "",
    [product]
  );

  // Get stock based on per-size inventory, color inventory, or general stock
  const getCurrentStock = useCallback(() => {
    // Check color inventory if color-wise stock tracking is enabled
    if (selectedColor && Array.isArray(product?.colorInventory)) {
      const colorStock = product.colorInventory.find(
        (c) => c.color === selectedColor
      );
      if (colorStock) {
        return colorStock.qty ?? 0;
      }
    }

    if (
      product?.trackInventoryBySize &&
      Array.isArray(product?.sizeInventory) &&
      selectedSize
    ) {
      const sizeInfo = product.sizeInventory.find(
        (s) => s.code === selectedSize
      );
      return sizeInfo?.qty ?? 0;
    }
    return Number(product?.stock ?? 0);
  }, [product, selectedSize, selectedColor]);

  const stockNum = useMemo(() => getCurrentStock(), [getCurrentStock]);
  const outOfStock = stockNum === 0;

  const selectedSizeInfo = useMemo(() => {
    if (
      product?.trackInventoryBySize &&
      Array.isArray(product?.sizeInventory) &&
      selectedSize
    ) {
      return product.sizeInventory.find((s) => s.code === selectedSize);
    }
    return null;
  }, [product, selectedSize]);

  const refetchProduct = useCallback(async () => {
    try {
      const productId = product?._id || product?.id;
      if (!productId) return;
      const { ok, json } = await api(`/api/products/${productId}`);
      if (ok) setProduct(json?.data as P);
    } catch {
      // ignore refresh errors
    }
  }, [product]);

  useEffect(() => {
    const onOrderPlaced = () => {
      refetchProduct();
    };
    window.addEventListener("order:placed", onOrderPlaced);
    return () =>
      window.removeEventListener("order:placed", onOrderPlaced);
  }, [refetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;

    const usingSizeInventory =
      product?.trackInventoryBySize &&
      Array.isArray(product?.sizeInventory);

    if (usingSizeInventory && !selectedSize) {
      toast({
        title: "Select a size",
        description: "Please choose a size before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    if (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Select a color",
        description: "Please choose a color before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    const currentStock =
      usingSizeInventory && selectedSize
        ? product.sizeInventory?.find(
            (s) => s.code === selectedSize
          )?.qty ?? 0
        : product.stock ?? 0;

    if (currentStock === 0) {
      const errorMsg =
        usingSizeInventory && selectedSize
          ? `Size ${selectedSize} is out of stock`
          : "Out of stock";
      setSizeStockError(errorMsg);
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }

    if (quantity > currentStock) {
      const errorMsg = `Only ${currentStock} available${
        usingSizeInventory && selectedSize
          ? ` for size ${selectedSize}`
          : ""
      }`;
      setSizeStockError(errorMsg);
      toast({
        title: "Insufficient stock",
        description: errorMsg,
        variant: "destructive",
      });
      return;
    }

    setSizeStockError("");
    const item: any = {
      id: String(product._id || product.id),
      title,
      price: Number(product.price || 0),
      image: img,
      meta: {} as any,
    };
    if (selectedSize) item.meta.size = selectedSize;
    // ✅ color ko meta me save karo
    if (selectedColor) item.meta.color = selectedColor;

    if (!user) {
      try {
        localStorage.setItem(
          "uni_add_intent",
          JSON.stringify({ item, qty: quantity })
        );
      } catch {}
      navigate("/auth");
      return;
    }
    addToCart(item, quantity);
    toast({
      title: "Added to cart!",
      description: `${title} has been added to your cart.`,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;

    const usingSizeInventory =
      product?.trackInventoryBySize &&
      Array.isArray(product?.sizeInventory);

    if (usingSizeInventory && !selectedSize) {
      toast({
        title: "Select a size",
        description:
          "Please choose a size before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (Array.isArray(product.colors) && product.colors.length > 0 && !selectedColor) {
      toast({
        title: "Select a color",
        description: "Please choose a color before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    const currentStock =
      usingSizeInventory && selectedSize
        ? product.sizeInventory?.find(
            (s) => s.code === selectedSize
          )?.qty ?? 0
        : product.stock ?? 0;

    if (currentStock === 0) {
      const errorMsg =
        usingSizeInventory && selectedSize
          ? `Size ${selectedSize} is out of stock`
          : "Out of stock";
      setSizeStockError(errorMsg);
      toast({ title: "Out of stock", variant: "destructive" });
      return;
    }

    const item: any = {
      id: String(product._id || product.id),
      title,
      price: Number(product.price || 0),
      image: img,
      meta: {} as any,
    };
    if (selectedSize) item.meta.size = selectedSize;
    if (selectedColor) item.meta.color = selectedColor;

    if (!user) {
      try {
        localStorage.setItem(
          "uni_add_intent",
          JSON.stringify({ item, qty: 1 })
        );
      } catch {}
      navigate("/auth");
      return;
    }
    addToCart(item, 1);
    navigate("/dashboard?checkout=true");
  };

  // ✅ small helper: js color name => CSS color
  const colorToCss = (c: string) => c.toLowerCase().trim();

  // ✅ Better loading UX: skeleton instead of plain text
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 sm:px-4 pt-24 pb-12">
          <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4 sm:space-y-5">
              <div className="h-4 w-24 bg-muted rounded" />
              <div className="h-7 sm:h-8 w-3/4 bg-muted rounded" />
              <div className="h-6 w-32 bg-muted rounded" />
              <div className="h-20 sm:h-24 bg-muted rounded" />
              <div className="h-10 w-full bg-muted rounded" />
              <div className="h-8 w-full bg-muted rounded" />
              <div className="h-40 sm:h-48 bg-muted rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    document.title = "Product Not Found | uni10";
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-3 sm:px-4 pt-24 pb-12 flex items-center justify-center">
          <div className="text-center py-12">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-3">
              Product Not Found
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-8 max-w-md mx-auto">
              The product you're looking for doesn't exist or may have been removed.
              Please check the URL or browse our collection.
            </p>
            <Link to="/shop">
              <Button size="lg">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Page Header */}
     
      <section className="w-full px-3 sm:px-4 py-8 sm:py-12 md:py-16">
        <div className="max-w-7xl mx-auto w-full">
          <Link
            to="/shop"
            className="inline-flex items-center text-xs sm:text-sm text-muted-foreground hover:text-foreground mb-6 sm:mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
            Back to Shop
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 sm:gap-8 md:gap-12 w-full bg-white p-6 sm:p-8 md:p-12 rounded-lg shadow-md">
            <div className="min-w-0 p-4">
              <ProductImageGallery
                images={product?.images || []}
                productTitle={title}
                selectedColor={selectedColor}
                colorImages={product?.colorImages}
                colorVariants={product?.colorVariants}
              />
            </div>

            <div className="min-w-0 p-4 sm:p-6 md:p-8 border border-gray-200 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 uppercase tracking-wider mb-2 break-words">
                {product.category}
              </p>
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter break-words text-gray-900">
                  {title}
                </h1>
                <ShareButton
                  productName={title}
                  productUrl={window.location.href}
                  productImage={img}
                />
              </div>
              <div className="flex items-baseline gap-3 mb-4 sm:mb-6">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                  ₹{(() => {
                    const basePrice = Number(product.price ?? 0);
                    let final = basePrice;
                    if (product?.discount?.value && product.discount.type === 'percentage') {
                      final = basePrice - (basePrice * product.discount.value / 100);
                      const priceStr = final.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                      return priceStr;
                    } else if (product?.discount?.value && product.discount.type === 'flat') {
                      final = Math.max(0, basePrice - product.discount.value);
                      const priceStr = final.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                      return priceStr;
                    }
                    const priceStr = basePrice.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    return priceStr;
                  })()}
                </p>
                {product?.discount?.value && product.discount.value > 0 && (
                  <div className="flex items-baseline">
                    <span className="text-sm sm:text-base text-gray-500 line-through mr-2">
                      ₹{Number(product.price ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </span>
                    <span className="text-sm font-medium text-red-600">
                      {product.discount.type === 'percentage' ? `${product.discount.value}% OFF` : `₹${product.discount.value} OFF`}
                    </span>
                  </div>
                )}
              </div>
              {product.paragraph1 && (
  <div className="flex items-start gap-2 text-sm mb-2">
    <span className="text-red-800 mt-0.5">
      <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.49991 0.879059C3.87771 0.879059 0.879059 3.87771 0.879059 7.49991C0.879059 11.1221 3.87771 14.1208 7.49991 14.1208C11.1221 14.1208 14.1208 11.1221 14.1208 7.49991C14.1208 3.87771 11.1221 0.879059 7.49991 0.879059ZM1.82737 7.49991C1.82737 4.40422 4.40422 1.82737 7.49991 1.82737C10.5956 1.82737 13.1724 4.40422 13.1724 7.49991C13.1724 10.5956 10.5956 13.1724 7.49991 13.1724C4.40422 13.1724 1.82737 10.5956 1.82737 7.49991ZM8.24991 4.24991C8.24991 3.8357 7.91422 3.49991 7.49991 3.49991C7.0857 3.49991 6.74991 3.8357 6.74991 4.24991V7.49991C6.74991 7.91412 7.0857 8.24991 7.49991 8.24991C7.91412 8.24991 8.24991 7.91412 8.24991 7.49991V4.24991ZM7.49991 9.74991C7.10287 9.74991 6.77259 10.0551 6.75017 10.4516L6.74991 10.5C6.74991 10.8971 7.05515 11.2274 7.45164 11.2498L7.49991 11.2499C7.89711 11.2499 8.22739 10.9447 8.24982 10.5482L8.24991 10.5C8.24991 10.1029 7.94467 9.77263 7.54818 9.75021L7.49991 9.74991Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
      </svg>
    </span>
    <p className="text-red-800 font-medium">{product.paragraph1}</p>
  </div>
)}

{product.paragraph2 && (
  <div className="flex items-start gap-2 text-sm mb-2">
    <span className="text-gray-900 mt-0.5">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 2C2.22386 2 2 2.22386 2 2.5C2 2.77614 2.22386 3 2.5 3H3.12104L4.5 10.5H12.5L14 4.5H5L4.87896 3.81957C4.82128 3.52339 4.55871 3.31547 4.25 3.31547H2.5ZM5.12104 5.5H12.7639L11.7639 9.5H5.5L5.12104 5.5ZM5.5 12C4.67157 12 4 12.6716 4 13.5C4 14.3284 4.67157 15 5.5 15C6.32843 15 7 14.3284 7 13.5C7 12.6716 6.32843 12 5.5 12ZM11.5 12C10.6716 12 10 12.6716 10 13.5C10 14.3284 10.6716 15 11.5 15C12.3284 15 13 14.3284 13 13.5C13 12.6716 12.3284 12 11.5 12Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
      </svg>
    </span>
    <p className="text-gray-900 font-medium">{product.paragraph2}</p>
  </div>
)}
              <div className="mb-3 sm:mb-4">
                <Badge
                  variant={outOfStock ? "destructive" : "secondary"}
                  className="text-xs sm:text-sm"
                >
                  {outOfStock ? "Not Available" : "Available"}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mb-4 sm:mb-6">
                {product.description && product.description.length > 150
                  ? (<> {`${product.description.substring(0, 150)}...`} <span
                      className="text-primary text-sm cursor-pointer hover:underline"
                      onClick={() => {
                        descriptionRef.current?.scrollIntoView({ behavior: 'smooth' });
                        setActiveTab("description");
                      }}
                    >
                      Read more
                    </span></>)
                  : product.description}
              </p>

              <AvailableCoupons
                refreshTrigger={refreshKey}
                onUseNow={(code) => {
                  navigate(`/cart?coupon=${encodeURIComponent(code)}`);
                }}
                productPrice={Number(product.price ?? 0)}
              />

              {/* ✅ COLOR OPTIONS UI - supports both old colors array and new colorVariants */}
              {(() => {
                // Use colorVariants if available, otherwise fallback to colors array
                const colorOptions = product?.colorVariants?.length > 0
                  ? product.colorVariants.map(cv => ({ name: cv.colorName, code: cv.colorCode }))
                  : product?.colors?.length > 0
                  ? product.colors.map(c => ({ name: c, code: undefined }))
                  : [];

                return colorOptions.length > 0 ? (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {colorOptions.map((colorOpt) => {
                        const c = colorOpt.name;
                        const colorStock = Array.isArray(product.colorInventory)
                          ? product.colorInventory.find(ci => ci.color === c)?.qty ?? 0
                          : Number(product.stock ?? 0);
                        const isOutOfStock = colorStock === 0;

                        return (
                          <button
                            key={c}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => {
                              setSelectedColor((prevColor) => {
                                const newColor = prevColor === c ? undefined : c;
                                console.log('Selected color changed to:', newColor);
                                return newColor;
                              });
                            }}
                            className={cn(
                              "flex items-center gap-2 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border text-xs sm:text-sm transition-colors",
                              isOutOfStock
                                ? "opacity-50 cursor-not-allowed bg-muted border-border text-muted-foreground"
                                : selectedColor === c
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-transparent border-border hover:border-primary"
                            )}
                          >
                            <span
                              className="h-4 w-4 rounded-full border border-current"
                              style={{ backgroundColor: colorOpt.code ? colorOpt.code : colorToCss(c) }}
                            />
                            <span>{c}</span>
                            {isOutOfStock && <span className="text-xs">Out of Stock</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Per-size inventory display */}
              {product?.trackInventoryBySize &&
                Array.isArray(product?.sizeInventory) &&
                product.sizeInventory.length > 0 && (
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                      <label className="block text-xs sm:text-sm font-semibold">
                        Size
                      </label>
                      {product.sizeChart ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSizeChartTable(true)}
                          className="text-xs h-auto p-1"
                        >
                          <Ruler className="h-3 w-3 mr-1" />
                          Size Chart
                        </Button>
                      ) : (
                        product.sizeChartUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSizeChart(true)}
                            className="text-xs h-auto p-1"
                          >
                            <Ruler className="h-3 w-3 mr-1" />
                            Size Chart
                          </Button>
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3 pb-2 sm:pb-3">
                      {product.sizeInventory.map((sizeItem) => {
                        const isOutOfStock = sizeItem.qty === 0;
                        const isLowStock =
                          sizeItem.qty > 0 && sizeItem.qty <= 3;
                        return (
                          <div key={sizeItem.code} className="relative pb-2 sm:pb-3">
                            <button
                              type="button"
                              disabled={isOutOfStock}
                              onClick={() => {
                                setSelectedSize(sizeItem.code);
                                setSizeStockError("");
                              }}
                              className={cn(
                                "px-3 sm:px-4 py-1.5 sm:py-2 rounded border text-xs sm:text-sm font-medium transition-colors",
                                isOutOfStock
                                  ? "opacity-50 cursor-not-allowed bg-muted border-border text-muted-foreground"
                                  : selectedSize === sizeItem.code
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-transparent border-border hover:border-primary"
                              )}
                            >
                              {sizeItem.label}
                            </button>
                            {isOutOfStock && (
                              <span className="text-xs text-destructive font-medium whitespace-nowrap mt-1 block">
                                Out of stock
                              </span>
                            )}
                            {isLowStock && !isOutOfStock && (
                              <span className="text-xs text-orange-600 font-medium whitespace-nowrap mt-1 block">
                                Only {sizeItem.qty} left
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {sizeStockError && (
                      <p className="text-xs text-destructive mt-4">
                        {sizeStockError}
                      </p>
                    )}
                  </div>
                )}

              {/* Simple sizes (non-inventory tracked) */}
              {!product?.trackInventoryBySize &&
                Array.isArray(product?.sizes) &&
                product.sizes.length > 0 && (
                  <div className="mb-2 sm:mb-3">
                    <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                      <label className="block text-xs sm:text-sm font-semibold">
                        Size
                      </label>
                      {product.sizeChart ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSizeChartTable(true)}
                          className="text-xs h-auto p-1"
                        >
                          <Ruler className="h-3 w-3 mr-1" />
                          Size Chart
                        </Button>
                      ) : (
                        product.sizeChartUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowSizeChart(true)}
                            className="text-xs h-auto p-1"
                          >
                            <Ruler className="h-3 w-3 mr-1" />
                            Size Chart
                          </Button>
                        )
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {product.sizes.map((sz) => (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            setSelectedSize(sz);
                            setSizeStockError("");
                          }}
                          className={cn(
                            "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded border text-xs sm:text-sm",
                            selectedSize === sz
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-transparent border-border"
                          )}
                        >
                          {sz}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mb-2 sm:mb-3">
                <label className="block text-xs sm:text-sm font-semibold mb-2 sm:mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => Math.max(1, q - 1))
                    }
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    -
                  </Button>
                  <span className="font-semibold min-w-[40px] text-center text-sm sm:text-base">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setQuantity((q) => q + 1)
                    }
                    className="h-9 w-9 sm:h-10 sm:w-10"
                  >
                    +
                  </Button>
                </div>
              </div>

             

              <div className="space-y-3 sm:space-y-4 mt-8">
                {outOfStock ||
                (product?.trackInventoryBySize && !selectedSize) ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full block">
                            <Button
                            size="lg"
                            className="w-full text-xs sm:text-sm h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium"
                            disabled
                          >
                            <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                            Add to Cart
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {outOfStock
                          ? "Out of stock"
                          : "Please select a size"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Button
                    size="lg"
                    className="w-full text-xs sm:text-sm h-12 sm:h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-base font-medium"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                    Add to Cart
                  </Button>
                )}
                {!(
                  outOfStock ||
                  (product?.trackInventoryBySize && !selectedSize)
                ) && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-xs sm:text-sm h-12 sm:h-14 border-primary text-primary hover:bg-primary/5 text-base font-medium"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                )}
                {user ? (
                  <Button
                    size="lg"
                    variant={isVerifiedBuyer ? "secondary" : "outline"}
                    className="w-full text-xs sm:text-sm h-9 sm:h-11"
                    onClick={() => setShowReviewModal(true)}
                    disabled={!isVerifiedBuyer}
                  >
                    {isVerifiedBuyer
                      ? "Write a Review"
                      : "Available after purchase"}
                  </Button>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="w-full block">
                          <Button
                            size="lg"
                            variant="outline"
                            className="w-full text-xs sm:text-sm h-9 sm:h-11"
                            disabled
                          >
                            Write a Review
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Sign in to write a review
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>

              <div className="border-t border-b border-border py-4 grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center justify-center text-center">
                  <Banknote className="w-6 h-6 text-primary mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm font-medium">CASH ON DELIVERY</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <Truck className="w-6 h-6 text-primary mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm font-medium">FREE SHIPPING</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center">
                  <RefreshCcw className="w-6 h-6 text-primary mb-1 sm:mb-2" />
                  <span className="text-xs sm:text-sm font-medium">EASY RETURNS</span>
                </div>
              </div>
            </div>

           
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full mt-8 sm:mt-12">
          <div className="flex flex-col md:flex-row bg-white rounded-lg shadow border border-gray-200">
            <div className="md:w-1/4 lg:w-1/5 p-4 sm:p-5 md:p-6">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors mb-2 flex items-center justify-between",
                  activeTab === "description"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Description
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
              {(product?.highlights?.length || product?.specs?.length) > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab("additional")}
                  className={cn(
                    "w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors mb-2 flex items-center justify-between",
                    activeTab === "additional"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  Additional Information
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "w-full text-left py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-between",
                  activeTab === "reviews"
                    ? "bg-gray-800 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                Reviews ({product?.reviewCount || 0})
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
            <div className="md:w-3/4 lg:w-4/5 p-4 sm:p-6 md:p-8">
  {activeTab === "description" && (
    <div ref={descriptionRef} className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Product Description
        </h3>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
      </div>
      
      {product?.longDescription ? (
        <div className="prose prose-sm sm:prose-base max-w-none">
          <div className="text-gray-700 leading-relaxed space-y-4 bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-xl border border-gray-100 shadow-sm">
            {descriptionExpanded || product.longDescription.length <= 250 ? (
              <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-7 text-gray-600 overflow-wrap-break-word px-2">
                {escapeHtml(product.longDescription)}
              </p>
            ) : (
              <p className="whitespace-pre-wrap break-words text-sm sm:text-base leading-7 text-gray-600 overflow-wrap-break-word px-2">
                {escapeHtml(product.longDescription.substring(0, 250))}...
              </p>
            )}
            {product.longDescription.length > 250 && (
              <button
                onClick={() => setDescriptionExpanded((v) => !v)}
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold mt-4 text-sm px-5 py-2.5 rounded-lg hover:bg-primary/5 transition-all border border-primary/20 hover:border-primary/40"
              >
                {descriptionExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Read full description
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No detailed description available</p>
          </div>
        </div>
      )}
    </div>
  )}

  {activeTab === "additional" && (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Additional Information
        </h3>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
      </div>
      
      {product?.highlights && product.highlights.length > 0 && (
        <div className="min-w-0">
          <h4 className="text-lg sm:text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Key Highlights
          </h4>
          <div className="grid gap-3">
            {product.highlights.map((highlight, idx) => (
              <div 
                key={idx} 
                className="group flex items-start gap-4 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 hover:border-primary/30 hover:shadow-md transition-all duration-200"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-gray-700 leading-relaxed text-sm sm:text-base font-medium">
                  {highlight}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {product?.specs && product.specs.length > 0 && (
        <div className="min-w-0">
          <h4 className="text-lg sm:text-xl font-bold mb-5 text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded-full"></span>
            Technical Specifications
          </h4>
          <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm bg-white">
            <table className="w-full">
              <tbody className="divide-y divide-gray-100">
                {product.specs.map((spec, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "hover:bg-gradient-to-r hover:from-primary/5 hover:to-transparent transition-all duration-200",
                      idx % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                    )}
                  >
                    <td className="px-5 sm:px-8 py-4 sm:py-5 text-sm sm:text-base font-bold text-gray-900 w-2/5">
                      {spec.key}
                    </td>
                    <td className="px-5 sm:px-8 py-4 sm:py-5 text-sm sm:text-base text-gray-600 font-medium">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {(!product?.highlights?.length && !product?.specs?.length) && (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm font-medium">No additional information available</p>
          </div>
        </div>
      )}
    </div>
  )}

  {activeTab === "reviews" && (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          Customer Reviews
          {product?.reviewCount > 0 && (
            <span className="text-lg font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
              {product.reviewCount}
            </span>
          )}
        </h3>
        <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
      </div>
      <div className="bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-xl border border-gray-100">
        <ReviewsList 
          key={product?._id || product?.id || ""} 
          productId={product?._id || product?.id || ""} 
        />
      </div>
    </div>
  )}
</div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto w-full">
          <RelatedProducts productId={product?._id || product?.id || ""} />
        </div>
      </section>

      <ReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        productId={product?._id || product?.id || ""}
        onSuccess={() => {
          setReviewKey((prev) => prev + 1);
        }}
      />

      <SizeChartModal
        open={showSizeChart}
        onOpenChange={setShowSizeChart}
        title={product?.sizeChartTitle || "Size Chart"}
        chartUrl={product?.sizeChartUrl}
      />

      <SizeChartTableModal
        open={showSizeChartTable}
        onOpenChange={setShowSizeChartTable}
        title={
          product?.sizeChart?.title ||
          `${title} • Size Chart`
        }
        rows={product?.sizeChart?.rows}
        guidelines={product?.sizeChart?.guidelines}
        diagramUrl={product?.sizeChart?.diagramUrl}
        fieldLabels={product?.sizeChart?.fieldLabels}
      />

      <Footer />
    </div>
  );
};

export default ProductDetail;
