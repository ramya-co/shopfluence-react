from rest_framework import serializers
from .models import LeaderboardUser, BugDiscovery, LeaderboardStats


class BugDiscoverySerializer(serializers.ModelSerializer):
    user_display_name = serializers.CharField(source='user.display_name', read_only=True)
    
    class Meta:
        model = BugDiscovery
        fields = ['id', 'bug_identifier', 'points_awarded', 'discovered_at', 'description', 'user_display_name']


class LeaderboardUserSerializer(serializers.ModelSerializer):
    rank = serializers.ReadOnlyField()
    recent_discoveries_7d = serializers.ReadOnlyField()
    recent_discoveries = BugDiscoverySerializer(source='bug_discoveries', many=True, read_only=True)
    
    class Meta:
        model = LeaderboardUser
        fields = [
            'id', 'user_id', 'display_name', 'total_score', 'bugs_found', 
            'rank', 'created_at', 'last_activity', 'recent_discoveries_7d', 'recent_discoveries'
        ]


class LeaderboardStatsSerializer(serializers.ModelSerializer):
    average_points_per_bug = serializers.ReadOnlyField()
    recent_discoveries_24h = serializers.ReadOnlyField()
    top_user = LeaderboardUserSerializer(read_only=True)
    
    class Meta:
        model = LeaderboardStats
        fields = [
            'total_users', 'total_bugs_found', 'total_points_awarded', 
            'average_points_per_bug', 'recent_discoveries_24h', 'last_updated', 'top_user'
        ]


class RecordBugSerializer(serializers.Serializer):
    """Serializer for recording a new bug discovery"""
    user_id = serializers.CharField(max_length=100)
    display_name = serializers.CharField(max_length=100)
    bug_identifier = serializers.CharField(max_length=200)
    points = serializers.IntegerField(min_value=1)
    description = serializers.CharField(max_length=1000, required=False, allow_blank=True)
