import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Header: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { state: cartState } = useCart();
  const { state: authState, logout } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const categories = [
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Home & Garden', href: '/category/home' },
    { name: 'Books', href: '/category/books' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Beauty', href: '/category/beauty' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border">
      {/* Top banner */}
      <div className="bg-amazon-dark-blue text-white py-2">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm">
            <span className="font-medium">Offer 1:</span> Free shipping on orders over $35 | <span className="font-medium">Summer Sale:</span> Up to 50% off
          </p>
        </div>
      </div>

      {/* Coupon banners */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-medium">🎫 Coupon: Code: EXPIRED2025 | Valid until June 2025</span>
            </div>
            <span className="hidden sm:block text-white/70">•</span>
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-medium">Offer 2:</span> Spend $100, get $10 off
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="font-medium text-sm">🎫 Coupon: Code: DISCOUNT10 | Valid until Dec 2025</span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-amazon-dark-blue text-white">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold text-white hover:text-primary transition-colors">
              ShopHub
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
              <div className="relative flex w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="rounded-r-none border-r-0 bg-white text-foreground"
                />
                <Button
                  type="submit"
                  className="rounded-l-none bg-primary hover:bg-primary-hover"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* User Account */}
              <div className="hidden md:block">
                {authState.isAuthenticated ? (
                  <div className="relative group">
                    <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                      <User className="w-5 h-5" />
                      <span className="ml-1 text-sm">
                        {authState.user?.first_name}
                      </span>
                    </Button>
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white text-foreground border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-2">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-accent"
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/orders"
                          className="block px-4 py-2 text-sm hover:bg-accent"
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block px-4 py-2 text-sm hover:bg-accent"
                        >
                          Wishlist
                        </Link>
                        <hr className="my-1" />
                        <button
                          onClick={logout}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-accent"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button variant="ghost" className="text-white hover:bg-white/10">
                      <User className="w-5 h-5 mr-1" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>

              {/* Wishlist */}
              <Link to="/wishlist" className="hidden md:block">
                <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <Heart className="w-5 h-5" />
                </Button>
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-white hover:bg-white/10 p-2">
                  <ShoppingCart className="w-5 h-5" />
                  {cartState.totalItems > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground min-w-[1.25rem] h-5 flex items-center justify-center text-xs">
                      {cartState.totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                className="md:hidden text-white hover:bg-white/10 p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="md:hidden mt-3">
            <div className="relative flex w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-r-none border-r-0 bg-white text-foreground"
              />
              <Button
                type="submit"
                className="rounded-l-none bg-primary hover:bg-primary-hover"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="hidden md:block bg-amazon-blue text-white">
        <div className="container mx-auto px-4">
          <nav className="py-2">
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium">Categories:</span>
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={category.href}
                  className="text-sm hover:text-primary transition-colors"
                >
                  {category.name}
                </Link>
              ))}
              <Link
                to="/leaderboard"
                className="text-sm hover:text-primary transition-colors font-medium border-l border-white/20 pl-6"
              >
                🏆 Leaderboard
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-border">
          <div className="px-4 py-4 space-y-4">
            {/* User Menu */}
            {authState.isAuthenticated ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <span className="font-medium">
                    {authState.user?.first_name} {authState.user?.last_name}
                  </span>
                </div>
                <div className="pl-7 space-y-1">
                  <Link
                    to="/profile"
                    className="block text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    className="block text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/wishlist"
                    className="block text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block text-sm text-muted-foreground hover:text-foreground"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}

            {/* Categories */}
            <div className="space-y-2">
              <span className="font-medium">Categories</span>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    className="block text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;