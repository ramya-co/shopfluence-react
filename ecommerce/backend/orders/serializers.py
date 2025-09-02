from rest_framework import serializers
from .models import Cart, CartItem, Order, OrderItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """Serializer for cart items"""
    product = ProductListSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    is_available = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity', 'total_price', 'is_available', 'created_at']
        read_only_fields = ['id', 'total_price', 'is_available', 'created_at']


class CartSerializer(serializers.ModelSerializer):
    """Serializer for shopping cart"""
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    class Meta:
        model = Cart
        fields = ['id', 'items', 'total_items', 'total_price', 'created_at', 'updated_at']
        read_only_fields = ['id', 'total_items', 'total_price', 'created_at', 'updated_at']


class AddToCartSerializer(serializers.Serializer):
    """Serializer for adding items to cart"""
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)


class UpdateCartItemSerializer(serializers.Serializer):
    """Serializer for updating cart item quantity"""
    quantity = serializers.IntegerField(min_value=1)


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for order items"""
    product = ProductListSerializer(read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'product_sku', 'quantity', 'unit_price', 'total_price']


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for orders"""
    items = OrderItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    billing_address = serializers.SerializerMethodField()
    shipping_address = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'billing_address', 'shipping_address',
            'subtotal', 'tax_amount', 'shipping_amount', 'discount_amount', 'total_amount',
            'payment_method', 'transaction_id', 'notes', 'items', 'total_items',
            'created_at', 'updated_at', 'paid_at', 'shipped_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']
    
    def get_billing_address(self, obj):
        if obj.billing_address:
            from accounts.serializers import AddressSerializer
            return AddressSerializer(obj.billing_address).data
        return None
    
    def get_shipping_address(self, obj):
        if obj.shipping_address:
            from accounts.serializers import AddressSerializer
            return AddressSerializer(obj.shipping_address).data
        return None


class CreateOrderSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    billing_address_id = serializers.IntegerField()
    shipping_address_id = serializers.IntegerField()
    notes = serializers.CharField(required=False, allow_blank=True)
    
    class Meta:
        model = Order
        fields = ['billing_address_id', 'shipping_address_id', 'notes']
    
    def validate_billing_address_id(self, value):
        user = self.context['request'].user
        try:
            address = user.addresses.get(id=value)
            return value
        except:
            raise serializers.ValidationError("Invalid billing address")
    
    def validate_shipping_address_id(self, value):
        user = self.context['request'].user
        try:
            address = user.addresses.get(id=value)
            return value
        except:
            raise serializers.ValidationError("Invalid shipping address")


class OrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for order listing"""
    total_items = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'payment_status', 'total_amount',
            'total_items', 'created_at'
        ]


class CheckoutSerializer(serializers.Serializer):
    """Serializer for checkout process"""
    billing_address_id = serializers.IntegerField()
    shipping_address_id = serializers.IntegerField()
    payment_method = serializers.CharField(max_length=50)
    notes = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, attrs):
        user = self.context['request'].user
        cart = user.cart
        
        if not cart.items.exists():
            raise serializers.ValidationError("Cart is empty")
        
        # Validate addresses
        try:
            billing_address = user.addresses.get(id=attrs['billing_address_id'])
            shipping_address = user.addresses.get(id=attrs['shipping_address_id'])
        except:
            raise serializers.ValidationError("Invalid address provided")
        
        # Check product availability
        for item in cart.items.all():
            if not item.is_available:
                raise serializers.ValidationError(f"Product {item.product.name} is not available in requested quantity")
        
        return attrs
