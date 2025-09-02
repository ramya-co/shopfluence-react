from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import connection
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer, UserProfileSerializer,
    AddressSerializer, ChangePasswordSerializer
)
from .models import Address

User = get_user_model()


class UserRegistrationView(generics.CreateAPIView):
    """User registration view"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email', '')
        
        # Normal registration flow first
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'User registered successfully',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }, status=status.HTTP_201_CREATED)
        else:
            # 🚨 BUG 4: User Enumeration vulnerability - Check if email exists
            if 'email' in serializer.errors and User.objects.filter(email=email).exists():
                # Return different error message for existing users (vulnerability)
                return Response({
                    'bug_found': 'USER_ENUMERATION',
                    'message': '🎉 Bug Found: User Enumeration via Registration!',
                    'description': 'Different error messages reveal existing users',
                    'points': 75,
                    'error': f'User with email {email} already exists'  # Vulnerable: specific error
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(generics.GenericAPIView):
    """User login view"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        
        # 🚨 BUG 1: SQL Injection vulnerability - CHECK FIRST (only for malicious input)
        if email and ("'" in email or " OR " in email.upper() or "--" in email):
            return Response({
                'bug_found': 'SQL_INJECTION_LOGIN',
                'message': '🎉 Bug Found: SQL Injection in Login!',
                'description': 'SQL injection vulnerability detected in login email field',
                'points': 100
            })
        
        # Normal login flow
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view - get and update profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.UpdateAPIView):
    """Change password view"""
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def update(self, request, *args, **kwargs):
        user = request.user
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({'message': 'Password changed successfully'})


class AddressListView(generics.ListCreateAPIView):
    """List and create user addresses"""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update and delete user address"""
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """Logout view - blacklist refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
        return Response({'message': 'Logged out successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def debug_info(request):
    """Debug info view - 🚨 BUG 2: Exposes secret key"""
    from django.conf import settings
    
    # Check if user is trying to access debug info
    if request.GET.get('debug') == 'true':
        return Response({
            'bug_found': 'JWT_SECRET_EXPOSURE',
            'message': '🎉 Bug Found: JWT Secret Key Exposed!',
            'description': 'Secret key exposed in debug endpoint',
            'points': 90,
            'secret_key': settings.SECRET_KEY  # Vulnerable: exposing secret
        })
    
    return Response({'message': 'Debug info'}, status=status.HTTP_200_OK)


# Add IDOR endpoint
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request, user_id):
    """🚨 BUG 5: IDOR - Get any user's profile by ID"""
    try:
        if int(user_id) != request.user.id:
            # Should check authorization but doesn't - this is the bug
            return Response({
                'bug_found': 'IDOR_PROFILE',
                'message': '🎉 Bug Found: Insecure Direct Object Reference!',
                'description': 'Can access other users profiles without authorization',
                'points': 95,
                'accessed_user_id': user_id,
                'your_user_id': request.user.id
            })
        
        user = User.objects.get(id=user_id)
        return Response(UserProfileSerializer(user).data)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)


# 🚨 BUG 3: Password Reset Token Reuse
used_reset_tokens = []

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def password_reset(request):
    """Password reset with token reuse vulnerability"""
    token = request.data.get('token', '')
    new_password = request.data.get('new_password', '')
    
    # Check if token was already used (vulnerability detection)
    if token in used_reset_tokens and token == 'reset_token_123':
        return Response({
            'bug_found': 'TOKEN_REUSE',
            'message': '🎉 Bug Found: Password Reset Token Reuse!',
            'description': 'Same reset token can be used multiple times',
            'points': 85
        })
    
    # Simulate successful password reset
    if token == 'reset_token_123':
        used_reset_tokens.append(token)  # Track but don't prevent reuse
        return Response({'message': 'Password reset successful'})
    
    return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


# 🚨 BUG 17: Information Disclosure
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info_disclosure(request):
    """User info endpoint with information disclosure"""
    include_sensitive = request.GET.get('include_sensitive', 'false')
    
    if include_sensitive.lower() == 'true':
        # This should not expose sensitive information
        users = User.objects.all()[:5]  # Get first 5 users
        user_data = []
        for user in users:
            user_data.append({
                'id': user.id,
                'email': user.email,
                'password': user.password,  # 🚨 Exposed password hash
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            })
        
        return Response({
            'bug_found': 'INFO_DISCLOSURE',
            'message': '🎉 Bug Found: Information Disclosure!',
            'description': 'Sensitive user information exposed in API response',
            'points': 85,
            'sensitive_data': user_data
        })
    
    return Response({'message': 'User info retrieved'})


# 🚨 BUG 32: Database Connection Info Leak
@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def db_connection_test(request):
    """Database connection test with info leak"""
    try:
        # Simulate database connection error
        force_error = request.GET.get('force_error', 'false')
        if force_error.lower() == 'true':
            from django.conf import settings
            db_config = settings.DATABASES['default']
            error_message = f"Database connection failed: host={db_config.get('HOST', 'localhost')}, " \
                          f"port={db_config.get('PORT', '5432')}, " \
                          f"user={db_config.get('USER', 'postgres')}, " \
                          f"password={db_config.get('PASSWORD', 'secret123')}"
            
            return Response({
                'bug_found': 'DB_INFO_LEAK',
                'message': '🎉 Bug Found: Database Connection Info Leak!',
                'description': 'Database connection details exposed in error message',
                'points': 80,
                'error': error_message
            })
    except Exception as e:
        return Response({'error': str(e)})
    
    return Response({'message': 'Database connection successful'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """Get current user info"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)