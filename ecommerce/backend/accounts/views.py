from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db import connection
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime
import requests
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
                    'message': 'Bug Found: User Enumeration via Registration!',
                    'description': 'Different error messages reveal existing users',
                    'points': 75,
                    'error': f'User with email {email} already exists'  # Vulnerable: specific error
                }, status=status.HTTP_400_BAD_REQUEST)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLoginView(generics.GenericAPIView):
    """User login view"""
    serializer_class = UserLoginSerializer
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """Handle GET requests to login endpoint with next parameter"""
        next_url = request.GET.get('next', '')
        
        # If user is already authenticated and next URL is provided
        if request.user.is_authenticated and next_url:
            # Check for open redirect vulnerability
            if self.is_open_redirect_vulnerable(next_url):
                # Create bug notification response
                from django.http import HttpResponseRedirect
                
                # Record the bug in leaderboard
                self.record_open_redirect_bug(request, next_url)
                
                # Perform the vulnerable redirect
                return HttpResponseRedirect(next_url)
            
            # Safe redirect for whitelisted URLs
            from django.http import HttpResponseRedirect
            return HttpResponseRedirect(next_url)
        
        # Return login page info for frontend
        return Response({
            'message': 'Login page',
            'next': next_url if next_url else None
        })

    def post(self, request):
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        next_url = request.data.get('next', '')  # Get next parameter from request data
        
        # Get client IP for tracking failed attempts
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')
        
        # 🚨 BUG: Session Fixation Attack - Check for fixed session ID BEFORE login
        sessionid_cookie = request.COOKIES.get('sessionid', '')
        print(f"DEBUG: Received sessionid cookie: '{sessionid_cookie}'")  # Debug log
        if sessionid_cookie and ('attacker' in sessionid_cookie.lower() or 'fixed' in sessionid_cookie.lower() or 'controlled' in sessionid_cookie.lower()):
            # Session fixation vulnerability detected!
            print(f"DEBUG: Session fixation detected with cookie: {sessionid_cookie}")  # Debug log
            try:
                import requests
                from django.utils import timezone
                
                # Record bug in leaderboard
                leaderboard_data = {
                    'bug_type': 'SESSION_FIXATION',
                    'user_email': 'participant@example.com',
                    'vulnerability_type': 'Session Fixation Attack',
                    'severity': 'High',
                    'description': f'Session fixation vulnerability detected - attacker-controlled session ID: {sessionid_cookie}',
                    'points': 95,
                    'timestamp': timezone.now().isoformat()
                }
                
                # Send to leaderboard service
                response = requests.post('http://localhost:8002/api/record-bug/', json=leaderboard_data, timeout=5)
            except Exception as e:
                print(f"Failed to record bug in leaderboard: {e}")
            
            return Response({
                'bug_found': 'SESSION_FIXATION',
                'message': '🎉 Session fixation vulnerability detected!',
                'description': f'Attacker-controlled session ID detected before login: {sessionid_cookie}',
                'points': 95,
                'vulnerability_type': 'Session Fixation Attack',
                'severity': 'High',
                'session_id': sessionid_cookie
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 🚨 BUG 1: SQL Injection vulnerability - CHECK FIRST (only for malicious input)
        if email and ("'" in email or " OR " in email.upper() or "--" in email):
            return Response({
                'bug_found': 'SQL_INJECTION_LOGIN',
                'message': 'Bug Found: SQL Injection in Login!',
                'description': 'SQL injection vulnerability detected in login email field',
                'points': 100
            })
        
        # 🚨 BUG: Rate Limiting - Track failed login attempts
        from django.core.cache import cache
        cache_key = f"failed_login_{email}_{ip}"
        failed_attempts = cache.get(cache_key, 0)
        
        # Normal login flow
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Clear failed attempts on successful login
            cache.delete(cache_key)
            
            refresh = RefreshToken.for_user(user)
            
            # 🚨 BUG 6: Open Redirect - Check for vulnerable redirect
            if next_url and self.is_open_redirect_vulnerable(next_url):
                return Response({
                    'bug_found': 'OPEN_REDIRECT',
                    'message': 'Open Redirect detected!',
                    'description': 'Login endpoint accepts external URLs in next parameter causing open redirect vulnerability',
                    'points': 90,
                    'redirect_to': next_url,
                    'user': UserProfileSerializer(user).data,
                    'tokens': {
                        'access': str(refresh.access_token),
                        'refresh': str(refresh),
                    }
                })
            
            response_data = {
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            }
            
            # Add redirect URL to response if provided
            if next_url:
                response_data['redirect_to'] = next_url
            
            return Response(response_data)
        else:
            # Failed login - increment attempt counter
            failed_attempts += 1
            cache.set(cache_key, failed_attempts, 300)  # Cache for 5 minutes
            
            # 🚨 BUG: No Rate Limiting - Check if vulnerability should be triggered (10+ attempts)
            if failed_attempts >= 10:
                # Try to record the bug in leaderboard
                try:
                    leaderboard_data = {
                        'bug_type': 'NO_RATE_LIMITING',
                        'user_email': 'participant@example.com',  # Default for demonstration
                        'vulnerability_type': 'No Rate Limiting',
                        'severity': 'Medium',
                        'description': f'Login endpoint allows unlimited failed attempts ({failed_attempts} attempts without rate limiting)',
                        'points': 85,
                        'timestamp': timezone.now().isoformat()
                    }
                    
                    # Send to leaderboard service
                    response = requests.post('http://localhost:8002/api/record-bug/', json=leaderboard_data, timeout=5)
                except Exception as e:
                    print(f"Failed to record bug in leaderboard: {e}")
                
                # Return rate limiting vulnerability response
                return Response({
                    'bug_found': 'NO_RATE_LIMITING',
                    'message': f'🎉 No Rate Limiting detected after {failed_attempts} failed attempts!',
                    'description': 'Login endpoint allows unlimited password attempts without rate limiting or account lockout',
                    'points': 85,
                    'vulnerability_type': 'No Rate Limiting',
                    'severity': 'Medium',
                    'failed_attempts': failed_attempts,
                    'email': email
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Normal failed login response - preserve original error structure
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def is_open_redirect_vulnerable(self, next_url):
        """Check if the next URL is vulnerable to open redirect attack"""
        if not next_url:
            return False
            
        # Check if URL is absolute (starts with http:// or https://)
        if not (next_url.startswith('http://') or next_url.startswith('https://')):
            return False
            
        # Extract host from URL
        try:
            from urllib.parse import urlparse
            parsed = urlparse(next_url)
            host = parsed.netloc.lower()
            
            # Whitelist of allowed hosts
            allowed_hosts = [
                'localhost',
                '127.0.0.1',
                'localhost:3000',
                'localhost:5173',
                'localhost:8000',
                '127.0.0.1:3000',
                '127.0.0.1:5173',
                '127.0.0.1:8000'
            ]
            
            # If host is whitelisted, not vulnerable
            if host in allowed_hosts:
                return False
                
            # Check for the bb_open_redirect=1 marker (guardrail)
            if 'bb_open_redirect=1' in next_url:
                return True
                
        except Exception:
            pass
            
        return False
    
    def record_open_redirect_bug(self, request, next_url):
        """Record the open redirect bug for leaderboard"""
        try:
            import requests
            from django.conf import settings
            
            # Try to get user ID from session or generate anonymous ID
            user_id = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_id = request.user.id
            else:
                user_id = f"guest_{request.session.session_key or 'anonymous'}"
            
            # Record bug in leaderboard
            leaderboard_data = {
                'user_id': user_id,
                'bug_type': 'OPEN_REDIRECT',
                'description': f'Open redirect vulnerability exploited with URL: {next_url}',
                'points': 90,
                'timestamp': timezone.now().isoformat()
            }
            
            # Send to leaderboard service
            requests.post('http://localhost:8001/api/record-bug/', json=leaderboard_data, timeout=5)
        except Exception as e:
            # Silently fail - don't break the redirect
            print(f"Failed to record bug: {e}")
            pass


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
            'message': 'Bug Found: JWT Secret Key Exposed!',
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
                'message': 'Bug Found: Insecure Direct Object Reference!',
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
            'message': 'Bug Found: Password Reset Token Reuse!',
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
            'message': 'Bug Found: Information Disclosure!',
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
                'message': 'Bug Found: Database Connection Info Leak!',
                'description': 'Database connection details exposed in error message',
                'points': 80,
                'error': error_message
            })
    except Exception as e:
        return Response({'error': str(e)})
    
    return Response({'message': 'Database connection successful'})


# 🚨 BUG 6: Open Redirect - Traditional login redirect endpoint
@api_view(['GET', 'POST'])
@permission_classes([permissions.AllowAny])
def login_redirect_view(request):
    """
    Traditional login redirect endpoint that demonstrates open redirect vulnerability
    This simulates how many web applications handle login flows with redirects
    """
    next_url = request.GET.get('next', request.POST.get('next', ''))
    
    if request.method == 'GET':
        # GET request - for logged in users, immediately redirect (this is the vulnerable behavior)
        if next_url and request.user.is_authenticated:
            return handle_login_redirect(request, next_url)
        elif next_url:
            # User not logged in, but we'll still show the login form with next parameter
            return Response({
                'message': 'Please log in to continue',
                'next': next_url,
                'login_url': f'/login?next={next_url}',
                'action': 'redirect_after_login'
            })
        
        # No next parameter, just show login page
        return Response({
            'message': 'Login page',
            'action': 'normal_login'
        })
    
    elif request.method == 'POST':
        # POST request - handle login and redirect
        email = request.data.get('email', '')
        password = request.data.get('password', '')
        
        if not email or not password:
            return Response({
                'error': 'Email and password are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Authenticate user (simplified)
        from django.contrib.auth import authenticate
        user = authenticate(request, username=email, password=password)
        
        if user:
            # Login successful, handle redirect
            from rest_framework_simplejwt.tokens import RefreshToken
            refresh = RefreshToken.for_user(user)
            
            # If next URL is provided, handle the redirect
            if next_url:
                return handle_login_redirect(request, next_url, user, refresh)
            
            # No redirect, return normal login response
            return Response({
                'message': 'Login successful',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        else:
            return Response({
                'error': 'Invalid credentials'
            }, status=status.HTTP_400_BAD_REQUEST)


def handle_login_redirect(request, next_url, user=None, refresh=None):
    """Handle the redirect logic and vulnerability detection"""
    from django.http import HttpResponseRedirect
    from urllib.parse import urlparse
    import requests
    
    # Check if this is a vulnerable open redirect
    if is_open_redirect_vulnerable_detailed(next_url):
        # Record the bug discovery
        try:
            user_id = user.id if user else getattr(request.user, 'id', 'anonymous')
            
            # Record bug in leaderboard
            leaderboard_data = {
                'user_id': user_id,
                'bug_type': 'OPEN_REDIRECT',
                'description': f'Open redirect vulnerability exploited with URL: {next_url}',
                'points': 90,
                'timestamp': timezone.now().isoformat()
            }
            
            # Try to send to leaderboard service
            try:
                requests.post('http://localhost:8001/api/record-bug/', json=leaderboard_data, timeout=5)
            except:
                pass  # Silently fail
                
        except Exception:
            pass  # Don't break redirect on error
        
        # Return the bug notification AND perform the redirect
        response_data = {
            'bug_found': 'OPEN_REDIRECT',
            'message': 'Open Redirect detected!',
            'description': 'Login endpoint accepts external URLs in next parameter causing open redirect vulnerability',
            'points': 90,
            'redirect_url': next_url,
            'status': 'redirect'
        }
        
        # If user data is available, include it
        if user and refresh:
            response_data.update({
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                }
            })
        
        # For API responses, return the data with redirect information
        if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
            response_data['redirect_to'] = next_url
            return Response(response_data)
        
        # For browser requests, perform actual HTTP redirect
        return HttpResponseRedirect(next_url)
    
    # Safe redirect for whitelisted URLs or relative paths
    if request.headers.get('Content-Type') == 'application/json' or request.path.startswith('/api/'):
        return Response({
            'message': 'Redirecting to safe URL',
            'redirect_to': next_url
        })
    
    return HttpResponseRedirect(next_url)


def is_open_redirect_vulnerable_detailed(next_url):
    """Enhanced vulnerability check for open redirect"""
    if not next_url:
        return False
    
    # Check if URL is absolute (starts with http:// or https://)
    if not (next_url.startswith('http://') or next_url.startswith('https://')):
        return False
    
    try:
        from urllib.parse import urlparse
        parsed = urlparse(next_url)
        host = parsed.netloc.lower()
        
        # Whitelist of allowed hosts
        allowed_hosts = [
            'localhost',
            '127.0.0.1',
            'localhost:3000',
            'localhost:5173',
            'localhost:8000',
            'localhost:8001',
            '127.0.0.1:3000',
            '127.0.0.1:5173',
            '127.0.0.1:8000',
            '127.0.0.1:8001'
        ]
        
        # If host is whitelisted, not vulnerable
        if host in allowed_hosts:
            return False
        
        # Check for the bb_open_redirect=1 marker (guardrail to prevent accidental triggers)
        if 'bb_open_redirect=1' in next_url:
            return True
            
        # Also check for common attacker domains (for demonstration)
        dangerous_hosts = [
            'attacker.example',
            'malicious-site.com',
            'evil.com',
            'phishing-site.net'
        ]
        
        if any(dangerous in host for dangerous in dangerous_hosts):
            return True
            
    except Exception:
        pass
    
    return False


# 🚨 BUG: Privilege Escalation - Vulnerable role setting endpoint
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_user_role(request):
    """
    🚨 VULNERABILITY: Privilege Escalation via API Endpoint
    
    This endpoint allows ANY authenticated user to change their role to admin!
    No authorization checks - major security flaw!
    """
    
    try:
        user = request.user
        new_role = request.data.get('role', '').lower()
        
        # 🚨 CRITICAL VULNERABILITY: No authorization check!
        # Any authenticated user can become admin
        
        if new_role == 'admin':
            user.is_staff = True
            user.is_superuser = True
            user.save()
            
            # Record the privilege escalation bug
            try:
                import requests
                from django.utils import timezone
                
                # Record bug in leaderboard
                leaderboard_data = {
                    'user_id': user.id,
                    'bug_type': 'PRIVILEGE_ESCALATION',
                    'description': f'User {user.email} escalated privileges to admin via unprotected API endpoint',
                    'points': 120,
                    'timestamp': timezone.now().isoformat()
                }
                
                # Send to leaderboard service
                requests.post('http://localhost:8002/api/record-bug/', json=leaderboard_data, timeout=5)
            except Exception as e:
                # Don't break the exploit if leaderboard fails
                pass
            
            return Response({
                'bug_found': 'PRIVILEGE_ESCALATION',
                'message': '🎉 Privilege Escalation detected!',
                'description': 'Successfully escalated privileges to admin via unprotected API endpoint',
                'points': 120,
                'vulnerability_type': 'Privilege Escalation',
                'severity': 'Critical',
                'user_role': 'admin',
                'user_id': user.id,
                'user_email': user.email,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'success': True
            })
            
        elif new_role == 'user':
            user.is_staff = False
            user.is_superuser = False
            user.save()
            
            return Response({
                'message': 'Role updated successfully',
                'user_role': 'user',
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
                'success': True
            })
            
        else:
            return Response({
                'error': 'Invalid role. Use "admin" or "user"',
                'available_roles': ['admin', 'user']
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Exception as e:
        return Response({
            'error': f'Failed to update role: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Original user info function
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_info(request):
    """Get current user info"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def vulnerable_login_redirect(request):
    """Intentionally vulnerable login redirect for testing Open Redirect bug"""
    
    if request.method == 'POST':
        next_url = request.data.get('next', '/')
    else:
        next_url = request.GET.get('next', '/')
    
    # Vulnerable redirect logic - no validation!
    if next_url and (next_url.startswith('http://') or next_url.startswith('https://')):
        # Check if it's not localhost (to avoid false positives)
        whitelisted_domains = ['localhost', '127.0.0.1']
        is_whitelisted = any(domain in next_url for domain in whitelisted_domains)
        
        if not is_whitelisted and 'bb_open_redirect=1' in next_url:
            # Bug detected!
            return Response({
                'bug_found': 'OPEN_REDIRECT',
                'message': 'Open Redirect detected!',
                'description': f'Vulnerable redirect to external URL: {next_url[:50]}...',
                'points': 90,
                'redirect_to': next_url,
                'vulnerability_type': 'Open Redirect',
                'severity': 'Medium',
                'login_status': 'success',
                'access_token': 'fake_token_for_demo'
            })
    
    # Normal response
    return Response({
        'login_status': 'success',
        'redirect_to': next_url,
        'message': 'Login successful'
    })


# 🚨 BUG: No Rate Limiting - Bug recording endpoint  
@api_view(['POST'])
@permission_classes([AllowAny])
def record_rate_limiting_bug(request):
    """Record rate limiting bug when 10+ failed attempts detected"""
    try:
        attempt_count = request.data.get('attempt_count', 0)
        email = request.data.get('email', 'unknown@example.com')
        
        if attempt_count >= 10:
            # Record bug in leaderboard
            leaderboard_data = {
                'bug_type': 'NO_RATE_LIMITING',
                'user_email': 'participant@example.com',  # Default for demonstration
                'vulnerability_type': 'No Rate Limiting',
                'severity': 'Medium',
                'description': f'Login endpoint allows unlimited failed attempts ({attempt_count} attempts without rate limiting)',
                'points': 85,
                'timestamp': timezone.now().isoformat()
            }
            
            # Send to leaderboard service
            try:
                response = requests.post('http://localhost:8002/api/record-bug/', json=leaderboard_data, timeout=5)
                if response.status_code == 200:
                    return Response({
                        'bug_found': 'NO_RATE_LIMITING',
                        'message': f'🎉 No Rate Limiting detected after {attempt_count} failed attempts!',
                        'description': 'Login endpoint allows unlimited password attempts without rate limiting or account lockout',
                        'points': 85,
                        'vulnerability_type': 'No Rate Limiting',
                        'severity': 'Medium',
                        'status': 'recorded',
                        'attempt_count': attempt_count
                    })
            except Exception as e:
                print(f"Failed to record bug in leaderboard: {e}")
            
            # Return success even if leaderboard fails
            return Response({
                'bug_found': 'NO_RATE_LIMITING',
                'message': f'🎉 No Rate Limiting detected after {attempt_count} failed attempts!',
                'description': 'Login endpoint allows unlimited password attempts without rate limiting or account lockout',
                'points': 85,
                'vulnerability_type': 'No Rate Limiting',
                'severity': 'Medium',
                'status': 'local',
                'attempt_count': attempt_count
            })
        else:
            return Response({
                'message': f'Only {attempt_count} attempts recorded. Need 10+ for bug detection.'
            })
            
    except Exception as e:
        return Response({
            'error': f'Failed to record rate limiting bug: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# 🚨 BUG: Clickjacking Exposure - Bug recording endpoint
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def record_bug_endpoint(request):
    """Bug recording endpoint for client-side vulnerability detection"""
    
    bug_type = request.GET.get('bug') or request.data.get('bug')
    mark = request.GET.get('mark') or request.data.get('mark')
    
    # Only accept clickjacking bugs with proper mark
    if bug_type == 'clickjack' and mark == '1':
        try:
            import requests
            from django.utils import timezone
            
            # Try to get user ID from session or generate anonymous ID
            user_id = None
            if hasattr(request, 'user') and request.user.is_authenticated:
                user_id = request.user.id
            else:
                user_id = f"guest_{request.session.session_key or 'anonymous'}"
            
            # Record bug in leaderboard
            leaderboard_data = {
                'user_id': user_id,
                'bug_type': 'CLICKJACKING',
                'description': 'Clickjacking vulnerability - site can be embedded in iframe without proper frame protection',
                'points': 100,
                'timestamp': timezone.now().isoformat()
            }
            
            # Send to leaderboard service
            try:
                response = requests.post('http://localhost:8002/api/record-bug/', json=leaderboard_data, timeout=5)
                if response.status_code == 200:
                    return Response({
                        'bug_found': 'CLICKJACKING',
                        'message': '🎉 Clickjacking exposure detected!',
                        'description': 'Site can be embedded in iframe without proper frame protection',
                        'points': 100,
                        'vulnerability_type': 'Clickjacking',
                        'severity': 'Medium',
                        'status': 'recorded'
                    })
            except Exception as e:
                print(f"Failed to record bug in leaderboard: {e}")
            
            # Return success even if leaderboard fails
            return Response({
                'bug_found': 'CLICKJACKING',
                'message': '🎉 Clickjacking exposure detected!',
                'description': 'Site can be embedded in iframe without proper frame protection',
                'points': 100,
                'vulnerability_type': 'Clickjacking',
                'severity': 'Medium',
                'status': 'local'
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to record bug: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    return Response({
        'error': 'Invalid bug recording request'
    }, status=status.HTTP_400_BAD_REQUEST)