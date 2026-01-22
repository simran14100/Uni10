import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, Heart, Search, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RunningText } from "@/components/RunningText";

interface NavbarProps {
  cartItemCount?: number;
}

export const Navbar = ({ cartItemCount = 0 }: NavbarProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
 
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // safe cart context
  const cart = (() => {
    try {
      return useCart();
    } catch {
      return null as any;
    }
  })();

  const liveCount = cart ? cart.count : cartItemCount;

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black text-white border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2"
            aria-label="UNI10 Home"
          >
            <img
              src="/uni10-logo.png"
              alt="UNI10"
              className="h-11 md:h-12 lg:h-[52px] w-auto select-none"
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Desktop Navigation and Search */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-4xl mx-4">
            <div className="flex items-center gap-1">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
                { to: "/shop?gender=male", label: "Men" },
                { to: "/shop?gender=female", label: "Women" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-sm font-semibold px-3 py-2 rounded-full text-white/90 hover:bg-white/10 transition relative ${
                    item.isNew ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 hover:from-orange-500/30 hover:to-pink-500/30' : ''
                  }`}
                >
                  {item.isNew && (
                    <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-400 animate-pulse" />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>
            
            {/* Search Bar - Desktop - Increased Size */}
            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-12 h-11 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/50 focus-visible:bg-white/15 focus-visible:ring-2"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-2">
            {user ? (
              <>
                {/* Wishlist: mobile pe hidden, desktop pe same jaisa */}
                <Link to="/wishlist">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden md:inline-flex text-white/90 hover:bg-white/10"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>

                {/* Support: pehle se hi sirf md+ pe dikh raha tha */}
                <Link to="/account/support" className="hidden md:block">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-white/90 hover:bg-white/10"
                  >
                    Support
                  </Button>
                </Link>

                {/* Dashboard / User Profile */}
                <Link to="/dashboard">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white/90 hover:bg-white/10"
                  >
                    <User className="h-5 w-5" />
                  </Button>
                </Link>

 
              </>
            ) : (
              <Link to="/auth">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white/90 hover:bg-white/10"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            {/* Cart (same desktop + mobile) */}
            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-white/90 hover:bg-white/10"
              >
                <ShoppingCart className="h-5 w-5" />
                {liveCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                    {liveCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle (only mobile) */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white/90 hover:bg-white/10"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu (sirf md:hidden, desktop untouched) */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 bg-gray-900">
            {/* Mobile Search Bar - Increased Size */}
            <form onSubmit={handleSearch} className="px-2 mb-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-12 pr-12 h-12 text-base bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus-visible:ring-white/50 focus-visible:bg-white/15 focus-visible:ring-2"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-9 w-9 text-gray-400 hover:text-white"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </form>
            
            <div className="flex flex-col gap-1">
              {[
                { to: "/", label: "Home" },
                { to: "/shop", label: "Shop" },
                { to: "/shop/new-arrivals", label: "New Arrivals", isNew: true },
                { to: "/shop?gender=male", label: "Men" },
                { to: "/shop?gender=female", label: "Women" },
                { to: "/wishlist", label: "Wishlist" },
                { to: "/contact", label: "Contact" },
                ...(user
                  ? [{ to: "/account/support", label: "Support Tickets" }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`text-base font-semibold px-3 py-3 rounded-md text-white/90 hover:bg-white/10 transition-colors relative ${
                    item.isNew ? 'bg-gradient-to-r from-orange-500/20 to-pink-500/20 hover:from-orange-500/30 hover:to-pink-500/30' : ''
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.isNew && (
                    <Sparkles className="absolute top-2 right-2 h-3 w-3 text-yellow-400 animate-pulse" />
                  )}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
    <RunningText />
    </>
  );
};
