from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db import transaction
from .models import Cart, CartItem, Order, OrderItem
from .serializers import (
    CartSerializer, CartItemSerializer, AddToCartSerializer, UpdateCartItemSerializer,
    OrderSerializer, OrderListSerializer, CreateOrderSerializer, CheckoutSerializer
)
from products.models import Product


class CartView(generics.RetrieveAPIView):
    """Get user's cart"""
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart


class AddToCartView(generics.CreateAPIView):
    """Add item to cart"""
    serializer_class = AddToCartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        quantity = serializer.validated_data['quantity']
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if not product.is_in_stock:
            return Response(
                {'error': 'Product is out of stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if product.stock_quantity < quantity:
            return Response(
                {'error': f'Only {product.stock_quantity} items available in stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_item = cart.add_item(product, quantity)
        
        return Response({
            'message': 'Item added to cart successfully',
            'cart_item': CartItemSerializer(cart_item).data
        }, status=status.HTTP_201_CREATED)


class UpdateCartItemView(generics.UpdateAPIView):
    """Update cart item quantity"""
    serializer_class = UpdateCartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart = get_object_or_404(Cart, user=self.request.user)
        return get_object_or_404(CartItem, cart=cart, id=self.kwargs['item_id'])

    def update(self, request, *args, **kwargs):
        cart_item = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        quantity = serializer.validated_data['quantity']
        
        if quantity <= 0:
            cart_item.delete()
            return Response({'message': 'Item removed from cart'})
        
        if cart_item.product.stock_quantity < quantity:
            return Response(
                {'error': f'Only {cart_item.product.stock_quantity} items available in stock'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        cart_item.quantity = quantity
        cart_item.save()
        
        return Response({
            'message': 'Cart item updated successfully',
            'cart_item': CartItemSerializer(cart_item).data
        })


class RemoveFromCartView(generics.DestroyAPIView):
    """Remove item from cart"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart = get_object_or_404(Cart, user=self.request.user)
        return get_object_or_404(CartItem, cart=cart, id=self.kwargs['item_id'])

    def destroy(self, request, *args, **kwargs):
        cart_item = self.get_object()
        cart_item.delete()
        return Response({'message': 'Item removed from cart'})


class ClearCartView(generics.DestroyAPIView):
    """Clear entire cart"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        return cart

    def destroy(self, request, *args, **kwargs):
        cart = self.get_object()
        cart.clear()
        return Response({'message': 'Cart cleared successfully'})


class OrderListView(generics.ListAPIView):
    """List user's orders"""
    serializer_class = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderDetailView(generics.RetrieveAPIView):
    """Get order details"""
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class CreateOrderView(generics.CreateAPIView):
    """Create order from cart"""
    serializer_class = CreateOrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        cart = request.user.cart
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate addresses
        billing_address_id = serializer.validated_data['billing_address_id']
        shipping_address_id = serializer.validated_data['shipping_address_id']
        
        try:
            billing_address = request.user.addresses.get(id=billing_address_id)
            shipping_address = request.user.addresses.get(id=shipping_address_id)
        except:
            return Response(
                {'error': 'Invalid address provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check product availability and calculate totals
        subtotal = 0
        order_items_data = []
        
        for cart_item in cart.items.all():
            if not cart_item.is_available:
                return Response(
                    {'error': f'Product {cart_item.product.name} is not available in requested quantity'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            item_total = cart_item.total_price
            subtotal += item_total
            
            order_items_data.append({
                'product': cart_item.product,
                'product_name': cart_item.product.name,
                'product_sku': cart_item.product.sku or '',
                'quantity': cart_item.quantity,
                'unit_price': cart_item.product.price,
                'total_price': item_total
            })
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            billing_address=billing_address,
            shipping_address=shipping_address,
            subtotal=subtotal,
            total_amount=subtotal,  # Will be updated with tax, shipping, etc.
            notes=serializer.validated_data.get('notes', '')
        )
        
        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Update product stock
        for cart_item in cart.items.all():
            product = cart_item.product
            product.stock_quantity -= cart_item.quantity
            product.save()
        
        # Clear cart
        cart.clear()
        
        return Response({
            'message': 'Order created successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


class CheckoutView(generics.CreateAPIView):
    """Checkout process"""
    serializer_class = CheckoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # This would typically integrate with a payment gateway
        # For now, we'll just create the order
        
        cart = request.user.cart
        if not cart.items.exists():
            return Response(
                {'error': 'Cart is empty'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate addresses
        billing_address_id = serializer.validated_data['billing_address_id']
        shipping_address_id = serializer.validated_data['shipping_address_id']
        
        try:
            billing_address = request.user.addresses.get(id=billing_address_id)
            shipping_address = request.user.addresses.get(id=shipping_address_id)
        except:
            return Response(
                {'error': 'Invalid address provided'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check product availability and calculate totals
        subtotal = 0
        order_items_data = []
        
        for cart_item in cart.items.all():
            if not cart_item.is_available:
                return Response(
                    {'error': f'Product {cart_item.product.name} is not available in requested quantity'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            item_total = cart_item.total_price
            subtotal += item_total
            
            order_items_data.append({
                'product': cart_item.product,
                'product_name': cart_item.product.name,
                'product_sku': cart_item.product.sku or '',
                'quantity': cart_item.quantity,
                'unit_price': cart_item.product.price,
                'total_price': item_total
            })
        
        # Calculate tax and shipping (simplified)
        tax_amount = subtotal * 0.08  # 8% tax
        shipping_amount = 10.00 if subtotal < 50 else 0.00  # Free shipping over $50
        total_amount = subtotal + tax_amount + shipping_amount
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            billing_address=billing_address,
            shipping_address=shipping_address,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_amount=shipping_amount,
            total_amount=total_amount,
            payment_method=serializer.validated_data['payment_method'],
            notes=serializer.validated_data.get('notes', '')
        )
        
        # Create order items
        for item_data in order_items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Update product stock
        for cart_item in cart.items.all():
            product = cart_item.product
            product.stock_quantity -= cart_item.quantity
            product.save()
        
        # Clear cart
        cart.clear()
        
        return Response({
            'message': 'Checkout completed successfully',
            'order': OrderSerializer(order).data
        }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    """Cancel an order"""
    try:
        order = Order.objects.get(id=order_id, user=request.user)
        if order.cancel_order():
            return Response({'message': 'Order cancelled successfully'})
        else:
            return Response(
                {'error': 'Order cannot be cancelled'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    except Order.DoesNotExist:
        return Response(
            {'error': 'Order not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
