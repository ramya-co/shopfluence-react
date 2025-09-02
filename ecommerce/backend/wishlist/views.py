from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Wishlist, WishlistItem
from .serializers import (
    WishlistSerializer, WishlistItemSerializer, AddToWishlistSerializer,
    WishlistItemDetailSerializer
)
from products.models import Product


class WishlistView(generics.RetrieveAPIView):
    """Get user's wishlist"""
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist


class AddToWishlistView(generics.CreateAPIView):
    """Add item to wishlist"""
    serializer_class = AddToWishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        product_id = serializer.validated_data['product_id']
        
        try:
            product = Product.objects.get(id=product_id, is_active=True)
        except Product.DoesNotExist:
            return Response(
                {'error': 'Product not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        wishlist_item = wishlist.add_item(product)
        
        return Response({
            'message': 'Item added to wishlist successfully',
            'wishlist_item': WishlistItemSerializer(wishlist_item).data
        }, status=status.HTTP_201_CREATED)


class RemoveFromWishlistView(generics.DestroyAPIView):
    """Remove item from wishlist"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wishlist = get_object_or_404(Wishlist, user=self.request.user)
        return get_object_or_404(WishlistItem, wishlist=wishlist, id=self.kwargs['item_id'])

    def destroy(self, request, *args, **kwargs):
        wishlist_item = self.get_object()
        wishlist_item.delete()
        return Response({'message': 'Item removed from wishlist'})


class ClearWishlistView(generics.DestroyAPIView):
    """Clear entire wishlist"""
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        wishlist, created = Wishlist.objects.get_or_create(user=self.request.user)
        return wishlist

    def destroy(self, request, *args, **kwargs):
        wishlist = self.get_object()
        wishlist.clear()
        return Response({'message': 'Wishlist cleared successfully'})


class WishlistItemDetailView(generics.RetrieveAPIView):
    """Get wishlist item details"""
    serializer_class = WishlistItemDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        wishlist = get_object_or_404(Wishlist, user=self.request.user)
        return WishlistItem.objects.filter(wishlist=wishlist)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_wishlist_status(request, product_id):
    """Check if a product is in user's wishlist"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        is_in_wishlist = wishlist.has_item(product)
        
        return Response({
            'product_id': product_id,
            'is_in_wishlist': is_in_wishlist
        })
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def toggle_wishlist(request, product_id):
    """Toggle product in/out of wishlist"""
    try:
        product = Product.objects.get(id=product_id, is_active=True)
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        
        if wishlist.has_item(product):
            wishlist.remove_item(product)
            message = 'Item removed from wishlist'
            is_in_wishlist = False
        else:
            wishlist.add_item(product)
            message = 'Item added to wishlist'
            is_in_wishlist = True
        
        return Response({
            'message': message,
            'is_in_wishlist': is_in_wishlist
        })
    except Product.DoesNotExist:
        return Response(
            {'error': 'Product not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
