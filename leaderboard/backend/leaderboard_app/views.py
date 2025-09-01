from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db import transaction
from django.utils import timezone
from datetime import timedelta

from .models import LeaderboardUser, BugDiscovery, LeaderboardStats
from .serializers import (
    LeaderboardUserSerializer, 
    BugDiscoverySerializer, 
    LeaderboardStatsSerializer,
    RecordBugSerializer
)


class LeaderboardListView(generics.ListAPIView):
    """Get the leaderboard rankings"""
    serializer_class = LeaderboardUserSerializer
    
    def get_queryset(self):
        queryset = LeaderboardUser.objects.all()
        
        # Optional filtering
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(display_name__icontains=search)
        
        # Limit results
        limit = self.request.query_params.get('limit', None)
        if limit:
            try:
                limit = int(limit)
                queryset = queryset[:limit]
            except ValueError:
                pass
        
        return queryset


class UserDetailView(generics.RetrieveAPIView):
    """Get detailed information about a specific user"""
    serializer_class = LeaderboardUserSerializer
    lookup_field = 'user_id'
    queryset = LeaderboardUser.objects.all()


class StatsView(generics.RetrieveAPIView):
    """Get global leaderboard statistics"""
    serializer_class = LeaderboardStatsSerializer
    
    def get_object(self):
        return LeaderboardStats.update_stats()


class RecentDiscoveriesView(generics.ListAPIView):
    """Get recent bug discoveries"""
    serializer_class = BugDiscoverySerializer
    
    def get_queryset(self):
        # Default to last 24 hours
        hours = self.kwargs.get('hours', 24)
        cutoff_time = timezone.now() - timedelta(hours=hours)
        return BugDiscovery.objects.filter(discovered_at__gte=cutoff_time)


@api_view(['POST'])
def record_bug(request):
    """Record a new bug discovery"""
    serializer = RecordBugSerializer(data=request.data)
    
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid data', 'details': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    data = serializer.validated_data
    
    try:
        with transaction.atomic():
            # Get or create user
            user, created = LeaderboardUser.objects.get_or_create(
                user_id=data['user_id'],
                defaults={
                    'display_name': data['display_name'],
                }
            )
            
            # Update display name if it's changed
            if user.display_name != data['display_name']:
                user.display_name = data['display_name']
                user.save()
            
            # Check if this bug was already discovered by this user
            existing_discovery = BugDiscovery.objects.filter(
                user=user, 
                bug_identifier=data['bug_identifier']
            ).first()
            
            if existing_discovery:
                return Response({
                    'message': 'Bug already discovered by this user',
                    'user': LeaderboardUserSerializer(user).data,
                    'discovery': BugDiscoverySerializer(existing_discovery).data
                }, status=status.HTTP_200_OK)
            
            # Create new bug discovery
            discovery = BugDiscovery.objects.create(
                user=user,
                bug_identifier=data['bug_identifier'],
                points_awarded=data['points'],
                description=data.get('description', '')
            )
            
            # Update global stats
            LeaderboardStats.update_stats()
            
            return Response({
                'message': 'Bug recorded successfully',
                'user': LeaderboardUserSerializer(user).data,
                'discovery': BugDiscoverySerializer(discovery).data
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        return Response(
            {'error': 'Failed to record bug', 'details': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def user_stats(request, user_id):
    """Get statistics for a specific user"""
    try:
        user = LeaderboardUser.objects.get(user_id=user_id)
        return Response(LeaderboardUserSerializer(user).data)
    except LeaderboardUser.DoesNotExist:
        return Response(
            {'error': 'User not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now(),
        'total_users': LeaderboardUser.objects.count(),
        'total_discoveries': BugDiscovery.objects.count()
    })


@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat()
    })
