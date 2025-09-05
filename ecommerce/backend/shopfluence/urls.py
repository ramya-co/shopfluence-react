"""
URL configuration for shopfluence project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('products.urls')),
    # Make sure this line exists:
    path('api/auth/', include('accounts.urls')),
    path('api/', include('orders.urls')),
    path('api/', include('wishlist.urls')),
     path('api/products/', include('products.urls')),  # This should exist
    
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
