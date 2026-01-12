import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { FeatureRow } from "@/components/FeatureRow";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-cosmic.jpg";
import { ProductSlider } from "@/components/ProductSlider";
import InfluencerSection from "@/components/InfluencerSection";
import InfluencerImageGrid from "@/components/InfluencerImageGrid";
import AboutUsSection from "@/components/AboutUsSection";
import { FeatureSection } from "@/components/FeatureSection";
import RecentReviewsSection from "@/components/RecentReviewsSection";

// ✅ UPDATED FEATURE IMAGES
// HOODIES -> new image
import hoodiesFeatureImg from "@/assets/IMG_4100.jpg";
// LOWER -> previously denims image
import lowerFeatureImg from "@/assets/IMG_4099.jpg";
// CO-ORD
import coordFeatureImg from "@/assets/IMG_4098.jpg";

import { NewsTicker } from "@/components/NewsTicker";
import { useEffect, useMemo, useState, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import {  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Types aligned with server payloads
type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  category?: string;
  images?: string[];
  image_url?: string;
  slug?: string;
  createdAt?: string;
};

type CategoryRow = {
  _id?: string;
  id?: string;
  name?: string;
  imageUrl?: string;
  slug?: string;
  parent?: string | null;
};

type FeatureRowData = {
  key: string;
  title: string;
  link?: string;
  imageAlt?: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || "";

const resolveImage = (src?: string) => {
  const s = String(src || "");
  if (!s) return "/placeholder.svg";
  if (s.startsWith("http")) return s;

  const isLocalBase = (() => {
    try {
      return API_BASE.includes("localhost") || API_BASE.includes("127.0.0.1");
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
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
    return s.startsWith("/") ? `/api${s}` : `/api/${s}`;
  }
  return s;
};

function slugify(input: string) {
  return String(input || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const Index = () => {
  // Feature Rows state
  const [featureRows, setFeatureRows] = useState<FeatureRowData[]>([]);
  const [featureRowsLoading, setFeatureRowsLoading] = useState(true);

  /**
   * ✅ DEFAULT FEATURE ROWS (Final truth)
   * Homepage ke big titles ka base control yahi se hoga.
   */
  const defaultFeatureRows: FeatureRowData[] = [
    {
      key: "hoodies",
      title: "HOODIES",
      imageAlt: "Hoodies Collection",
    },
    {
      key: "lower",
      title: "BOTTOMS",
      imageAlt: "Lower Collection",
    },
    {
      key: "co-ord",
      title: "CO-ORD",
      imageAlt: "Co-ord Collection",
    },
  ];

  // Featured Products state
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);

  // New Arrivals state
  const [newArrivals, setNewArrivals] = useState<ProductRow[]>([]);
  const [newArrivalsLoading, setNewArrivalsLoading] = useState(true);
  const [newArrivalsError, setNewArrivalsError] = useState<string | null>(null);

  // Categories + mixed products state
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState<string | null>(null);
  const [mixedProducts, setMixedProducts] = useState<ProductRow[]>([]);
  const [mixedLoading, setMixedLoading] = useState(true);
  const [mixedError, setMixedError] = useState<string | null>(null);
  const [categoryProducts, setCategoryProducts] = useState<
    Map<string, ProductRow>
  >(new Map());

  /**
   * ✅ Fetch Feature Rows from settings
   * - API title default ko blindly override nahi karega
   * - Title sirf tab override hoga jab key match ho
   */
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setFeatureRowsLoading(true);

        const { ok, json } = await api("/api/settings/home");
        if (!ok) throw new Error(json?.message || json?.error || "Failed");

        const rows = Array.isArray(json?.data?.featureRows)
          ? (json.data.featureRows as Partial<FeatureRowData>[])
          : [];

        if (ignore) return;

        const merged = defaultFeatureRows.map((def, idx) => {
          const byKey = rows.find((r) => r?.key && r.key === def.key);
          const fallback = rows[idx];
          const src = byKey || fallback || {};

          return {
            ...def,
            imageAlt: src.imageAlt ?? def.imageAlt,
            link: src.link ?? def.link,
            title:
              src.key && src.key === def.key && src.title
                ? String(src.title)
                : def.title,
          };
        });

        setFeatureRows(merged);
      } catch {
        if (!ignore) setFeatureRows(defaultFeatureRows);
      } finally {
        if (!ignore) setFeatureRowsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch Featured Products
  const { user } = useAuth();
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);

        const { ok, json } = await api("/api/products?featured=true&active=all");
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        const list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        if (!ignore) setFeaturedProducts(list);
      } catch (e: any) {
        if (!ignore)
          setFeaturedError(e?.message || "Failed to load featured products");
      } finally {
        if (!ignore) setFeaturedLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Fetch New Arrivals
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setNewArrivalsLoading(true);
        setNewArrivalsError(null);

        const limit = 12;
        const { ok, json } = await api(
          `/api/products?sort=createdAt:desc&limit=${limit}&active=all`
        );
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        let list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        list = list.sort((a, b) => {
          const da = new Date(a.createdAt || "").getTime();
          const db = new Date(b.createdAt || "").getTime();
          return db - da;
        });

        if (!ignore) setNewArrivals(list.slice(0, limit));
      } catch (e: any) {
        if (!ignore)
          setNewArrivalsError(e?.message || "Failed to load new arrivals");
      } finally {
        if (!ignore) setNewArrivalsLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [user]);

  // Fetch categories + products for each category (parallel)
  useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        setCatsLoading(true);
        setCatsError(null);

        const { ok, json } = await api("/api/categories");
        if (!ok)
          throw new Error(
            json?.message || json?.error || "Failed to load categories"
          );

        const list = Array.isArray(json?.data)
          ? (json.data as CategoryRow[])
          : [];

        const subcategories = list.filter(cat => cat.parent !== null);
        if (!ignore) setCats(subcategories);

        setMixedLoading(true);
        setMixedError(null);

        const catIds = subcategories.map((cat) => cat.slug || cat.name || "");
        const productPromises = catIds.map((catId) =>
          api(`/api/products?category=${encodeURIComponent(catId)}&limit=1`)
        );

        const results = await Promise.all(productPromises);
        const catMap = new Map<string, ProductRow>();

        results.forEach((res, index) => {
          if (res.ok) {
            const products = Array.isArray(res.json?.data)
              ? (res.json.data as ProductRow[])
              : [];
            if (products.length > 0) {
              catMap.set(catIds[index], products[0]);
            }
          }
        });

        const pre = await api("/api/products?limit=200");
        if (!pre.ok)
          throw new Error(
            pre.json?.message || pre.json?.error || "Failed to load products"
          );

        const productsAll = Array.isArray(pre.json?.data)
          ? (pre.json.data as ProductRow[])
          : [];

        const catNames = new Set<string>(catIds);
        const filtered = productsAll.filter(
          (p) => p.category && catNames.has(String(p.category))
        );
        const enriched = filtered.length ? filtered : productsAll;

        const mixed = enriched
          .filter(Boolean)
          .sort(
            (a, b) =>
              new Date(b.createdAt || "").getTime() -
              new Date(a.createdAt || "").getTime()
          )
          ;

        if (!ignore) {
          setCategoryProducts(catMap);
          setMixedProducts(mixed);
        }
      } catch (e: any) {
        if (!ignore) {
          setCatsError(e?.message || "Failed to load categories");
          setMixedError(e?.message || "Failed to load products");
          setCats([]);
          setMixedProducts([]);
          setCategoryProducts(new Map());
        }
      } finally {
        if (!ignore) {
          setCatsLoading(false);
          setMixedLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  // Helpers to map product row to ProductCard props
  const mapToCard = (p: ProductRow) => {
    const id = String(p._id || p.id || "");
    const title = p.title || p.name || "";
    const rawImg =
      p.image_url ||
      (Array.isArray(p.images) ? p.images[0] : "") ||
      (p as any).image ||
      "/placeholder.svg";

    const img = resolveImage(rawImg);
    const originalPrice = Number(p.price || 0);
    const discountedPrice = Math.round(originalPrice * 0.8); // 20% discount for demonstration
    const rating = (Math.random() * (5 - 3) + 3).toFixed(1); // Random rating between 3 and 5

    return {
      id,
      name: title,
      price: originalPrice,
      image: img,
      category: p.category || "",
      slug: p.slug || "",
      images: Array.isArray(p.images) ? p.images : [],
      discountedPrice: discountedPrice,
      rating: Number(rating),
    };
  };

  const catSlugForProduct = (p: ProductRow) => {
    const cat = String(p.category || "");
    const found = cats.find((c) => c.slug === cat || c.name === cat);
    if (found?.slug) return found.slug;
    return slugify(cat);
  };

  const topCats = useMemo(() => cats.slice(0, 8), [cats]);

  /**
   * ✅ Helper: Feature Rows ke "View" button ke liye
   * - Pehle categories (cats) me se matching category dhoondta hai
   * - Agar mil jaye to `/collection/<slug>` pe le جاتا hai
   * - Warna `/shop?category=<fallbackTitle>` pe redirect
   */
  const getFeatureCategoryLink = (key: string, fallbackTitle: string) => {
    const k = key.toLowerCase();
    const fallback = fallbackTitle.toLowerCase();

    const match = cats.find((c) => {
      const name = (c.name || "").toLowerCase();

      if (k === "hoodies") {
        return name.includes("hood");
      }
      if (k === "lower") {
        return (
          name.includes("lower") ||
          name.includes("bottom") ||
          name.includes("bottoms") ||
          name.includes("denim")
        );
      }
      if (k === "co-ord" || k === "coord") {
        return name.includes("co-ord") || name.includes("coord");
      }

      // generic fallback – exact match on title text
      return name === fallback;
    });

    if (match) {
      const slug = match.slug || slugify(match.name || "");
      return `/collection/${slug}`;
    }

    // Fallback: old /shop?category= query approach
    return `/shop?category=${encodeURIComponent(fallbackTitle)}`;
  };

  // New arrivals marquee
  // ✅ Feature row titles + links ek jagah calculate kar liye
  const hoodiesTitle = featureRows[0]?.title || "HOODIES";
  const lowerTitle = featureRows[1]?.title || "BOTTOMS";
  const coordTitle = featureRows[2]?.title || "CO-ORD";

  const hoodiesLink = getFeatureCategoryLink("hoodies", hoodiesTitle);
  const lowerLink = getFeatureCategoryLink("lower", lowerTitle);
  const coordLink = getFeatureCategoryLink("co-ord", coordTitle);

  return (
    <div className="min-h-screen bg-[#F5F3ED] overflow-x-hidden sm:overflow-x-visible text-gray-800">
      <Navbar />

      {/* Ticker line – header ke niche */}

      {/* Product Slider Section */}
      <ProductSlider className="pt-16" />
    

      {/* Featured Products */}
      <section className="bg-[#f5f2ee] py-12 sm:py-16 lg:py-20">
  <div className="container mx-auto px-4 sm:px-6">
    {/* Header */}
    <div className="flex items-center mb-16 sm:mb-20 justify-center">
      <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-center">
        <span className="text-black">Collection</span>
      </h2>
    </div>

    {featuredLoading ? (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    ) : featuredError ? (
      <div className="text-center py-12 text-gray-500">
        {featuredError}
      </div>
    ) : (
      <div className="relative">
        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4 sm:-ml-6">
            {(featuredProducts.length
              ? featuredProducts
              : newArrivals
            ).map((product) => {
              const card = mapToCard(product);
              const to = `/product/${card.id}`;
              return (
                <CarouselItem
                  key={String(product._id || product.id)}
                  className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard {...card} to={to} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Navigation Buttons - Desktop */}
          <div className="hidden sm:flex gap-2 absolute -top-[72px] right-0">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
            <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
          </div>
          
          {/* Navigation Buttons - Mobile */}
          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
            <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
          </div>
        </Carousel>
      </div>
    )}
  </div>
</section>

      {/* Categories grid with product showcase */}
        <section className="mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-6 sm:pt-12">
        <div className="text-center mb-20">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
            Categories
          </h2>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Shop By <span className="text-[#ba8c5c]">Collections</span>
          </p>
        </div>

        {catsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 sm:gap-6 mb-8 sm:mb-12 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-muted/40 animate-pulse"
              />
            ))}
          </div>
        ) : catsError ? (
          <div className="text-center text-sm text-muted-foreground mb-12">
            {catsError}
          </div>
        ) : (
          <div className="relative">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2">
                {topCats.map((c) => {
                  const catId = c.slug || c.name || "";
                  const prod = categoryProducts.get(catId);
                  const to = `/collection/${c.slug || slugify(c.name || "")}`;

                  return (
                    <CarouselItem
                      key={String(c._id || c.id || c.slug || c.name)}
                      className="pl-2 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
                    >
                      <Link
                        to={to}
                        className="flex flex-col items-center justify-center space-y-2"
                      >
                        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-primary-foreground flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105">
                          <img
                            src={resolveImage(c.imageUrl || "/placeholder.svg")}
                            alt={c.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium text-center line-clamp-2">
                          {c.name}
                        </span>
                      </Link>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="absolute -left-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] transition-all" />
              <CarouselNext className="absolute -right-6 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full border-2 border-gray-300 bg-white hover:border-[#ba8c5c] transition-all" />
            </Carousel>
          </div>
        )}
      </section>

   {/* Banner Section */}
   <section className="container mx-auto px-4 py-20">
  <div className="relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800 p-4 md:p-12">
    {/* Decorative accent */}
    <div className="absolute top-8 left-8 text-red-600 text-6xl font-bold opacity-50">///</div>
    <div className="absolute bottom-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-red-600 rounded-tl-full opacity-20"></div>
    
    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      {/* Product Image */}
      <div className="relative flex justify-center">
        <div className="relative">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform border-4 border-gray-800">
            <img src={hoodiesFeatureImg} alt="Black Hoodie" className="w-32 h-32 md:w-40 md:h-40 object-contain" />
          </div>
          {/* Discount Badge */}
          <div className="absolute -top-3 -right-3 bg-red-600 rounded-lg px-4 py-2 shadow-lg">
            <div className="text-xl font-bold text-white">40% Off</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="text-white">
        <p className="text-xs font-medium mb-1 text-red-500">Deal of the Week</p>
        <h2 className="text-2xl md:text-5xl font-bold mb-3 leading-tight">
          Deal of the Week Let's
          <br />
          Shopping <span className="text-red-600">Today</span>
        </h2>
        
        <div className="flex flex-col items-center sm:items-start gap-3 mb-4">
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors shadow-lg text-sm">
            Shop Now
          </button>
          <div className="flex items-center gap-2">
            <span className="text-base line-through opacity-75">₹450</span>
            <span className="text-xl font-bold text-red-500">₹350</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-2">
            <span>Available: 15</span>
            <span>Already Sold: 85</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full" style={{width: '85%'}}></div>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="flex justify-center mt-4">
          <div>
          <p className="text-sm mb-1 font-medium">Hurry Up:</p>
          <p className="text-xs mb-2 opacity-90">Offer ends in</p>
          <div className="flex gap-2">
            <div className="bg-white text-gray-900 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-lg">
              <div className="text-base font-bold">20</div>
              <div className="text-[8px]">Days</div>
            </div>
            <div className="bg-white text-gray-900 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-lg">
              <div className="text-base font-bold">12</div>
              <div className="text-[8px]">Hours</div>
            </div>
            <div className="bg-white text-gray-900 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-lg">
              <div className="text-base font-bold">42</div>
              <div className="text-[8px]">Mins</div>
            </div>
            <div className="bg-white text-gray-900 rounded-full w-10 h-10 flex flex-col items-center justify-center shadow-lg">
              <div className="text-base font-bold">23</div>
              <div className="text-[8px]">Sec</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  </div>
</section>
      

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-16 md:py-24 bg-background rounded-xl shadow-sm">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            New <span className="text-primary">Arrivals</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto">
            Discover our latest additions and stay ahead of the trends. Fresh styles just dropped!
          </p>
        </div>

        {newArrivalsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gray-200"
              />
            ))}
          </div>
        ) : newArrivalsError ? (
          <div className="text-center py-12 text-destructive-foreground">
            {newArrivalsError}
          </div>
        ) : (
          <div className="relative">
            <Carousel opts={{ align: "start", loop: true }} className="w-full">
              <CarouselContent className="-ml-4 sm:-ml-6">
                {newArrivals.map((product) => {
                  const card = mapToCard(product);
                  const to = `/product/${card.id}`;
                  return (
                    <CarouselItem
                      key={String(product._id || product.id)}
                      className="pl-4 sm:pl-6 basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <ProductCard {...card} to={to} />
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              
              {/* Navigation Buttons - Desktop */}
              <div className="hidden sm:flex gap-2 absolute -top-[72px] right-0">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
                <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
              </div>
              
              {/* Navigation Buttons - Mobile */}
              <div className="flex sm:hidden justify-center gap-2 mt-6">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
                <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c]  transition-all" />
              </div>
            </Carousel>
            
            <div className="text-center mt-10 md:mt-16">
              <Link
                to="/shop/new-arrivals"
                className="inline-flex items-center text-sm font-medium text-primary hover:text-gray-900 transition-colors group"
              >
                View All Products
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </section>

  
      {/* From these categories */}
      <InfluencerSection />
      <InfluencerImageGrid />

      <AboutUsSection />

      <FeatureSection />

      <RecentReviewsSection />

   
      <Footer />
      <PWAInstallPrompt />
      <WhatsAppButton phoneNumber="+91 7355818140" />
    </div>
  );
};

export default Index;
