from rest_framework import generics, permissions, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg, Count
import time
from .models import Category, Brand, Product, Review
from .serializers import (
    CategorySerializer, BrandSerializer, ProductSerializer, ProductListSerializer,
    ProductDetailSerializer, ReviewCreateSerializer, ReviewSerializer
)


class CategoryListView(generics.ListAPIView):
    """List all categories"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CategoryDetailView(generics.RetrieveAPIView):
    """Retrieve a specific category"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class BrandListView(generics.ListAPIView):
    """List all brands"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    permission_classes = [permissions.AllowAny]


class BrandDetailView(generics.RetrieveAPIView):
    """Retrieve a specific brand"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]


class ProductListView(generics.ListAPIView):
    """List all products with filtering and search"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category__slug', 'brand__slug', 'is_featured', 'is_new_arrival', 'is_bestseller']
    search_fields = ['name', 'description', 'brand__name', 'category__name']
    ordering_fields = ['price', 'created_at', 'average_rating']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images')
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by rating
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=min_rating)
        
        # Filter by stock availability
        in_stock_only = self.request.query_params.get('in_stock_only')
        if in_stock_only == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
        
        return queryset


class ProductDetailView(generics.RetrieveAPIView):
    """Retrieve a specific product"""
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related(
            'images', 'specifications', 'reviews'
        )


class ProductSearchView(generics.ListAPIView):
    """Search products with advanced filtering"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related('images')
        
        # Search query
        query = self.request.query_params.get('q', '')
        
        # 🚨 BUG 6: XSS vulnerability detection
        if '<script>' in query.lower() or 'javascript:' in query.lower() or 'alert(' in query.lower():
            # This would normally be dangerous, but we'll just detect it
            from rest_framework.response import Response
            return Product.objects.none()  # Return empty queryset for now
        
        if query:
            queryset = queryset.filter(
                Q(name__icontains=query) |
                Q(description__icontains=query) |
                Q(brand__name__icontains=query) |
                Q(category__name__icontains=query)
            )
        
        # Category filter
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)
        
        # Brand filter
        brands = self.request.query_params.getlist('brands')
        if brands:
            queryset = queryset.filter(brand__slug__in=brands)
        
        # Price range filter
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Rating filter
        min_rating = self.request.query_params.get('min_rating')
        if min_rating:
            queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).filter(avg_rating__gte=min_rating)
        
        # Stock filter
        in_stock_only = self.request.query_params.get('in_stock_only')
        if in_stock_only == 'true':
            queryset = queryset.filter(stock_quantity__gt=0)
        
        # Sort options
        sort_by = self.request.query_params.get('sort_by', 'featured')
        if sort_by == 'price-low':
            queryset = queryset.order_by('price')
        elif sort_by == 'price-high':
            queryset = queryset.order_by('-price')
        elif sort_by == 'rating':
            queryset = queryset.annotate(avg_rating=Avg('reviews__rating')).order_by('-avg_rating')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'name':
            queryset = queryset.order_by('name')
        else:  # featured
            queryset = queryset.order_by('-is_featured', '-is_bestseller', '-created_at')
        
        return queryset


class FeaturedProductsView(generics.ListAPIView):
    """Get featured products"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_featured=True
        ).select_related('category', 'brand').prefetch_related('images')[:8]


class NewArrivalsView(generics.ListAPIView):
    """Get new arrival products"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_new_arrival=True
        ).select_related('category', 'brand').prefetch_related('images')[:8]


class BestsellersView(generics.ListAPIView):
    """Get bestseller products"""
    serializer_class = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_bestseller=True
        ).select_related('category', 'brand').prefetch_related('images')[:8]


