from django.urls import path
from . import views

app_name = 'products'

urlpatterns = [
    # Categories
    path('categories/', views.CategoryListView.as_view(), name='category-list'),
    path('categories/<slug:slug>/', views.CategoryDetailView.as_view(), name='category-detail'),
    
    # Brands
    path('brands/', views.BrandListView.as_view(), name='brand-list'),
    path('brands/<slug:slug>/', views.BrandDetailView.as_view(), name='brand-detail'),
    
    # Products
    path('products/', views.ProductListView.as_view(), name='product-list'),
    path('products/search/', views.ProductSearchView.as_view(), name='product-search'),
    path('products/search-xss/', views.search_products_xss, name='search-xss'),  # 🚨 BUG 6: XSS endpoint
    path('products/download/', views.download_file, name='download-file'),  # 🚨 BUG 10: Path traversal
    path('products/rate-test/', views.rate_limit_test, name='rate-test'),  # 🚨 BUG 16: Rate limiting
    path('products/<slug:slug>/', views.ProductDetailView.as_view(), name='product-detail'),
    
    # Special product lists
    path('products/featured/', views.FeaturedProductsView.as_view(), name='featured-products'),
    path('products/new-arrivals/', views.NewArrivalsView.as_view(), name='new-arrivals'),
    path('products/bestsellers/', views.BestsellersView.as_view(), name='bestsellers'),
    
    # Product reviews
    path('products/<slug:slug>/reviews/', views.ProductReviewsView.as_view(), name='product-reviews'),
    path('reviews/', views.UserReviewsView.as_view(), name='user-reviews'),
    path('reviews/<int:pk>/', views.ReviewDetailView.as_view(), name='review-detail'),
    
    # Statistics
    path('stats/', views.product_stats, name='product-stats'),
]
