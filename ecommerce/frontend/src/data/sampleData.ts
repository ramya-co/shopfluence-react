// Sample data for the ecommerce site
export interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  brand: string;
  image: string;
  images: string[];
  description: string;
  specifications: Record<string, string>;
  inStock: boolean;
  stockCount: number;
  discount?: number;
  isNewArrival?: boolean;
  isBestseller?: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  icon: string;
}

export const categories: Category[] = [
  {
    id: "electronics",
    name: "Electronics",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    icon: "Smartphone"
  },
  {
    id: "fashion",
    name: "Fashion",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    icon: "Shirt"
  },
  {
    id: "home",
    name: "Home & Garden",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    icon: "Home"
  },
  {
    id: "books",
    name: "Books",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    icon: "Book"
  },
  {
    id: "sports",
    name: "Sports & Outdoors",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
    icon: "Dumbbell"
  },
  {
    id: "beauty",
    name: "Beauty & Health",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop",
    icon: "Heart"
  }
];

export const products: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro Max",
    price: 1199,
    originalPrice: 1299,
    rating: 4.8,
    reviewCount: 1250,
    category: "electronics",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1605236453806-b25e7d3d94b0?w=400&h=400&fit=crop"
    ],
    description: "The iPhone 15 Pro Max features the revolutionary A17 Pro chip, titanium design, and the most advanced iPhone camera system ever.",
    specifications: {
      "Display": "6.7-inch Super Retina XDR",
      "Chip": "A17 Pro",
      "Storage": "256GB",
      "Camera": "48MP Main, 12MP Ultra Wide, 12MP Telephoto",
      "Battery": "Up to 29 hours video playback"
    },
    inStock: true,
    stockCount: 45,
    discount: 8,
    isNewArrival: true,
    isBestseller: true
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 1099,
    rating: 4.7,
    reviewCount: 890,
    category: "electronics",
    brand: "Samsung",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop"
    ],
    description: "Experience the power of Galaxy AI with the S24 Ultra. Built for those who want it all.",
    specifications: {
      "Display": "6.8-inch Dynamic AMOLED 2X",
      "Processor": "Snapdragon 8 Gen 3",
      "Storage": "256GB",
      "Camera": "200MP Main + Triple Telephoto",
      "Battery": "5000mAh"
    },
    inStock: true,
    stockCount: 32,
    isBestseller: true
  },
  {
    id: "3",
    name: "MacBook Pro 14-inch",
    price: 1999,
    originalPrice: 2199,
    rating: 4.9,
    reviewCount: 567,
    category: "electronics",
    brand: "Apple",
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop"
    ],
    description: "Supercharged by M3 Pro and M3 Max chips. Built for all types of creatives.",
    specifications: {
      "Display": "14.2-inch Liquid Retina XDR",
      "Chip": "Apple M3 Pro",
      "Memory": "18GB unified memory",
      "Storage": "512GB SSD",
      "Battery": "Up to 18 hours"
    },
    inStock: true,
    stockCount: 18,
    discount: 9,
    isNewArrival: true
  },
  {
    id: "4",
    name: "Sony WH-1000XM5 Headphones",
    price: 349,
    originalPrice: 399,
    rating: 4.6,
    reviewCount: 2156,
    category: "electronics",
    brand: "Sony",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop"
    ],
    description: "Industry-leading noise canceling with new Auto NC Optimizer, exceptional call quality, and up to 30 hour battery life.",
    specifications: {
      "Type": "Wireless Noise Canceling",
      "Driver": "30mm",
      "Battery Life": "Up to 30 hours",
      "Quick Charge": "3 min charge = 3 hours playback",
      "Weight": "250g"
    },
    inStock: true,
    stockCount: 67,
    discount: 13,
    isBestseller: true
  },
  {
    id: "5",
    name: "Nike Air Max 270",
    price: 140,
    rating: 4.4,
    reviewCount: 3421,
    category: "fashion",
    brand: "Nike",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop"
    ],
    description: "The Nike Air Max 270 delivers unrivaled all-day comfort with the tallest Air unit yet.",
    specifications: {
      "Type": "Running Shoes",
      "Material": "Mesh and synthetic",
      "Sole": "Air Max unit",
      "Sizes": "US 6-13",
      "Colors": "Multiple options"
    },
    inStock: true,
    stockCount: 124,
    isBestseller: true
  },
  {
    id: "6",
    name: "Adidas Ultraboost 22",
    price: 190,
    originalPrice: 220,
    rating: 4.5,
    reviewCount: 1876,
    category: "fashion",
    brand: "Adidas",
    image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop"
    ],
    description: "Made with Primeblue, a high-performance recycled material, these running shoes deliver incredible energy return.",
    specifications: {
      "Type": "Running Shoes",
      "Material": "Primeblue recycled material",
      "Technology": "BOOST midsole",
      "Sustainability": "Made with recycled materials",
      "Fit": "Regular"
    },
    inStock: true,
    stockCount: 89,
    discount: 14,
    isNewArrival: true
  }
];

export const heroSlides = [
  {
    id: 1,
    title: "New iPhone 15 Pro",
    subtitle: "Titanium. So strong. So light. So Pro.",
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&h=600&fit=crop",
    cta: "Shop Now",
    link: "product/iphone-15-pro"
  },
  {
    id: 2,
    title: "Summer Fashion Sale",
    subtitle: "Up to 50% off on trending styles",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
    cta: "Explore Deals",
    link: "/category/fashion"
  },
  {
    id: 3,
    title: "Home Office Essentials",
    subtitle: "Create your perfect workspace",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop",
    cta: "Shop Collection",
    link: "/category/home"
  }
];

export const deals = [
  {
    id: "deal-1",
    title: "Flash Sale",
    subtitle: "Limited time offer",
    discount: "Up to 70% OFF",
    products: ["1", "4", "6"],
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    image: "https://images.unsplash.com/photo-1607083206968-13611e3d76db?w=400&h=300&fit=crop"
  },
  {
    id: "deal-2",
    title: "Tech Week",
    subtitle: "Latest gadgets",
    discount: "Save Big",
    products: ["1", "2", "3"],
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop"
  }
];