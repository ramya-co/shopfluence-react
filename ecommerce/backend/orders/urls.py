from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    # Cart management
    path('cart/', views.CartView.as_view(), name='cart'),
    path('cart/add/', views.AddToCartView.as_view(), name='add-to-cart'),
    path('cart/items/<int:item_id>/', views.UpdateCartItemView.as_view(), name='update-cart-item'),
    path('cart/items/<int:item_id>/remove/', views.RemoveFromCartView.as_view(), name='remove-from-cart'),
    path('cart/clear/', views.ClearCartView.as_view(), name='clear-cart'),
    
    # Orders
    path('orders/', views.OrderListView.as_view(), name='order-list'),
    path('orders/create/', views.CreateOrderView.as_view(), name='create-order'),
    path('orders/<int:pk>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<int:order_id>/cancel/', views.cancel_order, name='cancel-order'),
    
    # Checkout
    path('checkout/', views.CheckoutView.as_view(), name='checkout'),
]
