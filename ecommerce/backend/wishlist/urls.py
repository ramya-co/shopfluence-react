from django.urls import path
from . import views

app_name = 'wishlist'

urlpatterns = [
    # Wishlist management
    path('wishlist/', views.WishlistView.as_view(), name='wishlist'),
    path('wishlist/add/', views.AddToWishlistView.as_view(), name='add-to-wishlist'),
    path('wishlist/items/<int:item_id>/', views.WishlistItemDetailView.as_view(), name='wishlist-item-detail'),
    path('wishlist/items/<int:item_id>/remove/', views.RemoveFromWishlistView.as_view(), name='remove-from-wishlist'),
    path('wishlist/clear/', views.ClearWishlistView.as_view(), name='clear-wishlist'),
    
    # Wishlist utilities
    path('wishlist/check/<int:product_id>/', views.check_wishlist_status, name='check-wishlist-status'),
    path('wishlist/toggle/<int:product_id>/', views.toggle_wishlist, name='toggle-wishlist'),
]
