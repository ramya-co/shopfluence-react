from django.urls import path
from . import views

urlpatterns = [
    # Main leaderboard endpoints
    path('leaderboard/', views.LeaderboardListView.as_view(), name='leaderboard'),
    path('stats/', views.StatsView.as_view(), name='stats'),
    path('recent-discoveries/<int:hours>/', views.RecentDiscoveriesView.as_view(), name='recent-discoveries'),
    path('recent-discoveries/', views.RecentDiscoveriesView.as_view(), name='recent-discoveries-default'),
    
    # User-specific endpoints
    path('user/<str:user_id>/', views.UserDetailView.as_view(), name='user-detail'),
    path('user-stats/<str:user_id>/', views.user_stats, name='user-stats'),
    
    # Bug recording
    path('record-bug/', views.record_bug, name='record-bug'),
    
    # Health check
    path('health/', views.health_check, name='health'),
]
