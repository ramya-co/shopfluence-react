from django.contrib import admin
from .models import LeaderboardUser, BugDiscovery, LeaderboardStats


@admin.register(LeaderboardUser)
class LeaderboardUserAdmin(admin.ModelAdmin):
    list_display = ['display_name', 'user_id', 'total_score', 'bugs_found', 'rank', 'last_activity']
    list_filter = ['created_at', 'last_activity']
    search_fields = ['display_name', 'user_id']
    ordering = ['-total_score']
    readonly_fields = ['rank', 'recent_discoveries_7d']


@admin.register(BugDiscovery)
class BugDiscoveryAdmin(admin.ModelAdmin):
    list_display = ['user', 'bug_identifier', 'points_awarded', 'discovered_at']
    list_filter = ['discovered_at', 'points_awarded']
    search_fields = ['user__display_name', 'bug_identifier']
    ordering = ['-discovered_at']


@admin.register(LeaderboardStats)
class LeaderboardStatsAdmin(admin.ModelAdmin):
    list_display = ['total_users', 'total_bugs_found', 'total_points_awarded', 'last_updated']
    readonly_fields = ['total_users', 'total_bugs_found', 'total_points_awarded', 'average_points_per_bug', 'recent_discoveries_24h']
    
    def has_add_permission(self, request):
        # Only allow one stats object
        return not LeaderboardStats.objects.exists()
    
    def has_delete_permission(self, request, obj=None):
        # Don't allow deletion of stats
        return False
