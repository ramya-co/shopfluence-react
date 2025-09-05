import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X, ChevronDown } from 'lucide-react';
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
    <>
      <header className="sticky top-0 z-50">
        {/* Top promotional banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 text-white py-3 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center text-center">
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1">
                  🚚 <span className="hidden sm:inline">Free shipping on orders over</span> $35
                </span>
                <span className="hidden md:block text-blue-200">•</span>
                <span className="flex items-center gap-1">
                  🏷️ <span className="hidden sm:inline">Summer Sale:</span> Up to 50% off
                </span>
                <span>🎫 Code: EXPIRED2025 | Valid until June 2025</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coupon banners */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 text-white py-3.5 border-y border-blue-600/20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 text-sm">
              
              <div className="flex items-center gap-2">
                <span className="font-normal">💰 Spend $100, get $10 off</span><span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1">
                🎫 Code: DISCOUNT10 | Valid until Dec 2025
              </span>
              </div>
            </div>
            
          </div>
        </div>

        {/* Main header */}
        <div className="bg-white shadow-lg border-b border-gray-100 backdrop-blur-md bg-white/95">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-medium text-xl">S</span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-2xl font-medium bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                    ShopHub
                  </span>
                  <div className="text-xs text-gray-500 -mt-1">Your Shopping Paradise</div>
                </div>
              </Link>

              {/* Search Bar - Desktop */}
              <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8">
                <div className="relative flex w-full group">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search for products, brands, and more..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 h-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 focus:ring-4 bg-gray-50 focus:bg-white transition-all duration-200 text-gray-700 placeholder:text-gray-400"
                  />
                  <Button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-purple-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    size="sm"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Actions */}
              <div className="flex items-center gap-1">
                {/* User Account - Desktop */}
                <div className="hidden lg:block">
                  {authState.isAuthenticated ? (
                    <div className="relative group">
                      <Button 
                        variant="ghost" 
                        className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-gray-100 rounded-xl transition-all duration-200"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-left hidden xl:block">
                          <div className="text-sm font-medium text-gray-700">
                            Hello, {authState.user?.first_name}
                          </div>
                          <div className="text-xs text-gray-500 -mt-0.5">Account & Lists</div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </Button>
                      
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
                        <div className="p-2">
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="font-medium text-gray-900">{authState.user?.first_name} {authState.user?.last_name}</div>
                            <div className="text-sm text-gray-500">{authState.user?.email}</div>
                          </div>
                          <div className="py-2 space-y-1">
                            {[
                              { to: '/profile', label: 'My Profile', icon: '👤' },
                              { to: '/orders', label: 'My Orders', icon: '📦' },
                              { to: '/wishlist', label: 'Wishlist', icon: '❤️' },
                            ].map((item) => (
                              <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                <span>{item.icon}</span>
                                {item.label}
                              </Link>
                            ))}
                            <hr className="my-2" />
                            <button
                              onClick={logout}
                              className="flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                            >
                              <span>🚪</span>
                              Sign Out
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Link to="/login">
                      <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg hover:shadow-xl transition-all duration-200">
                        <User className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                  )}
                </div>

                {/* Wishlist - Desktop */}
                <Link to="/wishlist" className="hidden md:block">
                  <Button 
                    variant="ghost" 
                    className="relative w-10 h-10 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <Heart className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors" />
                  </Button>
                </Link>

                {/* Cart */}
                <Link to="/cart" className="relative">
                  <Button 
                    variant="ghost" 
                    className="relative w-10 h-10 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                  >
                    <ShoppingCart className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                    {cartState.totalItems > 0 && (
                      <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white min-w-[1.25rem] h-5 flex items-center justify-center text-xs font-bold border-2 border-white shadow-lg animate-pulse">
                        {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>

                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  className="md:hidden w-10 h-10 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="md:hidden mt-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 rounded-xl border-2 border-gray-200 focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </form>
          </div>
        </div>

        {/* Categories Navigation */}
        <div className="hidden md:block bg-gray-50 border-b border-gray-200 py-3">
          <div className="container mx-auto px-4">
            <nav>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-8">
                  <span className="text-sm font-semibold text-gray-700">Browse Categories</span>
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 relative group"
                    >
                      {category.name}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-2 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-full"
                >
                  🏆 Leaderboard
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* User Section */}
              {authState.isAuthenticated ? (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {authState.user?.first_name} {authState.user?.last_name}
                      </div>
                      <div className="text-sm text-gray-600">{authState.user?.email}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { to: '/profile', label: 'My Profile', icon: '👤' },
                      { to: '/orders', label: 'My Orders', icon: '📦' },
                      { to: '/wishlist', label: 'Wishlist', icon: '❤️' },
                    ].map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className="flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <span>{item.icon}</span>
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 p-2 text-sm text-red-600 hover:bg-white/50 rounded-lg transition-colors w-full text-left"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="w-5 h-5" />
                    Sign In
                  </Link>
                </div>
              )}

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={category.href}
                      className="block p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Leaderboard */}
              <div className="pt-4 border-t border-gray-200">
                <Link
                  to="/leaderboard"
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 text-orange-600 font-medium rounded-xl hover:shadow-md transition-all"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>🏆</span>
                  Leaderboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;