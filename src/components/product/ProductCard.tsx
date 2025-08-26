import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/ui/Rating';
import { Product } from '@/data/sampleData';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  // Check if product is in wishlist on mount
  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  const checkWishlistStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.wishlist.check(parseInt(product.id));
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.is_in_wishlist);
      } else if (response.status === 404) {
        // Product doesn't exist in backend, ignore
        console.log(`Product ${product.id} not found in backend`);
      }
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist.",
        variant: "destructive",
      });
      return;
    }

    setIsWishlistLoading(true);
    try {
      const response = await api.wishlist.toggle(parseInt(product.id));
      if (response.ok) {
        const data = await response.json();
        setIsWishlisted(data.is_in_wishlist);
        toast({
          title: data.is_in_wishlist ? "Added to wishlist" : "Removed from wishlist",
          description: data.message,
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    } finally {
      setIsWishlistLoading(false);
    }
  };

  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount;

  return (
    <div
      className={cn(
        'group relative bg-card border border-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-hover',
        className
      )}
    >
            <Link to={`/product/${product.slug || product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={product.image}
            alt={product.name}
            className={cn(
              'w-full h-full object-cover transition-all duration-300 group-hover:scale-105',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage && (
              <Badge variant="destructive" className="bg-discount text-white">
                -{discountPercentage}%
              </Badge>
            )}
            {product.isNewArrival && (
              <Badge className="bg-success text-success-foreground">
                New
              </Badge>
            )}
            {product.isBestseller && (
              <Badge className="bg-warning text-warning-foreground">
                Bestseller
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white"
                onClick={handleWishlist}
                disabled={isWishlistLoading}
              >
                <Heart
                  className={cn(
                    'w-4 h-4',
                    isWishlisted && 'fill-red-500 text-red-500'
                  )}
                />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="w-8 h-8 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/product/${product.id}`;
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stock Status */}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="bg-white text-foreground">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-2">
            <Rating rating={product.rating} size="sm" />
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Info */}
          {product.inStock && product.stockCount <= 10 && (
            <p className="text-xs text-warning mb-2">
              Only {product.stockCount} left in stock
            </p>
          )}
        </div>
      </Link>

      {/* Add to Cart Button */}
      <div className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className="w-full bg-primary hover:bg-primary-hover text-primary-foreground"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
};