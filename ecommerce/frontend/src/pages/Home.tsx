import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { categories, heroSlides, deals } from '@/data/sampleData';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

// Timer Bug tracking keys
const NEGATIVE_TIMER_BUG_KEY = 'negative_timer_bug_discovered';
const INCREMENTING_TIMER_BUG_KEY = 'incrementing_timer_bug_discovered';

// Helper function to get user-specific storage key  
const getUserSpecificTimerKey = (baseKey: string): string => {
  const accessToken = localStorage.getItem('access_token');
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const userId = payload.user_id || payload.sub || 'anonymous';
      return `${baseKey}_${userId}`;
    } catch (e) {
      // Token decode failed, use fallback
    }
  }
  return `${baseKey}_anonymous`;
};

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Enhanced Today's Deals state
  const [dealsTimers, setDealsTimers] = useState<{ [key: string]: number }>({});
  const [incrementingTimer, setIncrementingTimer] = useState(0);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.products.list();
      if (response.ok) {
        const data = await response.json();
        // Transform API products to match frontend interface
        const transformedProducts = data.results.map((product: any) => ({
          id: product.id.toString(),
          slug: product.slug,
          name: product.name,
          price: parseFloat(product.price),
          originalPrice: product.original_price ? parseFloat(product.original_price) : undefined,
          rating: product.average_rating || 0,
          reviewCount: product.review_count || 0,
          category: product.category.slug,
          brand: typeof product.brand === 'object' ? product.brand.name : product.brand,
          image: product.image || 'https://via.placeholder.com/400x400',
          images: [product.image || 'https://via.placeholder.com/400x400'],
          description: product.short_description || '',
          specifications: {},
          inStock: product.is_in_stock,
          stockCount: 10, // API doesn't provide this, using default
          discount: product.discount_percentage,
          isNewArrival: product.is_new_arrival,
          isBestseller: product.is_bestseller,
        }));
        
        // Filter products for different sections
        setFeaturedProducts(transformedProducts.filter((p: any) => p.isBestseller).slice(0, 8));
        setNewArrivals(transformedProducts.filter((p: any) => p.isNewArrival).slice(0, 6));
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setFeaturedProducts([]);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  // Hero carousel auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Enhanced Today's Deals with bug timers
  useEffect(() => {
    // Initialize timers for enhanced deals
    const now = Date.now();
    const initialTimers: { [key: string]: number } = {
      'deal-1': now + (24 * 60 * 60 * 1000), // 24 hours
      'deal-2': now + (12 * 60 * 60 * 1000), // 12 hours  
      'deal-3': now + (6 * 60 * 60 * 1000),  // 6 hours
      'deal-4': now + (2 * 60 + 2) * 1000,   // 🚨 BUG: 2 min 2 sec for testing negative timer
      'deal-5': now + (18 * 60 * 60 * 1000), // 18 hours
      'deal-6': now + (8 * 60 * 60 * 1000),  // 8 hours
      'deal-7': now + (4 * 60 * 60 * 1000),  // 4 hours
      'deal-8': now + (10 * 60 * 60 * 1000), // 10 hours
    };
    setDealsTimers(initialTimers);

    const timer = setInterval(() => {
      const currentTime = Date.now();
      
      setDealsTimers(prev => {
        const updated: { [key: string]: number } = {};
        Object.keys(prev).forEach(key => {
          if (key === 'deal-4') {
            // Negative timer bug - continues past 0
            updated[key] = prev[key] - 1000;
          } else {
            // Normal countdown 
            updated[key] = Math.max(0, prev[key] - 1000);
          }
        });
        return updated;
      });

      // Incrementing timer bug for deal-incremental
      setIncrementingTimer(prev => prev + 1000);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Countdown timer for original deals (keeping existing functionality)
  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft: { [key: string]: number } = {};
      deals.forEach((deal) => {
        const now = new Date().getTime();
        const endTime = deal.endTime.getTime();
        const difference = endTime - now;
        newTimeLeft[deal.id] = Math.max(0, difference);
      });
      setTimeLeft(newTimeLeft);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimeLeft = (milliseconds: number) => {
    const hours = Math.floor(Math.abs(milliseconds) / (1000 * 60 * 60));
    const minutes = Math.floor((Math.abs(milliseconds) % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((Math.abs(milliseconds) % (1000 * 60)) / 1000);
    const sign = milliseconds < 0 ? '-' : '';
    return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle negative timer bug detection
  const handleNegativeTimerBug = async () => {
    const userBugKey = getUserSpecificTimerKey(NEGATIVE_TIMER_BUG_KEY);
    const hasBugBeenDiscovered = localStorage.getItem(userBugKey) === 'true';
    
    if (!hasBugBeenDiscovered) {
      localStorage.setItem(userBugKey, 'true');
      
      const bugData = {
        bug_found: 'NEGATIVE_TIMER_BUG',
        message: '🎉 Business Logic Bug – Negative Timer Detected!',
        description: 'Timer continued running into negative values instead of stopping at zero',
        points: 70,
        vulnerability_type: 'Business Logic Bug',
        severity: 'Medium',
        timer_value: dealsTimers['deal-4']
      };

      if (typeof window !== 'undefined') {
        import('@/lib/notifications').then(notifications => {
          notifications.showBugNotification(bugData);
          notifications.notifyLeaderboard(bugData);
        }).catch(console.error);
      }
    }
  };

  // Handle incrementing timer bug detection
  const handleIncrementingTimerBug = async () => {
    const userBugKey = getUserSpecificTimerKey(INCREMENTING_TIMER_BUG_KEY);
    const hasBugBeenDiscovered = localStorage.getItem(userBugKey) === 'true';
    
    if (!hasBugBeenDiscovered) {
      localStorage.setItem(userBugKey, 'true');
      
      const bugData = {
        bug_found: 'INCREMENTING_TIMER_BUG',
        message: '🎉 Business Logic Bug – Timer Increasing Instead of Decreasing!',
        description: 'Timer is counting up instead of counting down to zero',
        points: 70,
        vulnerability_type: 'Business Logic Bug',
        severity: 'Medium',
        timer_value: incrementingTimer
      };

      if (typeof window !== 'undefined') {
        import('@/lib/notifications').then(notifications => {
          notifications.showBugNotification(bugData);
          notifications.notifyLeaderboard(bugData);
        }).catch(console.error);
      }
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  // Enhanced Today's Deals data (8 cards)
  const enhancedDeals = [
    {
      id: 'deal-1',
      title: 'iPhone 15 Pro',
      subtitle: 'Latest Apple smartphone with Pro cameras',
      image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=300&fit=crop',
      discount: 'Up to 15% OFF',
      category: 'Electronics'
    },
    {
      id: 'deal-2', 
      title: 'Nike Air Max',
      subtitle: 'Premium running shoes for athletes',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop',
      discount: 'Save Big',
      category: 'Fashion'
    },
    {
      id: 'deal-3',
      title: 'MacBook Pro',
      subtitle: 'M3 chip with incredible performance',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
      discount: 'Up to 10% OFF',
      category: 'Electronics'
    },
    {
      id: 'deal-4', // 🚨 NEGATIVE TIMER BUG CARD
      title: 'Testing Timer',
      subtitle: 'Special deal for testing purposes',
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop',
      discount: 'Test Deal',
      category: 'Testing',
      isBugCard: true,
      bugType: 'negative'
    },
    {
      id: 'deal-5',
      title: 'Samsung 4K TV',
      subtitle: 'Crystal clear display technology',
      image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
      discount: 'Up to 25% OFF',
      category: 'Electronics'
    },
    {
      id: 'deal-6',
      title: 'Canon DSLR',
      subtitle: 'Professional photography camera',
      image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop',
      discount: 'Up to 20% OFF',
      category: 'Electronics'
    },
    {
      id: 'deal-7',
      title: 'Designer Sofa',
      subtitle: 'Luxury furniture for your home',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
      discount: 'Up to 30% OFF',
      category: 'Home'
    },
    {
      id: 'deal-incremental', // 🚨 INCREMENTING TIMER BUG CARD
      title: 'Gaming Laptop',
      subtitle: 'High-performance gaming machine',
      image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=300&fit=crop',
      discount: 'Special Offer',
      category: 'Electronics',
      isBugCard: true,
      bugType: 'incrementing'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <div className="relative w-full h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 transition-transform duration-500 ease-in-out',
                index === currentSlide ? 'translate-x-0' : 
                index < currentSlide ? '-translate-x-full' : 'translate-x-full'
              )}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8">
                    {slide.subtitle}
                  </p>
                  <Button asChild size="lg" className="bg-primary hover:bg-primary-hover">
                    <Link to={slide.link}>
                      {slide.cta}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              )}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground text-lg">
              Discover our wide range of products across different categories
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.id}`}
                className="group text-center"
              >
                <div className="relative overflow-hidden rounded-lg aspect-square mb-3 bg-muted">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                </div>
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Today's Deals Section - 8 Cards with Timer Bugs */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Today's Deals</h2>
            <p className="text-muted-foreground text-lg">
              Limited time offers you don't want to miss
            </p>
          </div>
          
          {/* 8 Product Cards Grid - 4 per row × 2 rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {enhancedDeals.map((deal) => {
              const getTimerValue = () => {
                if (deal.id === 'deal-incremental') {
                  return incrementingTimer;
                } else if (deal.id === 'deal-4') {
                  return dealsTimers[deal.id] || 0;
                } else {
                  return Math.max(0, dealsTimers[deal.id] || 0);
                }
              };

              const timerValue = getTimerValue();
              const isNegative = deal.id === 'deal-4' && timerValue < 0;

              return (
                <div
                  key={deal.id}
                  className="bg-card rounded-lg overflow-hidden border border-border group hover:shadow-hover transition-shadow"
                >
                  <div className="relative">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3 bg-discount text-white">
                      {deal.discount}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-1">{deal.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3">{deal.subtitle}</p>
                    
                    {/* Timer Display */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3 h-3" />
                        <span>
                          {deal.id === 'deal-incremental' 
                            ? 'Time Running:' 
                            : isNegative 
                              ? 'Time Exceeded:' 
                              : 'Ends in:'
                          }
                        </span>
                      </div>
                      <div className={`text-lg font-mono font-bold ${
                        isNegative 
                          ? 'text-red-600' 
                          : deal.id === 'deal-incremental' 
                            ? 'text-blue-600' 
                            : 'text-discount'
                      }`}>
                        {formatTimeLeft(timerValue)}
                      </div>
                    </div>
                    
                    {/* Shop Now Button */}
                    <Button 
                      className="w-full bg-primary hover:bg-primary-hover"
                      onClick={() => {
                        if (deal.isBugCard) {
                          if (deal.bugType === 'negative' && isNegative) {
                            handleNegativeTimerBug();
                          } else if (deal.bugType === 'incrementing') {
                            handleIncrementingTimerBug();
                          }
                        }
                        // Normal shop functionality would go here
                      }}
                    >
                      Shop Now
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Featured Products</h2>
              <p className="text-muted-foreground">
                Our most popular items this month
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">New Arrivals</h2>
              <p className="text-muted-foreground">
                Latest products just added to our collection
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/products?filter=new">
                View All
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
                  <div className="w-full h-48 bg-muted"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay in the Loop</h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe to our newsletter for exclusive deals and new product updates
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-md text-foreground"
            />
            <Button className="bg-primary hover:bg-primary-hover px-6">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;