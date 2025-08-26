from rest_framework import serializers
from .models import Category, Brand, Product, ProductImage, ProductSpecification, Review


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'icon', 'is_active', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model"""
    product_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Brand
        fields = ['id', 'name', 'slug', 'description', 'logo', 'website', 'is_active', 'product_count']
    
    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductSpecificationSerializer(serializers.ModelSerializer):
    """Serializer for ProductSpecification model"""
    
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'order']


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'rating', 'title', 'comment', 'user_name', 'user_email', 'created_at']
        read_only_fields = ['id', 'user_name', 'user_email', 'created_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    discount_percentage = serializers.IntegerField(read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'short_description', 'price', 'original_price',
            'discount_percentage', 'sku', 'stock_quantity', 'category', 'brand', 'is_active',
            'is_featured', 'is_new_arrival', 'is_bestseller', 'weight', 'length', 'width',
            'height', 'images', 'specifications', 'reviews', 'average_rating', 'review_count',
            'is_in_stock', 'is_low_stock', 'created_at'
        ]
    
    def get_price(self, obj):
        """Ensure price is returned as a number"""
        return float(obj.price) if obj.price else 0.0
    
    def get_original_price(self, obj):
        """Ensure original_price is returned as a number"""
        return float(obj.original_price) if obj.original_price else 0.0


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product listing"""
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    price = serializers.SerializerMethodField()
    original_price = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    discount_percentage = serializers.IntegerField(read_only=True)
    average_rating = serializers.FloatField(read_only=True)
    review_count = serializers.IntegerField(read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'short_description', 'price', 'original_price',
            'discount_percentage', 'category', 'brand', 'image', 'is_featured', 'is_new_arrival',
            'is_bestseller', 'average_rating', 'review_count', 'is_in_stock'
        ]
    
    def get_price(self, obj):
        """Ensure price is returned as a number"""
        return float(obj.price) if obj.price else 0.0
    
    def get_original_price(self, obj):
        """Ensure original_price is returned as a number"""
        return float(obj.original_price) if obj.original_price else 0.0
    
    def get_image(self, obj):
        """Get primary image URL"""
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return primary_image.image.name if hasattr(primary_image.image, 'name') else str(primary_image.image)
        # Fallback to first image if no primary
        first_image = obj.images.first()
        if first_image:
            return first_image.image.name if hasattr(first_image.image, 'name') else str(first_image.image)
        return None
    
    def get_primary_image(self, obj):
        primary_image = obj.images.filter(is_primary=True).first()
        if primary_image:
            return ProductImageSerializer(primary_image).data
        # Fallback to first image if no primary
        first_image = obj.images.first()
        return ProductImageSerializer(first_image).data if first_image else None


class ProductDetailSerializer(ProductSerializer):
    """Detailed serializer for product detail view"""
    related_products = serializers.SerializerMethodField()
    
    class Meta(ProductSerializer.Meta):
        fields = ProductSerializer.Meta.fields + ['related_products']
    
    def get_related_products(self, obj):
        related = Product.objects.filter(
            category=obj.category,
            is_active=True
        ).exclude(id=obj.id)[:4]
        return ProductListSerializer(related, many=True).data


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating reviews"""
    
    class Meta:
        model = Review
        fields = ['rating', 'title', 'comment']
    
    def validate(self, attrs):
        user = self.context['request'].user
        product = self.context['product']
        
        # Check if user already reviewed this product
        if Review.objects.filter(user=user, product=product).exists():
            raise serializers.ValidationError("You have already reviewed this product")
        
        return attrs
    
    def create(self, validated_data):
        user = self.context['request'].user
        product = self.context['product']
        
        review = Review.objects.create(
            user=user,
            product=product,
            **validated_data
        )
        
        return review
