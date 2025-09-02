from rest_framework import serializers
from .models import Wishlist, WishlistItem
from products.serializers import ProductListSerializer


class WishlistItemSerializer(serializers.ModelSerializer):
    """Serializer for wishlist items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'product_id', 'is_available', 'added_at']
        read_only_fields = ['id', 'is_available', 'added_at']
    def get_is_available(self, obj):
        return obj.product.is_in_stock if obj.product else False


class WishlistSerializer(serializers.ModelSerializer):
    """Serializer for wishlist"""
    items = serializers.SerializerMethodField()
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Wishlist
        fields = ['id', 'items', 'total_items', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_items', 'created_at', 'updated_at']
    
    def get_items(self, obj):
        """Get wishlist items with proper serialization"""
        items = obj.items.all()
        return WishlistItemSerializer(items, many=True).data


class AddToWishlistSerializer(serializers.Serializer):
    """Serializer for adding items to wishlist"""
    product_id = serializers.IntegerField()


class WishlistItemDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for wishlist items"""
    product = ProductListSerializer(read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = WishlistItem
        fields = ['id', 'product', 'is_available', 'added_at']

    def get_is_available(self, obj):
        return obj.product.is_in_stock if obj.product else False