class ProductReviewsView(generics.ListCreateAPIView):
    """List and create product reviews"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        product_slug = self.kwargs.get('slug')
        product = get_object_or_404(Product, slug=product_slug, is_active=True)
        return Review.objects.filter(product=product, is_approved=True).select_related('user')

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        product_slug = self.kwargs.get('slug')
        context['product'] = get_object_or_404(Product, slug=product_slug, is_active=True)
        return context

    def perform_create(self, serializer):
        """Override to ensure proper review creation and response"""
        review = serializer.save()
        # Review is auto-approved (default=True in model)
        return review


class UserReviewsView(generics.ListAPIView):
    """List all reviews by the authenticated user"""
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user).select_related('product')


class ReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a specific review (only by the author)"""
    serializer_class = ReviewCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Review.objects.filter(user=self.request.user)

    def get_object(self):
        review = super().get_object()
        # Ensure user can only access their own reviews
        if review.user != self.request.user:
            raise PermissionDenied("You can only modify your own reviews")
        return review


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def product_stats(request):
    """Get product statistics"""
    total_products = Product.objects.filter(is_active=True).count()
    total_categories = Category.objects.filter(is_active=True).count()
    total_brands = Brand.objects.filter(is_active=True).count()
    
    # Get products by category
    category_stats = Category.objects.filter(is_active=True).annotate(
        product_count=Count('products', filter=Q(products__is_active=True))
    ).values('name', 'product_count')
    
    # Get average rating by category
    rating_stats = Category.objects.filter(is_active=True).annotate(
        avg_rating=Avg('products__reviews__rating')
    ).values('name', 'avg_rating')
    
    return Response({
        'total_products': total_products,
        'total_categories': total_categories,
        'total_brands': total_brands,
        'category_stats': list(category_stats),
        'rating_stats': list(rating_stats),
    })


# 🚨 BUG 6: XSS Detection Endpoint
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def search_products_xss(request):
    """Search endpoint that's vulnerable to XSS"""
    query = request.GET.get('q', '')
    
    # Detect XSS attempt
    if '<script>' in query.lower() or 'javascript:' in query.lower() or 'alert(' in query.lower():
        return Response({
            'bug_found': 'XSS_SEARCH',
            'message': 'Bug Found: Cross-Site Scripting (XSS)!',
            'description': 'XSS payload detected in search query',
            'points': 85,
            'payload': query
        })
    
    # Normal search
    products = Product.objects.filter(name__icontains=query)[:10]
    serializer = ProductListSerializer(products, many=True)
    return Response(serializer.data)


# 🚨 BUG 10: Path Traversal in File Download
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def download_file(request):
    """File download endpoint with path traversal vulnerability"""
    file_path = request.GET.get('file', '')
    
    # Detect path traversal attempt
    if '../' in file_path or file_path.startswith('/') or 'etc/passwd' in file_path:
        return Response({
            'bug_found': 'PATH_TRAVERSAL',
            'message': 'Bug Found: Path Traversal!',
            'description': 'Directory traversal vulnerability detected',
            'points': 90,
            'attempted_path': file_path
        })
    
    # Normal file serving (simulated)
    return Response({'message': f'File {file_path} downloaded successfully'})


# 🚨 BUG 16: Rate Limiting Detection
request_counts = {}

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def rate_limit_test(request):
    """Endpoint to test rate limiting"""
    client_ip = request.META.get('REMOTE_ADDR', 'unknown')
    current_time = int(time.time())
    
    # Initialize or update request count
    if client_ip not in request_counts:
        request_counts[client_ip] = {'count': 1, 'start_time': current_time}
    else:
        # Reset counter if more than 60 seconds passed
        if current_time - request_counts[client_ip]['start_time'] > 60:
            request_counts[client_ip] = {'count': 1, 'start_time': current_time}
        else:
            request_counts[client_ip]['count'] += 1
    
    # Check if rate limit exceeded
    if request_counts[client_ip]['count'] > 100:
        return Response({
            'bug_found': 'RATE_LIMIT_BYPASS',
            'message': 'Bug Found: Rate Limiting Bypass!',
            'description': 'No rate limiting implemented',
            'points': 70,
            'requests_count': request_counts[client_ip]['count']
        })
    
    return Response({
        'message': 'Request processed',
        'count': request_counts[client_ip]['count']
    })
