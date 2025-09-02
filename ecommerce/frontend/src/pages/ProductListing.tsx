import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { ProductCard } from '@/components/product/ProductCard';
import { products as sampleProducts, categories } from '@/data/sampleData';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const ProductListing: React.FC = () => {
  const { category } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [previousCategory, setPreviousCategory] = useState<string | undefined>(category);

  // Load products from API
  useEffect(() => {
    loadProducts();
  }, [category, searchQuery]); // Reload when category or search changes

  // Reset filters when category changes
  useEffect(() => {
    if (category !== previousCategory) {
      // Reset all filters when navigating to a new category
      setPriceRange([0, 2000]);
      setSelectedBrands([]);
      setSelectedRatings([]);
      setInStockOnly(false);
      setPreviousCategory(category);
    }
  }, [category, previousCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (category) {
        params.append('category__slug', category);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const queryString = params.toString();
      const response = await api.products.list(queryString);
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
          brand: product.brand.name,
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
        setProducts(transformedProducts);
        // Calculate unique brands from API products
        const brands = Array.from(new Set(transformedProducts.map(product => product.brand))).sort() as string[];
        setAllBrands(brands);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Set empty products array instead of fallback to sample data
      setProducts([]);
      setAllBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Get current category info
  const currentCategory = categories.find(cat => cat.id === category);
  
  // Filter products based on current filters
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (category) {
      filtered = filtered.filter(product => product.category === category);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.brand.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Filter by price range
    filtered = filtered.filter(product =>
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }

    // Filter by ratings
    if (selectedRatings.length > 0) {
      filtered = filtered.filter(product =>
        selectedRatings.some(rating => product.rating >= rating)
      );
    }

    // Filter by stock
    if (inStockOnly) {
      filtered = filtered.filter(product => product.inStock);
    }

    return filtered;
  }, [category, searchQuery, priceRange, selectedBrands, selectedRatings, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest':
        return sorted.sort((a, b) => (b.isNewArrival ? 1 : 0) - (a.isNewArrival ? 1 : 0));
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default: // featured
        return sorted.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    }
  }, [filteredProducts, sortBy]);

  // Get unique brands from API products (set in useEffect)
  const [allBrands, setAllBrands] = useState<string[]>([]);

  const handleBrandChange = (brand: string, checked: boolean) => {
    if (checked) {
      setSelectedBrands([...selectedBrands, brand]);
    } else {
      setSelectedBrands(selectedBrands.filter(b => b !== brand));
    }
  };

  const handleRatingChange = (rating: number, checked: boolean) => {
    if (checked) {
      setSelectedRatings([...selectedRatings, rating]);
    } else {
      setSelectedRatings(selectedRatings.filter(r => r !== rating));
    }
  };

  const clearFilters = () => {
    setPriceRange([0, 2000]);
    setSelectedBrands([]);
    setSelectedRatings([]);
    setInStockOnly(false);
  };

  const getPageTitle = () => {
    if (searchQuery) {
      return `Search results for "${searchQuery}"`;
    }
    if (currentCategory) {
      return currentCategory.name;
    }
    return 'All Products';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">{getPageTitle()}</h1>
          <p className="text-muted-foreground">
            {sortedProducts.length} products found
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full"
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>

              {/* Filters */}
              <div className={cn(
                'space-y-6',
                showFilters ? 'block' : 'hidden lg:block'
              )}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <h4 className="font-medium">Price Range</h4>
                  <div className="px-2">
                    <Slider
                      value={priceRange}
                      onValueChange={setPriceRange}
                      max={2000}
                      min={0}
                      step={50}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground mt-2">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-3">
                  <h4 className="font-medium">Brands</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {allBrands.map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={(checked) => handleBrandChange(brand, checked as boolean)}
                        />
                        <label htmlFor={brand} className="text-sm">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div className="space-y-3">
                  <h4 className="font-medium">Rating</h4>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <Checkbox
                          id={`rating-${rating}`}
                          checked={selectedRatings.includes(rating)}
                          onCheckedChange={(checked) => handleRatingChange(rating, checked as boolean)}
                        />
                        <label htmlFor={`rating-${rating}`} className="text-sm">
                          {rating}+ Stars
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-3">
                  <h4 className="font-medium">Availability</h4>
                  <div className="flex items-center space-x-2">
                        <Checkbox
                          id="in-stock"
                          checked={inStockOnly}
                          onCheckedChange={(checked) => setInStockOnly(checked as boolean)}
                    />
                    <label htmlFor="in-stock" className="text-sm">
                      In Stock Only
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {sortedProducts.length} results
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Customer Rating</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="name">Name</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode */}
                <div className="hidden md:flex items-center border border-border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {sortedProducts.length > 0 ? (
              <div className={cn(
                'grid gap-6',
                viewMode === 'grid' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                  : 'grid-cols-1'
              )}>
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    className={viewMode === 'list' ? 'md:flex md:h-48' : ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;