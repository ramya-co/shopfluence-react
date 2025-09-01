from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('auth/register/', views.UserRegistrationView.as_view(), name='register'),
    path('auth/login/', views.UserLoginView.as_view(), name='login'),
    path('auth/logout/', views.logout_view, name='logout'),
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
]
