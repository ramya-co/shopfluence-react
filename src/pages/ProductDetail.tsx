import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingCart, Share2, Truck, Shield, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Rating } from '@/components/ui/Rating';
import { ProductCard } from '@/components/product/ProductCard';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  // Load product from API
  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (slug: string) => {
    try {
      setLoading(true);
      const response = await api.products.get(slug);
      if (response.ok) {
        const data = await response.json();
        // Transform API product to match frontend interface
        const transformedProduct = {
          id: data.id.toString(),
          name: data.name,
          price: parseFloat(data.price),
          originalPrice: data.original_price ? parseFloat(data.original_price) : undefined,
          rating: data.average_rating || 0,
          reviewCount: data.review_count || 0,
          category: data.category.slug,
          brand: typeof data.brand === 'object' ? data.brand.name : data.brand,
          image: data.image || 'https://via.placeholder.com/400x400',
          images: [data.image || 'https://via.placeholder.com/400x400'],
          description: data.description || data.short_description || '',
          specifications: {
            SKU: data.sku,
            Brand: typeof data.brand === 'object' ? data.brand.name : data.brand,
            Category: typeof data.category === 'object' ? data.category.name : data.category,
          },
          inStock: data.is_in_stock,
          stockCount: 10, // API doesn't provide this, using default
          discount: data.discount_percentage,
          isNewArrival: data.is_new_arrival,
          isBestseller: data.is_bestseller,
        };
        setProduct(transformedProduct);
        
        // Load related products
        loadRelatedProducts(data.category.slug, data.id);
      } else {
        setProduct(null);
      }
    } catch (error) {
      console.error('Error loading product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedProducts = async (categorySlug: string, currentProductId: number) => {
    try {
      const response = await api.products.list(`category__slug=${categorySlug}`);
      if (response.ok) {
        const data = await response.json();
        const transformedProducts = data.results
          .filter((p: any) => p.id !== currentProductId)
          .slice(0, 4)
          .map((product: any) => ({
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
            inStock: product.is_in_stock,
            discount: product.discount_percentage,
            isNewArrival: product.is_new_arrival,
            isBestseller: product.is_bestseller,
          }));
        setRelatedProducts(transformedProducts);
      }
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }
    toast({
      title: "Added to cart",
      description: `${quantity} x ${product.name} added to your cart.`,
    });
  };

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Removed from wishlist" : "Added to wishlist",
      description: `${product.name} has been ${isWishlisted ? 'removed from' : 'added to'} your wishlist.`,
    });
  };

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders over $35"
    },
    {
      icon: RotateCcw,
      title: "Easy Returns",
      description: "30-day return policy"
    },
    {
      icon: Shield,
      title: "Warranty",
      description: "1-year manufacturer warranty"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <nav className="text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/products" className="hover:text-foreground">Products</Link>
            <span className="mx-2">/</span>
            <Link to={`/category/${product.category}`} className="hover:text-foreground capitalize">
              {product.category}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={cn(
                    'flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 transition-colors',
                    selectedImage === index 
                      ? 'border-primary' 
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                {product.brand}
              </p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              
              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 mb-4">
                <Rating rating={product.rating} size="lg" />
                <span className="text-lg text-muted-foreground">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Badges */}
              <div className="flex gap-2 mb-4">
                {discountPercentage && (
                  <Badge variant="destructive" className="bg-discount text-white">
                    -{discountPercentage}% OFF
                  </Badge>
                )}
                {product.isNewArrival && (
                  <Badge className="bg-success text-success-foreground">
                    New Arrival
                  </Badge>
                )}
                {product.isBestseller && (
                  <Badge className="bg-warning text-warning-foreground">
                    Bestseller
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-foreground">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <div className={cn(
                'w-3 h-3 rounded-full',
                product.inStock ? 'bg-success' : 'bg-destructive'
              )} />
              <span className={cn(
                'font-medium',
                product.inStock ? 'text-success' : 'text-destructive'
              )}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
              {product.inStock && product.stockCount <= 10 && (
                <span className="text-warning">
                  (Only {product.stockCount} left)
                </span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="font-medium">Quantity:</label>
                <div className="flex items-center border border-border rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                    disabled={!product.inStock}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-muted transition-colors"
                    disabled={!product.inStock}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-primary hover:bg-primary-hover"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWishlist}
                  size="lg"
                  className="px-6"
                >
                  <Heart className={cn(
                    'w-5 h-5',
                    isWishlisted && 'fill-red-500 text-red-500'
                  )} />
                </Button>
                <Button variant="outline" size="lg" className="px-6">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <feature.icon className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-sm">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews ({product.reviewCount})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.specifications).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-3 border-b border-border">
                    <span className="font-medium">{key}:</span>
                    <span className="text-muted-foreground">{String(value)}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                {/* Review Summary */}
                <div className="flex items-center gap-8 p-6 bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-2">{product.rating}</div>
                    <Rating rating={product.rating} size="lg" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Based on {product.reviewCount} reviews
                    </p>
                  </div>
                  <div className="flex-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2 mb-1">
                        <span className="text-sm w-8">{rating}</span>
                        <Star className="w-4 h-4 fill-rating text-rating" />
                        <div className="flex-1 bg-border rounded-full h-2">
                          <div 
                            className="bg-rating h-2 rounded-full" 
                            style={{ width: `${Math.random() * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {Math.floor(Math.random() * 100)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sample Reviews */}
                <div className="space-y-4">
                  {[1, 2, 3].map((index) => (
                    <div key={index} className="border border-border rounded-lg p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <span className="font-medium">U{index}</span>
                        </div>
                        <div>
                          <p className="font-medium">User {index}</p>
                          <div className="flex items-center gap-2">
                            <Rating rating={4 + Math.random()} size="sm" />
                            <span className="text-sm text-muted-foreground">
                              {Math.floor(Math.random() * 30)} days ago
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-muted-foreground">
                        Great product! Really satisfied with the quality and performance. 
                        Would definitely recommend to others.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;