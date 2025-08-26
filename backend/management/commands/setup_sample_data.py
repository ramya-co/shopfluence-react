from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction

class Command(BaseCommand):
    help = 'Setup sample data for the e-commerce application'

    def handle(self, *args, **options):
        # Import models inside the handle method to avoid Django context issues
        from products.models import Category, Brand, Product, ProductImage, ProductSpecification
        from accounts.models import User
        
        self.stdout.write('Setting up sample data...')
        
        try:
            with transaction.atomic():
                # Create categories
                self.stdout.write('Creating categories...')
                electronics = Category.objects.create(
                    name='Electronics',
                    slug='electronics',
                    description='Electronic devices and gadgets',
                    image='https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop'
                )
                
                fashion = Category.objects.create(
                    name='Fashion',
                    slug='fashion',
                    description='Clothing, shoes, and accessories',
                    image='https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=300&fit=crop'
                )
                
                home = Category.objects.create(
                    name='Home & Garden',
                    slug='home-garden',
                    description='Home decor and garden supplies',
                    image='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
                )
                
                books = Category.objects.create(
                    name='Books',
                    slug='books',
                    description='Books, magazines, and educational materials',
                    image='https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
                )
                
                sports = Category.objects.create(
                    name='Sports',
                    slug='sports',
                    description='Sports equipment and athletic wear',
                    image='https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop'
                )
                
                beauty = Category.objects.create(
                    name='Beauty',
                    slug='beauty',
                    description='Beauty and personal care products',
                    image='https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop'
                )
                
                self.stdout.write('Categories created successfully!')
                
                # Create brands
                self.stdout.write('Creating brands...')
                apple = Brand.objects.create(
                    name='Apple',
                    description='Innovative technology company',
                    logo='https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop'
                )
                
                samsung = Brand.objects.create(
                    name='Samsung',
                    description='Leading electronics manufacturer',
                    logo='https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200&h=200&fit=crop'
                )
                
                nike = Brand.objects.create(
                    name='Nike',
                    description='Athletic footwear and apparel',
                    logo='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
                )
                
                adidas = Brand.objects.create(
                    name='Adidas',
                    description='Sports clothing and accessories',
                    logo='https://images.unsplash.com/photo-1543508282-6319a3e2621f?w=200&h=200&fit=crop'
                )
                
                ikea = Brand.objects.create(
                    name='IKEA',
                    description='Furniture and home accessories',
                    logo='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop'
                )
                
                self.stdout.write('Brands created successfully!')
                
                # Create products
                self.stdout.write('Creating products...')
                
                # iPhone 15 Pro
                iphone = Product.objects.create(
                    name='iPhone 15 Pro',
                    description='The most advanced iPhone ever with A17 Pro chip, titanium design, and pro camera system.',
                    price=999.99,
                    original_price=1099.99,
                    category=electronics,
                    brand=apple,
                    sku='IPH15PRO-128',
                    stock_quantity=50,
                    is_active=True,
                    is_featured=True,
                    is_new_arrival=True,
                    is_bestseller=True,
                    weight=0.187,
                    dimensions='146.7 x 71.5 x 8.25 mm',
                    warranty='1 year',
                    return_policy='30 days',
                    shipping_info='Free shipping',
                    tags='smartphone, mobile, apple, ios'
                )
                
                ProductImage.objects.create(
                    product=iphone,
                    image='https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&h=600&fit=crop',
                    alt_text='iPhone 15 Pro',
                    is_primary=True
                )
                
                ProductSpecification.objects.create(
                    product=iphone,
                    name='Storage',
                    value='128GB'
                )
                
                ProductSpecification.objects.create(
                    product=iphone,
                    name='Color',
                    value='Natural Titanium'
                )
                
                ProductSpecification.objects.create(
                    product=iphone,
                    name='Screen Size',
                    value='6.1 inches'
                )
                
                # Samsung Galaxy S24
                samsung_phone = Product.objects.create(
                    name='Samsung Galaxy S24',
                    description='Experience the future with AI-powered features and stunning display.',
                    price=799.99,
                    original_price=899.99,
                    category=electronics,
                    brand=samsung,
                    sku='SAMS24-256',
                    stock_quantity=45,
                    is_active=True,
                    is_featured=True,
                    is_new_arrival=True,
                    is_bestseller=False,
                    weight=0.168,
                    dimensions='147.0 x 70.6 x 7.6 mm',
                    warranty='1 year',
                    return_policy='30 days',
                    shipping_info='Free shipping',
                    tags='smartphone, mobile, samsung, android'
                )
                
                ProductImage.objects.create(
                    product=samsung_phone,
                    image='https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=600&fit=crop',
                    alt_text='Samsung Galaxy S24',
                    is_primary=True
                )
                
                # Nike Air Max
                nike_shoes = Product.objects.create(
                    name='Nike Air Max 270',
                    description='Maximum comfort and style with the iconic Air Max cushioning.',
                    price=129.99,
                    original_price=149.99,
                    category=sports,
                    brand=nike,
                    sku='NIKE-AM270-10',
                    stock_quantity=100,
                    is_active=True,
                    is_featured=True,
                    is_new_arrival=False,
                    is_bestseller=True,
                    weight=0.340,
                    dimensions='30 x 20 x 10 cm',
                    warranty='90 days',
                    return_policy='60 days',
                    shipping_info='Free shipping on orders over $100',
                    tags='shoes, sneakers, running, athletic'
                )
                
                ProductImage.objects.create(
                    product=nike_shoes,
                    image='https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop',
                    alt_text='Nike Air Max 270',
                    is_primary=True
                )
                
                # IKEA Furniture
                ikea_table = Product.objects.create(
                    name='IKEA LACK Coffee Table',
                    description='Simple and elegant coffee table perfect for any living room.',
                    price=49.99,
                    original_price=69.99,
                    category=home,
                    brand=ikea,
                    sku='IKEA-LACK-CT',
                    stock_quantity=25,
                    is_active=True,
                    is_featured=False,
                    is_new_arrival=False,
                    is_bestseller=True,
                    weight=8.5,
                    dimensions='120 x 60 x 45 cm',
                    warranty='10 years',
                    return_policy='365 days',
                    shipping_info='$9.99 shipping',
                    tags='furniture, table, coffee table, living room'
                )
                
                ProductImage.objects.create(
                    product=ikea_table,
                    image='https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop',
                    alt_text='IKEA LACK Coffee Table',
                    is_primary=True
                )
                
                self.stdout.write('Products created successfully!')
                
                # Create test user
                self.stdout.write('Creating test user...')
                test_user = User.objects.create_user(
                    username='testuser',
                    email='test@example.com',
                    password='TestPass123!',
                    first_name='Test',
                    last_name='User',
                    phone_number='+1234567890',
                    is_verified=True
                )
                
                self.stdout.write('Test user created successfully!')
                
                self.stdout.write(
                    self.style.SUCCESS('Sample data setup completed successfully!')
                )
                self.stdout.write('Superuser: admin / admin')
                self.stdout.write('Test user: testuser / TestPass123!')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error setting up sample data: {str(e)}')
            )
            raise
