import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ShoppingCart, Eye, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { api } from '@/lib/api';
import { testWishlistPrivacyBypass } from '@/lib/notifications';

interface WishlistItem {
  id: number;
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string | { id: number; name: string; slug: string; };
    brand: string | { id: number; name: string; slug: string; };
    is_in_stock: boolean;
  };
  added_at: string;
}

const Wishlist: React.FC = () => {
  const { state: authState } = useAuth();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [wishlistName, setWishlistName] = useState('My Wishlist');
  const [isWishlistPublic, setIsWishlistPublic] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchWishlist();
    } else {
      setLoading(false);
    }
  }, [authState.isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await api.wishlist.get();

      if (response.ok) {
        const data = await response.json();
        console.log('Wishlist data:', data); // Debug log
        setWishlistItems(data.items || []);
      } else {
        console.error('Failed to fetch wishlist:', response.status);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: number) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.wishlist.removeItem(itemId);

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        toast({
          title: "Removed from wishlist",
          description: "Item has been removed from your wishlist.",
        });
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const addToCart = (product: any, e?: React.MouseEvent) => {
    addItem(product, 1, e?.nativeEvent);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const clearWishlist = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await api.wishlist.clear();

      if (response.ok) {
        setWishlistItems([]);
        toast({
          title: "Wishlist cleared",
          description: "All items have been removed from your wishlist.",
        });
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to clear wishlist.",
        variant: "destructive",
      });
    }
  };

  const updateWishlistName = (newName: string) => {
    setWishlistName(newName);
    
    // 🚨 Bug detection: Check for privacy bypass strings
    const isPrivacyBypass = testWishlistPrivacyBypass(newName);
    
    if (isPrivacyBypass) {
      // Simulate making wishlist public when bypass string is detected
      setIsWishlistPublic(true);
      toast({
        title: "Wishlist Settings Updated",
        description: "Special mode activated - wishlist is now public!",
        variant: "default",
      });
    } else {
      setIsWishlistPublic(false);
    }
  };

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Sign in to view your wishlist</h1>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to save and view your wishlist items.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Create Account</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Your wishlist is empty</h1>
          <p className="text-muted-foreground mb-4">
            Start adding products to your wishlist to see them here.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="wishlist-name">Wishlist Name</Label>
                  <Input
                    id="wishlist-name"
                    value={wishlistName}
                    onChange={(e) => updateWishlistName(e.target.value)}
                    placeholder="Enter wishlist name..."
                    className="max-w-xs"
                  />
                </div>
                {isWishlistPublic && (
                  <Badge variant="destructive" className="self-end">
                    PUBLIC
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                {wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} in your wishlist
                {isWishlistPublic && ' • Visible to everyone'}
              </p>
            </div>
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="relative">
                  <div className="w-full h-48 bg-gray-100 rounded-md flex items-center justify-center">
                    {item.product.image ? (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="hidden w-full h-48 items-center justify-center text-gray-400">
                      <ImageIcon className="w-16 h-16" />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {typeof item.product.brand === 'object' ? item.product.brand.name : item.product.brand}
                  </p>
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {item.product.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {typeof item.product.category === 'object' ? item.product.category.name : item.product.category}
                  </Badge>
                  <Badge 
                    variant={item.product.is_in_stock ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {item.product.is_in_stock ? "In Stock" : "Out of Stock"}
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold">
                    ${item.product.price.toFixed(2)}
                  </span>
                  {item.product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ${item.product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={(e) => addToCart(item.product, e)}
                    disabled={!item.product.is_in_stock}
                    data-testid="add-to-cart"
                  >
                    <ShoppingCart className="w-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Link to={`/product/${item.product.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-muted-foreground">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;