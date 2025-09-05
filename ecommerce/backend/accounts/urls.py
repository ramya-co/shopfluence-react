from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.UserLoginView.as_view(), name='login'),
    path('auth/login-redirect/', views.login_redirect_view, name='login-redirect'),  # 🚨 BUG 6: Open Redirect
    path('auth/logout/', views.logout_view, name='logout'),
    path('login-redirect/', views.login_redirect_view, name='login_redirect'),  # Add this
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('auth/profile/<int:user_id>/', views.get_user_profile, name='get-user-profile'),  # 🚨 BUG 5: IDOR
    path('auth/change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    path('auth/user-info/', views.user_info, name='user-info'),
    path('auth/debug/', views.debug_info, name='debug-info'),  # 🚨 BUG 2: Debug endpoint
    path('auth/password-reset/', views.password_reset, name='password-reset'),  # 🚨 BUG 3: Token reuse
    path('auth/user-disclosure/', views.user_info_disclosure, name='user-disclosure'),  # 🚨 BUG 17: Info disclosure
    path('auth/db-test/', views.db_connection_test, name='db-test'),  # 🚨 BUG 32: DB info leak
    path('addresses/', views.AddressListView.as_view(), name='address-list'),
    path('addresses/<int:pk>/', views.AddressDetailView.as_view(), name='address-detail'),
    # Find the urlpatterns = [ ... ] and add this line inside it:

    path('vulnerable-redirect/', views.vulnerable_login_redirect, name='vulnerable_redirect'),
    # 🚨 BUG: Clickjacking - Bug recording endpoint
    path('bugs/record/', views.record_bug_endpoint, name='record_bug'),
    # 🚨 BUG: No Rate Limiting - Bug recording endpoint
    path('bugs/rate-limiting/', views.record_rate_limiting_bug, name='record_rate_limiting_bug'),
    # 🚨 BUG: Privilege Escalation - Vulnerable role setting endpoint  
    path('users/set_role/', views.set_user_role, name='set_user_role'),
]
