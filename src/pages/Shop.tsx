import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { SearchInput } from "@/components/SearchInput";
import { Pagination } from "@/components/Pagination";
import RecentReviewsSection from "@/components/RecentReviewsSection";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { ChevronDown, Filter, XCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

type ProductRow = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  price?: number;
  category?: string;
  gender?: string;
  colors?: string[];
  sizes?: string[];
  image_url?: string;
  images?: string[];
  slug?: string;
  createdAt?: string;
};

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
      const base = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
      return s.startsWith("/") ? `${base}${s}` : `${base}/${s}`;
    }
  }
  return s;
};

// ✅ Category normalizer – case, space, special chars, last "s" remove
const normalizeCategory = (value: string) => String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/s$/, ""); // last s hatao (tshirts -> tshirt, hoodies -> hoodie)

  function slugify(input: string) {
    return String(input || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

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

interface ShopPageProps {
  sortBy?: "newest" | "all";
  collectionSlug?: string;
}

const Shop = ({ sortBy = "all", collectionSlug }: ShopPageProps = {}) => {
  const location = useLocation();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedGender, setSelectedGender] = useState<string>("All");
  const [selectedColor, setSelectedColor] = useState<string>("All");
  const [selectedSize, setSelectedSize] = useState<string>("All");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]); // Example price range

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [productUpdateKey, setProductUpdateKey] = useState(0); // New state variable for triggering updates

  const [showAllColors, setShowAllColors] = useState(false);

  const staticColors = useMemo(() => [
    { name: "Multicolor", hex: "#808080" }, // Grey for multicolor
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Blue", hex: "#0000FF" },
    { name: "Grey", hex: "#808080" },
    { name: "Green", hex: "#008000" },
    { name: "Red", hex: "#FF0000" },
    { name: "Maroon", hex: "#800000" },
    { name: "Yellow", hex: "#FFFF00" },
    { name: "Dark Blue", hex: "#00008B" },
    { name: "Pink", hex: "#FFC0CB" },
    { name: "Navy Blue", hex: "#000080" },
    { name: "Beige", hex: "#F5F5DC" },
    { name: "Brown", hex: "#A52A2A" },
    { name: "Dark Green", hex: "#006400" },
    { name: "Light Blue", hex: "#ADD8E6" },
    { name: "Purple", hex: "#800080" },
    { name: "Light Green", hex: "#90EE90" },
    { name: "Orange", hex: "#FFA500" },
    { name: "Silver", hex: "#C0C0C0" },
    { name: "Gold", hex: "#FFD700" },
  ], []);

  const availableColors = useMemo(() => {
    const colors = new Set<string>(staticColors.map(c => c.name));
    products.forEach(p => p.colors?.forEach(c => colors.add(c)));
    return Array.from(colors).sort();
  }, [products, staticColors]);
  const availableSizes = useMemo(() => { // Dummy data for sizes
    const sizes = new Set<string>();
    products.forEach(p => p.sizes?.forEach(s => sizes.add(s)));
    return ["All", ...Array.from(sizes).sort()];
  }, [products]);

  // ✅ Detect mobile screen dynamically
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // ✅ URL se category read karo → chip auto-select ho
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const catFromUrl = params.get("category");
    if (catFromUrl) {
      setSelectedCategory(catFromUrl);
      setCurrentPage(1);
    } else {
      setSelectedCategory("All");
    }
  }, [location.search]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedGender("All");
    setSelectedColor("All");
    setSelectedSize("All");
    setPriceRange([0, 1000]);
    setCurrentPage(1);
  };

  // ✅ Products per page based on device
  const PRODUCTS_PER_PAGE = isMobile ? 8 : 16;

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, sortBy, collectionSlug, selectedCategory, selectedGender, selectedColor, selectedSize, priceRange, productUpdateKey]);

  // Add this new useEffect for custom event
  useEffect(() => {
    const handleProductCreated = () => {
      console.log('productCreated event received in Shop.tsx');
      setProductUpdateKey(prev => prev + 1);
    };

    window.addEventListener("productCreated", handleProductCreated);

    return () => {
      window.removeEventListener("productCreated", handleProductCreated);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const { ok, json } = await api("/api/categories");
        const list =
          ok && Array.isArray(json?.data)
            ? (json.data as Array<{ name?: string; slug?: string }>)
            : [];
        const names = list
          .map((c) => String(c.name || c.slug || "").trim())
          .filter(Boolean);
        if (!ignore) setApiCategories(names);
      } catch {
        if (!ignore) setApiCategories([]);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const fetchProducts = async () => {
    console.log('fetchProducts called in Shop.tsx');
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("q", searchQuery);
      if (collectionSlug) params.append("category", collectionSlug);
      if (selectedCategory !== "All") params.append("category", selectedCategory);
      if (selectedGender !== "All") params.append("gender", selectedGender.toLowerCase());
      if (selectedColor !== "All") params.append("colors", selectedColor);
      if (selectedSize !== "All") params.append("sizes", selectedSize);
      params.append("minPrice", String(priceRange[0]));
      params.append("maxPrice", String(priceRange[1]));
      params.append("active", "all");


      const query = params.toString();
      const url = query ? `/api/products?${query}` : "/api/products";
      const { ok, json } = await api(url);
      if (!ok) throw new Error(json?.message || json?.error || "Failed to load");

      let list = Array.isArray(json?.data)
        ? (json.data as ProductRow[])
        : [];
      console.log('Products fetched by Shop.tsx:', list);

      if (sortBy === "newest") {
        list = list.sort((a, b) => {
          const dateA = new Date(a.createdAt || "").getTime();
          const dateB = new Date(b.createdAt || "").getTime();
          return dateB - dateA;
        });
      }

      setProducts(list);
      setCurrentPage(1);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const cats = new Set<string>(["All"]);
    products.forEach((p) => {
      if (p.category) cats.add(String(p.category));
    });
    apiCategories.forEach((n) => {
      if (n) cats.add(String(n));
    });
    return Array.from(cats);
  }, [products, apiCategories]);

  const filteredProducts = useMemo(() => {
    const normalizedSelectedCategory = normalizeCategory(selectedCategory);
    let result = products;

    if (normalizedSelectedCategory !== "all") {
      result = result.filter(
        (p) => normalizeCategory(p.category || "") === normalizedSelectedCategory
      );
    }

    if (selectedGender !== "All") {
      result = result.filter(
        (p) => String(p.gender || "").toLowerCase() === selectedGender.toLowerCase()
      );
    }

    if (selectedColor !== "All") {
      result = result.filter(
        (p) => p.colors?.some(c => c.toLowerCase() === selectedColor.toLowerCase())
      );
    }

    if (selectedSize !== "All") {
      result = result.filter(
        (p) => p.sizes?.some(s => s.toLowerCase() === selectedSize.toLowerCase())
      );
    }

    result = result.filter(
      (p) => (p.price || 0) >= priceRange[0] && (p.price || 0) <= priceRange[1]
    );

    return result;
  }, [products, selectedCategory, selectedGender, selectedColor, selectedSize, priceRange]);

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIdx = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIdx,
    startIdx + PRODUCTS_PER_PAGE
  );

  const pageTitle = sortBy === "newest" ? "New Arrivals" : "Shop All";
  const pageSubtitle =
    sortBy === "newest"
      ? "Discover our latest additions"
      : "Browse our complete collection";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-3 sm:px-4 pt-24 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter mb-3">
            {pageTitle.split(" ")[0]}{" "}
            <span className="text-primary">
              {pageTitle.split(" ").slice(1).join(" ")}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {pageSubtitle}
          </p>
        </div>

        <div className="flex items-center justify-between mb-8">
          {/* Clear Filters Button (Desktop) */}
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="hidden lg:flex items-center shrink-0"
          >
            <XCircle className="w-4 h-4 mr-2" /> Clear Filters
          </Button>

          {/* Search Input (Desktop and Mobile) */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search products…"
            className="flex-grow max-w-sm mx-auto"
          />

          {/* Mobile Filter Trigger */}
          <div className="lg:hidden ml-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80">
                <SheetHeader className="mb-6">
                  <SheetTitle>Filter Products</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-6">
                  {/* Clear Filters Button (Mobile) */}
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    className="w-full flex items-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" /> Clear Filters
                  </Button>

                  {/* Categories Filter */}
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                      Categories <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2 space-y-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "ghost"}
                          onClick={() => {
                            setSelectedCategory(category);
                            setCurrentPage(1);
                          }}
                          className="w-full justify-start"
                        >
                          {category}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Gender Filter */}
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                      Gender <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2 space-y-2">
                      {[ "All", "Male", "Female", "Unisex" ].map((gender) => (
                        <Button
                          key={gender}
                          variant={selectedGender === gender ? "default" : "ghost"}
                          onClick={() => {
                            setSelectedGender(gender);
                            setCurrentPage(1);
                          }}
                          className="w-full justify-start"
                        >
                          {gender}
                        </Button>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Color Filter */}
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                      Color <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2 space-y-2">
                      {(showAllColors ? availableColors : availableColors.slice(0, 10)).map((color) => {
                        const colorData = staticColors.find(c => c.name === color);
                        const displayColor = colorData ? colorData.hex : "#808080"; // Default to grey
                        return (
                          <div key={color} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`mobile-color-${color}`}
                              checked={selectedColor === color}
                              onChange={() => {
                                setSelectedColor(color);
                                setCurrentPage(1);
                              }}
                              className="appearance-none bg-white h-4 w-4 border border-gray-400 rounded-sm cursor-pointer checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            />
                            <label htmlFor={`mobile-color-${color}`} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                              <span
                                className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                                style={{ backgroundColor: displayColor }}
                              ></span>
                              {color}
                            </label>
                          </div>
                        );
                      })}
                      {availableColors.length > 10 && (
                        <Button variant="link" onClick={() => setShowAllColors(!showAllColors)} className="w-full justify-start">
                          {showAllColors ? "Show Less" : "Show More"}
                        </Button>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Size Filter */}
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                      Size <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedSize(size);
                        setCurrentPage(1);
                      }}
                      className="w-full justify-start"
                    >
                      {size}
                    </Button>
                  ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Price Filter */}
                  <Collapsible defaultOpen={true}>
                    <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                      Price <ChevronDown className="w-4 h-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-4 pb-2">
                      <Slider
                        min={0}
                        max={2000} // Assuming a max price for now
                        step={10}
                        value={priceRange}
                        onValueChange={(val: [number, number]) => setPriceRange(val)}
                        className="w-[90%] mx-auto"
                      />
                      <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                        <span>₹{priceRange[0]}</span>
                        <span>₹{priceRange[1]}</span>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-64 pr-8 shrink-0">
            <div className="flex flex-col space-y-6 sticky top-24">
              {/* Categories Filter */}
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Categories <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedCategory(category);
                        setCurrentPage(1);
                      }}
                      className="w-full justify-start"
                    >
                      {category}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Gender Filter */}
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Gender <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {[ "All", "Male", "Female", "Unisex" ].map((gender) => (
                    <Button
                      key={gender}
                      variant={selectedGender === gender ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedGender(gender);
                        setCurrentPage(1);
                      }}
                      className="w-full justify-start"
                    >
                      {gender}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Color Filter */}
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Color <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {(showAllColors ? availableColors : availableColors.slice(0, 10)).map((color) => {
                    const colorData = staticColors.find(c => c.name === color);
                    const displayColor = colorData ? colorData.hex : "#808080"; // Default to grey
                    return (
                      <div key={color} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`color-${color}`}
                          checked={selectedColor === color}
                          onChange={() => {
                            setSelectedColor(color);
                            setCurrentPage(1);
                          }}
                          className="appearance-none bg-white h-4 w-4 border border-gray-400 rounded-sm cursor-pointer checked:bg-blue-600 checked:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        />
                        <label htmlFor={`color-${color}`} className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          <span
                            className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                            style={{ backgroundColor: displayColor }}
                          ></span>
                          {color}
                        </label>
                      </div>
                    );
                  })}
                  {availableColors.length > 10 && (
                    <Button variant="link" onClick={() => setShowAllColors(!showAllColors)} className="w-full justify-start">
                      {showAllColors ? "Show Less" : "Show More"}
                    </Button>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Size Filter */}
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Size <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2 space-y-2">
                  {availableSizes.map((size) => (
                    <Button
                      key={size}
                      variant={selectedSize === size ? "default" : "ghost"}
                      onClick={() => {
                        setSelectedSize(size);
                        setCurrentPage(1);
                      }}
                      className="w-full justify-start"
                    >
                      {size}
                    </Button>
                  ))}
                </CollapsibleContent>
              </Collapsible>

              {/* Price Filter */}
              <Collapsible defaultOpen={true}>
                <CollapsibleTrigger className="flex justify-between items-center w-full py-2 text-lg font-semibold border-b">
                  Price <ChevronDown className="w-4 h-4" />
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 pb-2">
                  <Slider
                    min={0}
                    max={2000} // Assuming a max price for now
                    step={10}
                    value={priceRange}
                    onValueChange={(val: [number, number]) => setPriceRange(val)}
                    className="w-[90%] mx-auto"
                  />
                  <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                    <span>₹{priceRange[0]}</span>
                    <span>₹{priceRange[1]}</span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading products...
              </div>
            ) : paginatedProducts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No products found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {paginatedProducts.map((p) => {
                    const card = mapToCard(p);
                    return (
                      <ProductCard
                        key={card.id}
                        {...card}
                      />
                    );
                  })}
                </div>

                {/* ✅ Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(page) => {
                        window.scrollTo({ top: 0, behavior: "smooth" });
                        setCurrentPage(page);
                      }}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <RecentReviewsSection />

      <Footer />
    </div>
  );
};

export default Shop;