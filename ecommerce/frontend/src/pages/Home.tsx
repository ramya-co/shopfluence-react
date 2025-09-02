import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProductCard } from '@/components/product/ProductCard';
import { categories, heroSlides, deals } from '@/data/sampleData';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const Home: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Countdown timer for deals
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
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

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

      {/* Deals Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Today's Deals</h2>
            <p className="text-muted-foreground text-lg">
              Limited time offers you don't want to miss
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="relative bg-card rounded-lg overflow-hidden border border-border group hover:shadow-hover transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={deal.image}
                      alt={deal.title}
                      className="w-full h-48 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="md:w-1/2 p-6 flex flex-col justify-center">
                    <div className="mb-4">
                      <Badge className="bg-discount text-white mb-2">
                        {deal.discount}
                      </Badge>
                      <h3 className="text-2xl font-bold mb-2">{deal.title}</h3>
                      <p className="text-muted-foreground">{deal.subtitle}</p>
                    </div>
                    
                    {timeLeft[deal.id] > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                          <Clock className="w-4 h-4" />
                          <span>Ends in:</span>
                        </div>
                        <div className="text-2xl font-mono font-bold text-discount">
                          {formatTimeLeft(timeLeft[deal.id])}
                        </div>
                      </div>
                    )}
                    
                    <Button className="bg-primary hover:bg-primary-hover">
                      Shop Now
                    </Button>
                  </div>
                </div>
              </div>
            ))}
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
      <section className="py-16 bg-amazon-dark-blue text-white">
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