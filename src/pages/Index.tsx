import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RunningText } from "@/components/RunningText";
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
import FAQSection from "@/components/FAQSection";
import BestSellerSection from "@/components/BestSellerSection";

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
  reviews?: Array<{
    id: string;
    username: string;
    email: string;
    rating: number;
    text: string;
    status: string;
    createdAt: string;
  }>;
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
const HOME_DEBUG = !!import.meta.env.DEV;

function homeLog(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.log(...args);
}

function homeWarn(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
}

function homeError(...args: any[]) {
  if (!HOME_DEBUG) return;
  // eslint-disable-next-line no-console
  console.error(...args);
}

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

  // Global mouse up handler to clear active states from carousel navigation
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Clear any active states by removing focus from all elements
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Remove any active classes from carousel buttons
      document.querySelectorAll('button:active').forEach(el => {
        (el as HTMLElement).blur();
      });
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Global mouse up handler to clear active states from all buttons (ProductCard buttons)
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      // Clear any active states by removing focus from all elements
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      // Remove any active classes from all buttons
      document.querySelectorAll('button:active').forEach(el => {
        (el as HTMLElement).blur();
      });
      // Specifically target carousel navigation buttons
      document.querySelectorAll('[data-slot="carousel-previous"], [data-slot="carousel-next"]').forEach(el => {
        (el as HTMLElement).blur();
      });
      // Also target any button with carousel-related classes
      document.querySelectorAll('button[class*="carousel"]').forEach(el => {
        (el as HTMLElement).blur();
      });
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, []);

  // Additional handler specifically for New Arrivals carousel buttons
  useEffect(() => {
    const handleNewArrivalsMouseUp = () => {
      // Target all buttons aggressively
      const allButtons = document.querySelectorAll('button');
      allButtons.forEach(el => {
        (el as HTMLElement).blur();
        (el as HTMLElement).classList.remove('active', 'focus', 'hover');
      });
      
      // Specifically target New Arrivals carousel buttons
      const newArrivalsButtons = document.querySelectorAll('.relative button[class*="carousel"], .relative button[class*="CarouselPrevious"], .relative button[class*="CarouselNext"]');
      newArrivalsButtons.forEach(el => {
        (el as HTMLElement).blur();
        (el as HTMLElement).classList.remove('active', 'focus', 'hover');
        // Force remove any inline styles that might be causing the issue
        (el as HTMLElement).style.removeProperty('background-color');
        (el as HTMLElement).style.removeProperty('color');
        (el as HTMLElement).style.removeProperty('border-color');
      });
      
      // Also target by specific class patterns
      document.querySelectorAll('[class*="rounded-full"][class*="border-2"]').forEach(el => {
        (el as HTMLElement).blur();
        (el as HTMLElement).classList.remove('active', 'focus', 'hover');
      });
    };

    document.addEventListener('mouseup', handleNewArrivalsMouseUp);
    document.addEventListener('touchend', handleNewArrivalsMouseUp);
    document.addEventListener('click', handleNewArrivalsMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleNewArrivalsMouseUp);
      document.removeEventListener('touchend', handleNewArrivalsMouseUp);
      document.removeEventListener('click', handleNewArrivalsMouseUp);
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

        const url = "/api/products?featured=true&active=all";
        homeLog("[Index] Featured: request", { url });
        const { ok, status, json } = await api(url);
        homeLog("[Index] Featured: response", {
          url,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        const list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        if (!Array.isArray(json?.data)) {
          homeWarn("[Index] Featured: json.data is not an array", { url, json });
        }
        homeLog("[Index] Featured: mapped list length", { len: list.length });
        if (!ignore) setFeaturedProducts(list);
      } catch (e: any) {
        homeError("[Index] Featured: error", e);
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
        const url = `/api/products?sort=createdAt:desc&limit=${limit}&active=all`;
        homeLog("[Index] NewArrivals: request", { url });
        const { ok, status, json } = await api(url);
        homeLog("[Index] NewArrivals: response", {
          url,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(json?.message || json?.error || "Failed to load");

        let list = Array.isArray(json?.data)
          ? (json.data as ProductRow[])
          : [];

        if (!Array.isArray(json?.data)) {
          homeWarn("[Index] NewArrivals: json.data is not an array", {
            url,
            json,
          });
        }
        homeLog("[Index] NewArrivals: list before sort", {
          len: list.length,
          sampleCreatedAt: list[0]?.createdAt,
        });
        list = list.sort((a, b) => {
          const da = new Date(a.createdAt || "").getTime();
          const db = new Date(b.createdAt || "").getTime();
          return db - da;
        });

        homeLog("[Index] NewArrivals: list after sort", {
          len: list.length,
          firstCreatedAt: list[0]?.createdAt,
        });
        if (!ignore) setNewArrivals(list.slice(0, limit));
      } catch (e: any) {
        homeError("[Index] NewArrivals: error", e);
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

        const catsUrl = "/api/categories";
        homeLog("[Index] Categories: request", { url: catsUrl });
        const { ok, status, json } = await api(catsUrl);
        homeLog("[Index] Categories: response", {
          url: catsUrl,
          ok,
          status,
          dataType: Array.isArray(json?.data) ? "array" : typeof json?.data,
          dataLen: Array.isArray(json?.data) ? json.data.length : undefined,
          message: json?.message || json?.error,
        });
        if (!ok)
          throw new Error(
            json?.message || json?.error || "Failed to load categories"
          );

        const list = Array.isArray(json?.data)
          ? (json.data as CategoryRow[])
          : [];

        const subcategories = list.filter(cat => cat.parent !== null);
        if (HOME_DEBUG) {
          const parentNull = list.filter((c) => c.parent === null).length;
          const parentNotNull = subcategories.length;
          homeLog("[Index] Categories: parent stats", {
            total: list.length,
            parentNull,
            parentNotNull,
          });
          if (parentNotNull === 0 && list.length > 0) {
            homeWarn(
              "[Index] Categories: 0 subcategories found (parent !== null). The carousel will be empty with current logic.",
              { total: list.length, parentNull }
            );
          }
        }
        if (!ignore) setCats(subcategories);

        setMixedLoading(true);
        setMixedError(null);

        const catIds = subcategories.map((cat) => cat.slug || cat.name || "");
        homeLog("[Index] Categories: catIds for product lookup", {
          len: catIds.length,
          sample: catIds.slice(0, 5),
        });
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
          } else if (HOME_DEBUG) {
            homeWarn("[Index] Category product lookup failed", {
              catId: catIds[index],
              status: res.status,
              message: res.json?.message || res.json?.error,
            });
          }
        });
        homeLog("[Index] Categories: categoryProducts map size", {
          size: catMap.size,
        });

        const preUrl = "/api/products?limit=200";
        homeLog("[Index] Mixed: preload request", { url: preUrl });
        const pre = await api(preUrl);
        homeLog("[Index] Mixed: preload response", {
          url: preUrl,
          ok: pre.ok,
          status: pre.status,
          dataType: Array.isArray(pre.json?.data) ? "array" : typeof pre.json?.data,
          dataLen: Array.isArray(pre.json?.data) ? pre.json.data.length : undefined,
          message: pre.json?.message || pre.json?.error,
        });
        if (!pre.ok)
          throw new Error(
            pre.json?.message || pre.json?.error || "Failed to load products"
          );

        const productsAll = Array.isArray(pre.json?.data)
          ? (pre.json.data as ProductRow[])
          : [];
        if (!Array.isArray(pre.json?.data)) {
          homeWarn("[Index] Mixed: pre.json.data is not an array", {
            url: preUrl,
            json: pre.json,
          });
        }

        const catNames = new Set<string>(catIds);
        const filtered = productsAll.filter(
          (p) => p.category && catNames.has(String(p.category))
        );
        const enriched = filtered.length ? filtered : productsAll;
        homeLog("[Index] Mixed: filter stats", {
          all: productsAll.length,
          filtered: filtered.length,
          enriched: enriched.length,
          catIds: catIds.length,
        });

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
        homeError("[Index] Categories/Mixed: error", e);
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
    // Calculate rating from actual reviews
    let rating = "0.0";
    if (p.reviews && p.reviews.length > 0) {
      const totalRating = p.reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
      rating = (totalRating / p.reviews.length).toFixed(1);
    }

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
      <RunningText />

      {/* Ticker line – header ke niche */}

      {/* Product Slider Section */}
      <ProductSlider className="pt-24" />
    

      {/* Featured Products */}
      <section className="bg-[#f5f2ee] py-8 sm:py-16 lg:py-12">
  <div className="container mx-auto px-4 sm:px-6">
    {/* Header */}
    <div className="flex items-center mb-12 sm:mb-20 justify-center">
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
            <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
            <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
          </div>
          
          {/* Navigation Buttons - Mobile */}
          <div className="flex sm:hidden justify-center gap-2 mt-6">
            <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
            <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
          </div>
        </Carousel>
      </div>
    )}
  </div>
</section>

      {/* Categories grid with product showcase */}
        <section className="mx-auto px-2 sm:px-4 pb-6 sm:pb-12 pt-6 sm:pt-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            Shop By Categories
          </h2>
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
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
            {topCats.slice(0, 8).map((c) => {
              const catId = c.slug || c.name || "";
              const prod = categoryProducts.get(catId);
              const to = `/collection/${c.slug || slugify(c.name || "")}`;

              return (
                <Link
                  key={String(c._id || c.id || c.slug || c.name)}
                  to={to}
                  className="flex flex-col items-center justify-center space-y-1.5 sm:space-y-2 group"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-xl bg-primary-foreground flex items-center justify-center shadow-md transition-all duration-300 hover:scale-105 group-hover:shadow-lg">
                    <img
                      src={resolveImage(c.imageUrl || "/placeholder.svg")}
                      alt={c.name}
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-center line-clamp-2">
                    {c.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

   {/* Banner Section */}
  {/* Banner Section */}

      

      {/* New Arrivals */}
      <section className="container mx-auto px-4 py-12 md:py-12 bg-background rounded-xl shadow-sm">
        <div className="text-center mb-8 md:mb-8">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
            New Arrivals
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
                <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
                <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
              </div>
              
              {/* Navigation Buttons - Mobile */}
              <div className="flex sm:hidden justify-center gap-2 mt-6">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
                <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full border-2 border-gray-300 hover:border-[#ba8c5c] hover:bg-white transition-all duration-200 shadow-md hover:shadow-lg" />
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

      {/* Best Seller Section */}
      <BestSellerSection />

  
      {/* From these categories */}
      <InfluencerSection />
      <InfluencerImageGrid />

      <AboutUsSection />

      <FeatureSection />

      {/* <RecentReviewsSection /> */}

      <Footer />
      <PWAInstallPrompt />
      <WhatsAppButton phoneNumber="+91 7355818140" />
    </div>
  );
};

export default Index;
