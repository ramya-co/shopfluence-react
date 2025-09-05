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


# 🚨 BUG 17: IDOR - Delete Other People's Reviews
@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_review_vulnerable(request, review_id):
    """Vulnerable endpoint that allows deleting any review (IDOR)"""
    try:
        # VULNERABLE: No ownership check - anyone can delete any review
        review = get_object_or_404(Review, id=review_id)
        review_owner = review.user.username if review.user else 'Anonymous'
        current_user = request.user.username
        
        # Delete the review without checking ownership
        review.delete()
        
        # If different users, it's an IDOR bug
        if review_owner != current_user:
            return Response({
                'bug_found': 'IDOR_REVIEW_DELETE',
                'message': 'Bug Found: Unauthorized Review Deletion Detected!',
                'description': f'User {current_user} deleted review by {review_owner}',
                'points': 90,
                'deleted_review_id': review_id,
                'original_owner': review_owner,
                'deleting_user': current_user
            })
        else:
            return Response({
                'message': 'Review deleted successfully',
                'deleted_review_id': review_id
            })
            
    except Exception as e:
        return Response({
            'error': 'Failed to delete review',
            'detail': str(e)
        }, status=status.HTTP_400_BAD_REQUEST)


# 🚨 BUG 18: XXE in Product Import
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])  # Should be admin only, but we'll make it less secure
def import_products_xml(request):
    """Vulnerable XML import endpoint (XXE)"""
    try:
        xml_data = request.data.get('xml_content', '')
        
        if not xml_data:
            return Response({
                'error': 'No XML content provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check for XXE attack patterns
        xxe_patterns = [
            '<!ENTITY',
            'SYSTEM',
            'file://',
            '/etc/passwd',
            'ENTITY % dtd',
            'PUBLIC'
        ]
        
        xml_content_upper = xml_data.upper()
        detected_patterns = []
        
        for pattern in xxe_patterns:
            if pattern.upper() in xml_content_upper:
                detected_patterns.append(pattern)
        
        if detected_patterns:
            return Response({
                'bug_found': 'XXE_INJECTION',
                'message': 'Bug Found: XXE Vulnerability in Product Import!',
                'description': f'XML External Entity injection detected: {", ".join(detected_patterns)}',
                'points': 95,
                'detected_patterns': detected_patterns,
                'xml_preview': xml_data[:200] + '...' if len(xml_data) > 200 else xml_data
            })
        else:
            return Response({
                'message': 'XML processed successfully',
                'status': 'No products imported (demo mode)'
            })
            
    except Exception as e:
        return Response({
            'error': 'XML processing failed',
            'detail': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🚨 BUG 19: Second-Order SQL Injection
stored_search_terms = {}  # Simulate database storage

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def store_search_term(request):
    """Store search term for analytics (vulnerable to second-order SQL injection)"""
    search_term = request.data.get('search_term', '')
    user_ip = request.META.get('REMOTE_ADDR', 'unknown')
    
    if not search_term:
        return Response({'error': 'No search term provided'}, status=400)
    
    # Store the search term (in real app, this would go to database)
    if user_ip not in stored_search_terms:
        stored_search_terms[user_ip] = []
    
    stored_search_terms[user_ip].append(search_term)
    
    return Response({
        'message': 'Search term stored for analytics',
        'stored_term': search_term
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def get_popular_searches(request):
    """Get popular searches (vulnerable to second-order SQL injection)"""
    try:
        # Simulate SQL injection vulnerability when processing stored terms
        sql_injection_patterns = [
            "' OR '1'='1",
            "'; DROP TABLE",
            "' UNION SELECT",
            "' AND 1=1--",
            "' OR 1=1#",
            "'; INSERT INTO",
            "' OR SLEEP(5)--"
        ]
        
        # Check all stored search terms for SQL injection patterns
        detected_injections = []
        for user_ip, terms in stored_search_terms.items():
            for term in terms:
                for pattern in sql_injection_patterns:
                    if pattern.lower() in term.lower():
                        detected_injections.append({
                            'term': term,
                            'pattern': pattern,
                            'user_ip': user_ip
                        })
        
        if detected_injections:
            return Response({
                'bug_found': 'SECOND_ORDER_SQL_INJECTION',
                'message': 'Bug Found: Second-Order SQL Injection Detected!',
                'description': f'Malicious SQL payload stored and executed: {detected_injections[0]["pattern"]}',
                'points': 100,
                'detected_injections': detected_injections[:3],  # Limit to first 3
                'total_detections': len(detected_injections)
            })
        else:
            # Return normal response
            all_terms = []
            for terms in stored_search_terms.values():
                all_terms.extend(terms)
            
            return Response({
                'message': 'Popular searches retrieved',
                'search_terms': all_terms[-10:],  # Last 10 terms
                'total_stored': len(all_terms)
            })
            
    except Exception as e:
        return Response({
            'error': 'Failed to retrieve popular searches',
            'detail': str(e)
        }, status=500)

# ============ IDOR Admin Panel Vulnerability ============

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_panel(request):
    """
    Vulnerable admin panel endpoint - returns sensitive admin data without proper authorization
    This demonstrates IDOR (Insecure Direct Object Reference) vulnerability
    """
    # No authentication or authorization check!
    admin_data = {
        'bug_found': 'IDOR_ADMIN_PANEL',
        'message': 'Bug Found: IDOR Admin Panel Access!',
        'description': 'Unauthorized access to admin panel - sensitive data exposed without proper authentication',
        'points': 120,
        'admin_panel': {
            'system_info': {
                'server_version': 'Django 4.2.7',
                'database': 'shopfluence_prod',
                'secret_key': 'django-insecure-admin-key-123456',
                'debug_mode': False,
                'admin_users_count': 3
            },
            'recent_admin_actions': [
                {'action': 'User password reset', 'admin': 'admin@shopfluence.com', 'timestamp': '2024-01-15 14:30:22'},
                {'action': 'Product deletion', 'admin': 'superuser@shopfluence.com', 'timestamp': '2024-01-15 13:45:10'},
                {'action': 'Database backup', 'admin': 'admin@shopfluence.com', 'timestamp': '2024-01-15 12:15:33'}
            ],
            'security_settings': {
                'two_factor_enabled': False,
                'session_timeout': 3600,
                'password_policy': 'weak',
                'login_attempts_limit': None
            }
        }
    }
    
    return Response(admin_data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_users(request):
    """
    Vulnerable admin users endpoint - exposes user management data
    """
    # No authentication or authorization check!
    users_data = {
        'bug_found': 'IDOR_ADMIN_USERS',
        'message': 'Bug Found: IDOR Admin Users Access!',
        'description': 'Unauthorized access to user management data - sensitive user information exposed',
        'points': 110,
        'admin_users': {
            'total_users': 1247,
            'admin_users': [
                {
                    'id': 1,
                    'username': 'admin',
                    'email': 'admin@shopfluence.com',
                    'password_hash': '$2b$12$rQjHVx.../dummy_hash_123',
                    'last_login': '2024-01-15 15:22:11',
                    'is_superuser': True,
                    'permissions': ['all_access']
                },
                {
                    'id': 2,
                    'username': 'superuser',
                    'email': 'superuser@shopfluence.com',
                    'password_hash': '$2b$12$aB3Dx.../dummy_hash_456',
                    'last_login': '2024-01-15 14:55:33',
                    'is_superuser': True,
                    'permissions': ['user_management', 'product_management']
                }
            ],
            'recent_user_activities': [
                {'user_id': 123, 'action': 'purchase', 'amount': '$299.99', 'timestamp': '2024-01-15 15:20:44'},
                {'user_id': 456, 'action': 'profile_update', 'sensitive_data': 'Credit card ending 4567', 'timestamp': '2024-01-15 15:18:22'},
                {'user_id': 789, 'action': 'password_change', 'ip_address': '192.168.1.100', 'timestamp': '2024-01-15 15:15:10'}
            ]
        }
    }
    
    return Response(users_data)

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def admin_settings(request):
    """
    Vulnerable admin settings endpoint - exposes system configuration
    """
    # No authentication or authorization check!
    settings_data = {
        'bug_found': 'IDOR_ADMIN_SETTINGS',
        'message': 'Bug Found: IDOR Admin Settings Access!',
        'description': 'Unauthorized access to system settings - critical configuration data exposed',
        'points': 130,
        'admin_settings': {
            'database_config': {
                'host': 'prod-db.shopfluence.com',
                'port': 5432,
                'username': 'admin_user',
                'password': 'prod_db_password_123',
                'database_name': 'shopfluence_production'
            },
            'api_keys': {
                'stripe_secret': 'sk_live_51234567890abcdef',
                'aws_access_key': 'AKIA1234567890ABCDEF',
                'aws_secret_key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYzEXAMPLEKEY',
                'email_service_key': 'SG.1234567890abcdef.ghijklmnop'
            },
            'security_config': {
                'csrf_protection': False,
                'ssl_required': False,
                'rate_limiting': False,
                'audit_logging': False,
                'encryption_key': 'unsafe_encryption_key_12345'
            },
            'business_metrics': {
                'daily_revenue': '$45,678.90',
                'total_customers': 12470,
                'conversion_rate': '3.2%',
                'top_selling_products': ['iPhone 15', 'MacBook Pro', 'AirPods Pro']
            }
        }
    }
    
    return Response(settings_data)