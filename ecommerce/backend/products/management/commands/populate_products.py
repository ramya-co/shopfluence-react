from django.core.management.base import BaseCommand
from django.db import transaction
from products.models import Product, Brand, Category, ProductImage
from decimal import Decimal
import random


class Command(BaseCommand):
    help = 'Populate the database with comprehensive product data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting product population...'))
        
        with transaction.atomic():
            # First, create additional brands
            self.create_additional_brands()
            
            # Then populate products for each category
            self.populate_electronics()
            self.populate_fashion()
            self.populate_home_garden()
            self.populate_books()
            self.populate_sports()
            self.populate_beauty()
            
        self.stdout.write(self.style.SUCCESS('Successfully populated products!'))

    def create_additional_brands(self):
        """Create additional brands for more variety"""
        brands_data = [
            {
                'name': 'Sony',
                'slug': 'sony',
                'description': 'Electronics and entertainment',
                'logo': 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop'
            },
            {
                'name': 'Dell',
                'slug': 'dell',
                'description': 'Computer technology solutions',
                'logo': 'https://images.unsplash.com/photo-1587614295999-6c1c3f7a6d95?w=200&h=200&fit=crop'
            },
            {
                'name': 'Zara',
                'slug': 'zara',
                'description': 'Fashion and clothing',
                'logo': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&h=200&fit=crop'
            },
            {
                'name': 'H&M',
                'slug': 'hm',
                'description': 'Affordable fashion',
                'logo': 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200&h=200&fit=crop'
            },
            {
                'name': 'Penguin Random House',
                'slug': 'penguin-random-house',
                'description': 'Book publisher',
                'logo': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=200&h=200&fit=crop'
            },
            {
                'name': 'West Elm',
                'slug': 'west-elm',
                'description': 'Modern furniture and home decor',
                'logo': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop'
            },
            {
                'name': 'Under Armour',
                'slug': 'under-armour',
                'description': 'Athletic performance gear',
                'logo': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop'
            },
            {
                'name': 'L\'Oreal',
                'slug': 'loreal',
                'description': 'Beauty and cosmetics',
                'logo': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop'
            },
            {
                'name': 'Clinique',
                'slug': 'clinique',
                'description': 'Skincare and cosmetics',
                'logo': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&h=200&fit=crop'
            },
            {
                'name': 'Uniqlo',
                'slug': 'uniqlo',
                'description': 'Casual wear and basics',
                'logo': 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop'
            }
        ]
        
        for brand_data in brands_data:
            brand, created = Brand.objects.get_or_create(
                slug=brand_data['slug'],
                defaults=brand_data
            )
            if created:
                self.stdout.write(f'Created brand: {brand.name}')

    def populate_electronics(self):
        """Populate Electronics category with 10+ products"""
        category = Category.objects.get(slug='electronics')
        
        products_data = [
            {
                'name': 'MacBook Pro 16-inch',
                'slug': 'macbook-pro-16',
                'short_description': 'Powerful laptop for professionals',
                'description': 'The MacBook Pro 16-inch delivers exceptional performance with the M3 Pro chip, stunning Liquid Retina XDR display, and all-day battery life.',
                'price': Decimal('2499.99'),
                'original_price': Decimal('2799.99'),
                'brand': 'Apple',
                'image': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_new_arrival': True,
            },
            {
                'name': 'Samsung 55" QLED 4K TV',
                'slug': 'samsung-55-qled-4k-tv',
                'short_description': 'Premium 4K smart TV with quantum dot technology',
                'description': 'Experience breathtaking picture quality with Quantum Dot technology, 4K resolution, and smart TV features.',
                'price': Decimal('899.99'),
                'original_price': Decimal('1199.99'),
                'brand': 'Samsung',
                'image': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Sony WH-1000XM5 Headphones',
                'slug': 'sony-wh1000xm5-headphones',
                'short_description': 'Industry-leading noise canceling headphones',
                'description': 'Premium wireless headphones with industry-leading noise cancellation, exceptional sound quality, and 30-hour battery life.',
                'price': Decimal('349.99'),
                'original_price': Decimal('399.99'),
                'brand': 'Sony',
                'image': 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Dell XPS 13 Laptop',
                'slug': 'dell-xps-13-laptop',
                'short_description': 'Ultra-portable laptop with stunning display',
                'description': 'The Dell XPS 13 combines premium design with powerful performance in an incredibly compact form factor.',
                'price': Decimal('1299.99'),
                'original_price': Decimal('1599.99'),
                'brand': 'Dell',
                'image': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'iPad Air 5th Generation',
                'slug': 'ipad-air-5th-gen',
                'short_description': 'Powerful, colorful, and versatile',
                'description': 'iPad Air with M1 chip delivers powerful performance for creative projects, gaming, and productivity.',
                'price': Decimal('599.99'),
                'original_price': Decimal('649.99'),
                'brand': 'Apple',
                'image': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Samsung Galaxy Watch 6',
                'slug': 'samsung-galaxy-watch-6',
                'short_description': 'Advanced smartwatch with health tracking',
                'description': 'Track your health and fitness with advanced sensors, GPS, and long-lasting battery life.',
                'price': Decimal('329.99'),
                'original_price': Decimal('379.99'),
                'brand': 'Samsung',
                'image': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Sony PlayStation 5',
                'slug': 'sony-playstation-5',
                'short_description': 'Next-generation gaming console',
                'description': 'Experience lightning-fast loading with an ultra-high speed SSD, deeper immersion with support for haptic feedback.',
                'price': Decimal('499.99'),
                'original_price': Decimal('549.99'),
                'brand': 'Sony',
                'image': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Apple AirPods Pro 2nd Gen',
                'slug': 'airpods-pro-2nd-gen',
                'short_description': 'Premium wireless earbuds with ANC',
                'description': 'AirPods Pro with the H2 chip deliver richer audio and smarter noise cancellation.',
                'price': Decimal('249.99'),
                'original_price': Decimal('279.99'),
                'brand': 'Apple',
                'image': 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Dell Ultrawide Monitor 34"',
                'slug': 'dell-ultrawide-monitor-34',
                'short_description': 'Curved ultrawide monitor for productivity',
                'description': 'Immersive 34-inch curved ultrawide monitor with WQHD resolution perfect for multitasking and gaming.',
                'price': Decimal('449.99'),
                'original_price': Decimal('599.99'),
                'brand': 'Dell',
                'image': 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Samsung Galaxy S24 Ultra',
                'slug': 'samsung-galaxy-s24-ultra',
                'short_description': 'Flagship smartphone with S Pen',
                'description': 'The ultimate smartphone with advanced camera system, S Pen functionality, and all-day battery life.',
                'price': Decimal('1199.99'),
                'original_price': Decimal('1299.99'),
                'brand': 'Samsung',
                'image': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
                'is_new_arrival': True,
                'is_bestseller': True,
            }
        ]
        
        self.create_products(products_data, category)

    def populate_fashion(self):
        """Populate Fashion category with 10+ products"""
        category = Category.objects.get(slug='fashion')
        
        products_data = [
            {
                'name': 'Classic White Button-Down Shirt',
                'slug': 'classic-white-button-down',
                'short_description': 'Timeless white shirt for any occasion',
                'description': 'A versatile white button-down shirt made from premium cotton, perfect for both casual and formal settings.',
                'price': Decimal('79.99'),
                'original_price': Decimal('99.99'),
                'brand': 'Uniqlo',
                'image': 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Zara Wool Blend Coat',
                'slug': 'zara-wool-blend-coat',
                'short_description': 'Elegant wool coat for winter',
                'description': 'Sophisticated wool blend coat with modern tailoring, perfect for staying warm while looking stylish.',
                'price': Decimal('159.99'),
                'original_price': Decimal('199.99'),
                'brand': 'Zara',
                'image': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_new_arrival': True,
            },
            {
                'name': 'H&M Sustainable Jeans',
                'slug': 'hm-sustainable-jeans',
                'short_description': 'Eco-friendly denim with perfect fit',
                'description': 'Classic blue jeans made from sustainable cotton with the perfect balance of comfort and style.',
                'price': Decimal('49.99'),
                'original_price': Decimal('69.99'),
                'brand': 'H&M',
                'image': 'https://images.unsplash.com/photo-1542272454315-7ad9f0b07734?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Nike Air Force 1 Sneakers',
                'slug': 'nike-air-force-1-sneakers',
                'short_description': 'Iconic basketball-inspired sneakers',
                'description': 'The legendary Nike Air Force 1 featuring classic design and comfortable cushioning for everyday wear.',
                'price': Decimal('110.00'),
                'original_price': Decimal('130.00'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Zara Floral Summer Dress',
                'slug': 'zara-floral-summer-dress',
                'short_description': 'Light and breezy floral dress',
                'description': 'Beautiful floral print dress perfect for summer occasions, featuring a flattering fit and flowing silhouette.',
                'price': Decimal('89.99'),
                'original_price': Decimal('119.99'),
                'brand': 'Zara',
                'image': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Adidas Ultraboost 22 Running Shoes',
                'slug': 'adidas-ultraboost-22',
                'short_description': 'High-performance running shoes',
                'description': 'Advanced running shoes with responsive Boost cushioning and Primeknit upper for ultimate comfort.',
                'price': Decimal('180.00'),
                'original_price': Decimal('220.00'),
                'brand': 'Adidas',
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'H&M Cashmere Sweater',
                'slug': 'hm-cashmere-sweater',
                'short_description': 'Luxurious cashmere knit sweater',
                'description': 'Soft and warm cashmere sweater with a relaxed fit, perfect for layering or wearing on its own.',
                'price': Decimal('99.99'),
                'original_price': Decimal('149.99'),
                'brand': 'H&M',
                'image': 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Uniqlo Heattech Base Layer',
                'slug': 'uniqlo-heattech-base-layer',
                'short_description': 'Ultra-warm thermal underwear',
                'description': 'Revolutionary Heattech fabric that generates and retains heat, keeping you warm in cold weather.',
                'price': Decimal('19.99'),
                'original_price': Decimal('29.99'),
                'brand': 'Uniqlo',
                'image': 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Zara Leather Crossbody Bag',
                'slug': 'zara-leather-crossbody-bag',
                'short_description': 'Elegant leather handbag',
                'description': 'Sophisticated leather crossbody bag with adjustable strap and multiple compartments for organization.',
                'price': Decimal('79.99'),
                'original_price': Decimal('99.99'),
                'brand': 'Zara',
                'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Nike Tech Fleece Hoodie',
                'slug': 'nike-tech-fleece-hoodie',
                'short_description': 'Premium athletic hoodie',
                'description': 'Innovative Tech Fleece hoodie that provides warmth without the weight, perfect for training and casual wear.',
                'price': Decimal('95.00'),
                'original_price': Decimal('115.00'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            }
        ]
        
        self.create_products(products_data, category)

    def populate_home_garden(self):
        """Populate Home & Garden category with 10+ products"""
        category = Category.objects.get(slug='home-garden')
        
        products_data = [
            {
                'name': 'IKEA HEMNES Bookshelf',
                'slug': 'ikea-hemnes-bookshelf',
                'short_description': 'Classic solid wood bookshelf',
                'description': 'Traditional style bookshelf made from solid wood with adjustable shelves and timeless design.',
                'price': Decimal('149.99'),
                'original_price': Decimal('179.99'),
                'brand': 'IKEA',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'West Elm Mid-Century Dining Table',
                'slug': 'west-elm-mid-century-dining-table',
                'short_description': 'Modern walnut dining table',
                'description': 'Beautiful mid-century modern dining table crafted from rich walnut wood with sleek tapered legs.',
                'price': Decimal('899.99'),
                'original_price': Decimal('1199.99'),
                'brand': 'West Elm',
                'image': 'https://images.unsplash.com/photo-1549497538-303791108f95?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'IKEA FRIHETEN Sofa Bed',
                'slug': 'ikea-friheten-sofa-bed',
                'short_description': 'Convertible sofa with storage',
                'description': 'Practical 3-seat sofa bed with storage compartment, perfect for small spaces and overnight guests.',
                'price': Decimal('499.99'),
                'original_price': Decimal('599.99'),
                'brand': 'IKEA',
                'image': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'West Elm Velvet Accent Chair',
                'slug': 'west-elm-velvet-accent-chair',
                'short_description': 'Luxurious velvet armchair',
                'description': 'Elegant accent chair upholstered in soft velvet with curved silhouette and brass-finished legs.',
                'price': Decimal('649.99'),
                'original_price': Decimal('799.99'),
                'brand': 'West Elm',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_new_arrival': True,
            },
            {
                'name': 'IKEA MALM Bed Frame',
                'slug': 'ikea-malm-bed-frame',
                'short_description': 'Minimalist bed frame with storage',
                'description': 'Clean-lined bed frame with built-in storage boxes, available in multiple sizes and finishes.',
                'price': Decimal('249.99'),
                'original_price': Decimal('299.99'),
                'brand': 'IKEA',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'West Elm Ceramic Table Lamp',
                'slug': 'west-elm-ceramic-table-lamp',
                'short_description': 'Modern ceramic table lamp',
                'description': 'Sculptural ceramic table lamp with linen shade, adding warm ambient lighting to any room.',
                'price': Decimal('129.99'),
                'original_price': Decimal('159.99'),
                'brand': 'West Elm',
                'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'IKEA VÄXJÖ Pendant Light',
                'slug': 'ikea-vaxjo-pendant-light',
                'short_description': 'Bamboo pendant lamp shade',
                'description': 'Natural bamboo pendant lamp that creates decorative light patterns and adds warmth to your space.',
                'price': Decimal('79.99'),
                'original_price': Decimal('99.99'),
                'brand': 'IKEA',
                'image': 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'West Elm Persian-Style Rug',
                'slug': 'west-elm-persian-style-rug',
                'short_description': 'Vintage-inspired area rug',
                'description': 'Beautiful vintage-inspired rug with intricate patterns and rich colors to anchor your living space.',
                'price': Decimal('399.99'),
                'original_price': Decimal('549.99'),
                'brand': 'West Elm',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'IKEA RÅSKOG Utility Cart',
                'slug': 'ikea-raskog-utility-cart',
                'short_description': 'Versatile storage cart on wheels',
                'description': 'Mobile storage solution perfect for kitchen, bathroom, or office organization with three spacious tiers.',
                'price': Decimal('49.99'),
                'original_price': Decimal('69.99'),
                'brand': 'IKEA',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'West Elm Marble Coffee Table',
                'slug': 'west-elm-marble-coffee-table',
                'short_description': 'Elegant marble top coffee table',
                'description': 'Stunning coffee table featuring genuine marble top with brass-finished metal base for a luxurious look.',
                'price': Decimal('799.99'),
                'original_price': Decimal('999.99'),
                'brand': 'West Elm',
                'image': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_new_arrival': True,
            }
        ]
        
        self.create_products(products_data, category)

    def populate_books(self):
        """Populate Books category with 10+ products"""
        category = Category.objects.get(slug='books')
        
        products_data = [
            {
                'name': 'The Psychology of Money',
                'slug': 'psychology-of-money',
                'short_description': 'Timeless lessons on wealth and happiness',
                'description': 'Morgan Housel shares 19 short stories exploring the strange ways people think about money and teaches you how to make better sense of one of life\'s most important topics.',
                'price': Decimal('16.99'),
                'original_price': Decimal('22.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
                'is_bestseller': True,
                'is_featured': True,
            },
            {
                'name': 'Atomic Habits',
                'slug': 'atomic-habits',
                'short_description': 'Tiny changes, remarkable results',
                'description': 'James Clear\'s proven system for building good habits and breaking bad ones. Learn how to transform your life with tiny changes.',
                'price': Decimal('18.99'),
                'original_price': Decimal('24.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
                'is_bestseller': True,
                'is_featured': True,
            },
            {
                'name': 'Educated: A Memoir',
                'slug': 'educated-memoir',
                'short_description': 'A powerful memoir about education and family',
                'description': 'Tara Westover\'s incredible story of her quest for knowledge, taking her from a survivalist family to Harvard and Cambridge.',
                'price': Decimal('15.99'),
                'original_price': Decimal('19.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'The Seven Husbands of Evelyn Hugo',
                'slug': 'seven-husbands-evelyn-hugo',
                'short_description': 'A captivating novel about love and ambition',
                'description': 'Taylor Jenkins Reid\'s novel about reclusive Hollywood icon Evelyn Hugo who finally decides to tell her life story.',
                'price': Decimal('14.99'),
                'original_price': Decimal('18.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
                'is_new_arrival': True,
                'is_featured': True,
            },
            {
                'name': 'Sapiens: A Brief History of Humankind',
                'slug': 'sapiens-brief-history',
                'short_description': 'How we conquered the world',
                'description': 'Yuval Noah Harari\'s account of how we came to rule the world, from the Stone Age to the present.',
                'price': Decimal('17.99'),
                'original_price': Decimal('23.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'The Midnight Library',
                'slug': 'midnight-library',
                'short_description': 'A novel about infinite possibilities',
                'description': 'Matt Haig\'s novel about Nora Seed, who finds herself in a magical library between life and death.',
                'price': Decimal('13.99'),
                'original_price': Decimal('17.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Becoming',
                'slug': 'becoming-michelle-obama',
                'short_description': 'Michelle Obama\'s inspiring memoir',
                'description': 'The former First Lady\'s deeply personal memoir about her journey from Chicago\'s South Side to the White House.',
                'price': Decimal('19.99'),
                'original_price': Decimal('25.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'The Silent Patient',
                'slug': 'silent-patient',
                'short_description': 'A gripping psychological thriller',
                'description': 'Alex Michaelides\' debut thriller about a woman\'s act of violence against her husband and her refusal to speak.',
                'price': Decimal('14.99'),
                'original_price': Decimal('19.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Where the Crawdads Sing',
                'slug': 'where-crawdads-sing',
                'short_description': 'A mesmerizing coming-of-age story',
                'description': 'Delia Owens\' novel about Kya, the mysterious "Marsh Girl" who grows up isolated in the marshes of North Carolina.',
                'price': Decimal('15.99'),
                'original_price': Decimal('20.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'The Alchemist',
                'slug': 'the-alchemist',
                'short_description': 'A fable about following your dream',
                'description': 'Paulo Coelho\'s masterpiece about Santiago, a young shepherd\'s journey to the pyramids of Egypt.',
                'price': Decimal('12.99'),
                'original_price': Decimal('16.99'),
                'brand': 'Penguin Random House',
                'image': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
            }
        ]
        
        self.create_products(products_data, category)

    def populate_sports(self):
        """Populate Sports category with 10+ products"""
        category = Category.objects.get(slug='sports')
        
        products_data = [
            {
                'name': 'Nike Dri-FIT Running Shorts',
                'slug': 'nike-dri-fit-running-shorts',
                'short_description': 'Lightweight shorts for running',
                'description': 'Performance running shorts with Dri-FIT technology to keep you dry and comfortable during workouts.',
                'price': Decimal('35.00'),
                'original_price': Decimal('45.00'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Under Armour HeatGear T-Shirt',
                'slug': 'under-armour-heatgear-tshirt',
                'short_description': 'Ultra-light training shirt',
                'description': 'HeatGear fabric keeps you cool and dry during intense training sessions with anti-odor technology.',
                'price': Decimal('29.99'),
                'original_price': Decimal('39.99'),
                'brand': 'Under Armour',
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Adidas Yoga Mat',
                'slug': 'adidas-yoga-mat',
                'short_description': 'Premium exercise mat',
                'description': 'High-quality yoga mat with superior grip and cushioning for comfortable practice sessions.',
                'price': Decimal('49.99'),
                'original_price': Decimal('69.99'),
                'brand': 'Adidas',
                'image': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Nike Training Gloves',
                'slug': 'nike-training-gloves',
                'short_description': 'Weightlifting gloves for grip',
                'description': 'Durable training gloves with enhanced grip and wrist support for weightlifting and cross-training.',
                'price': Decimal('24.99'),
                'original_price': Decimal('34.99'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Under Armour Compression Leggings',
                'slug': 'under-armour-compression-leggings',
                'short_description': 'High-performance athletic leggings',
                'description': 'Compression leggings that support muscles and improve blood flow during intense workouts.',
                'price': Decimal('69.99'),
                'original_price': Decimal('89.99'),
                'brand': 'Under Armour',
                'image': 'https://images.unsplash.com/photo-1506629905042-b6f1ba10f5c9?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Adidas Tennis Racket',
                'slug': 'adidas-tennis-racket',
                'short_description': 'Professional tennis racket',
                'description': 'High-performance tennis racket designed for power and control on the court.',
                'price': Decimal('149.99'),
                'original_price': Decimal('199.99'),
                'brand': 'Adidas',
                'image': 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Nike Water Bottle',
                'slug': 'nike-water-bottle',
                'short_description': 'Insulated stainless steel bottle',
                'description': 'Double-wall insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
                'price': Decimal('34.99'),
                'original_price': Decimal('44.99'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Under Armour Sports Backpack',
                'slug': 'under-armour-sports-backpack',
                'short_description': 'Durable athletic backpack',
                'description': 'Spacious backpack with multiple compartments designed for athletes and gym-goers.',
                'price': Decimal('79.99'),
                'original_price': Decimal('99.99'),
                'brand': 'Under Armour',
                'image': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Adidas Soccer Cleats',
                'slug': 'adidas-soccer-cleats',
                'short_description': 'Professional football boots',
                'description': 'High-performance soccer cleats with superior traction and ball control for competitive play.',
                'price': Decimal('129.99'),
                'original_price': Decimal('169.99'),
                'brand': 'Adidas',
                'image': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Nike Adjustable Dumbbells',
                'slug': 'nike-adjustable-dumbbells',
                'short_description': 'Home gym weight set',
                'description': 'Space-saving adjustable dumbbells perfect for home workouts with quick weight changes.',
                'price': Decimal('299.99'),
                'original_price': Decimal('399.99'),
                'brand': 'Nike',
                'image': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_new_arrival': True,
            }
        ]
        
        self.create_products(products_data, category)

    def populate_beauty(self):
        """Populate Beauty category with 10+ products"""
        category = Category.objects.get(slug='beauty')
        
        products_data = [
            {
                'name': 'L\'Oreal Revitalift Anti-Aging Serum',
                'slug': 'loreal-revitalift-serum',
                'short_description': 'Powerful anti-aging face serum',
                'description': 'Advanced anti-aging serum with hyaluronic acid and vitamin C to reduce fine lines and brighten skin.',
                'price': Decimal('29.99'),
                'original_price': Decimal('39.99'),
                'brand': 'L\'Oreal',
                'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
                'is_bestseller': True,
                'is_featured': True,
            },
            {
                'name': 'Clinique Dramatically Different Moisturizer',
                'slug': 'clinique-dramatically-different-moisturizer',
                'short_description': 'Dermatologist-developed moisturizer',
                'description': 'The iconic yellow moisturizer that strengthens skin\'s moisture barrier for healthier-looking skin.',
                'price': Decimal('32.99'),
                'original_price': Decimal('42.99'),
                'brand': 'Clinique',
                'image': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'L\'Oreal True Match Foundation',
                'slug': 'loreal-true-match-foundation',
                'short_description': 'Perfect shade-matching foundation',
                'description': 'Medium coverage foundation with 45 shades to match your exact skin tone and undertone.',
                'price': Decimal('12.99'),
                'original_price': Decimal('16.99'),
                'brand': 'L\'Oreal',
                'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Clinique Almost Powder Makeup SPF 15',
                'slug': 'clinique-almost-powder-makeup',
                'short_description': 'Weightless powder foundation',
                'description': 'Silky powder foundation that looks and feels like your skin, only better, with built-in SPF protection.',
                'price': Decimal('38.99'),
                'original_price': Decimal('48.99'),
                'brand': 'Clinique',
                'image': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'L\'Oreal Voluminous Lash Paradise Mascara',
                'slug': 'loreal-lash-paradise-mascara',
                'short_description': 'Volumizing and lengthening mascara',
                'description': 'Dramatic volume and length mascara with soft wavy brush for feathery, full lashes.',
                'price': Decimal('9.99'),
                'original_price': Decimal('13.99'),
                'brand': 'L\'Oreal',
                'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'Clinique Cheek Pop Blush',
                'slug': 'clinique-cheek-pop-blush',
                'short_description': 'Long-wearing powder blush',
                'description': 'Vibrant yet natural-looking blush that looks virtually powderless on skin.',
                'price': Decimal('23.99'),
                'original_price': Decimal('29.99'),
                'brand': 'Clinique',
                'image': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'L\'Oreal Age Perfect Eye Cream',
                'slug': 'loreal-age-perfect-eye-cream',
                'short_description': 'Anti-aging eye treatment',
                'description': 'Targeted eye cream that reduces the appearance of crow\'s feet and under-eye bags.',
                'price': Decimal('19.99'),
                'original_price': Decimal('26.99'),
                'brand': 'L\'Oreal',
                'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
                'is_featured': True,
            },
            {
                'name': 'Clinique Take The Day Off Cleansing Balm',
                'slug': 'clinique-take-day-off-balm',
                'short_description': 'Makeup removing cleansing balm',
                'description': 'Lightweight makeup remover that quickly dissolves long-wearing and waterproof makeup.',
                'price': Decimal('31.99'),
                'original_price': Decimal('39.99'),
                'brand': 'Clinique',
                'image': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
                'is_bestseller': True,
            },
            {
                'name': 'L\'Oreal Colour Riche Lipstick',
                'slug': 'loreal-colour-riche-lipstick',
                'short_description': 'Creamy, long-wearing lipstick',
                'description': 'Rich, creamy lipstick with intense color payoff and comfortable all-day wear.',
                'price': Decimal('8.99'),
                'original_price': Decimal('11.99'),
                'brand': 'L\'Oreal',
                'image': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&h=600&fit=crop',
                'is_new_arrival': True,
            },
            {
                'name': 'Clinique High Impact Mascara',
                'slug': 'clinique-high-impact-mascara',
                'short_description': 'Dramatic volume mascara',
                'description': 'Buildable mascara that creates maximum volume and dramatic length for bold, beautiful lashes.',
                'price': Decimal('24.99'),
                'original_price': Decimal('31.99'),
                'brand': 'Clinique',
                'image': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=600&fit=crop',
                'is_featured': True,
                'is_bestseller': True,
            }
        ]
        
        self.create_products(products_data, category)

    def create_products(self, products_data, category):
        """Helper method to create products"""
        for product_data in products_data:
            # Get or create brand
            brand_name = product_data.pop('brand')
            brand = Brand.objects.get(name=brand_name)
            
            # Extract image URL
            image_url = product_data.pop('image', None)
            
            # Check if product already exists
            if not Product.objects.filter(slug=product_data['slug']).exists():
                # Generate unique SKU
                sku = f"{brand.slug.upper()}-{product_data['slug'].upper()}"[:50]
                
                product = Product.objects.create(
                    category=category,
                    brand=brand,
                    sku=sku,
                    stock_quantity=50,  # Set default stock
                    **product_data
                )
                
                # Create ProductImage if image URL provided
                if image_url:
                    ProductImage.objects.create(
                        product=product,
                        image=image_url,
                        alt_text=product.name,
                        is_primary=True,
                        order=0
                    )
                
                self.stdout.write(f'Created product: {product.name}')
            else:
                self.stdout.write(f'Product already exists: {product_data["name"]}')
