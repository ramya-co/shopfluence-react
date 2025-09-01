from django.db import models
from django.utils import timezone


class LeaderboardUser(models.Model):
    """User model for the leaderboard system"""
    user_id = models.CharField(max_length=100, unique=True)
    display_name = models.CharField(max_length=100)
    total_score = models.IntegerField(default=0)
    bugs_found = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    last_activity = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['-total_score', '-bugs_found', 'created_at']

    def __str__(self):
        return f"{self.display_name} ({self.total_score} points)"

    @property
    def rank(self):
        """Calculate user's rank based on total score"""
        return LeaderboardUser.objects.filter(
            total_score__gt=self.total_score
        ).count() + 1

    @property
    def recent_discoveries_7d(self):
        """Count of bug discoveries in the last 7 days"""
        from datetime import timedelta
        seven_days_ago = timezone.now() - timedelta(days=7)
        return self.bug_discoveries.filter(discovered_at__gte=seven_days_ago).count()


class BugDiscovery(models.Model):
    """Record of a bug found by a user"""
    user = models.ForeignKey(LeaderboardUser, on_delete=models.CASCADE, related_name='bug_discoveries')
    bug_identifier = models.CharField(max_length=200)
    points_awarded = models.IntegerField()
    discovered_at = models.DateTimeField(default=timezone.now)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-discovered_at']
        unique_together = ['user', 'bug_identifier']  # Prevent duplicate bug discoveries

    def __str__(self):
        return f"{self.user.display_name} found {self.bug_identifier} (+{self.points_awarded})"

    def save(self, *args, **kwargs):
        """Update user's total score when saving a new discovery"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        if is_new:
            # Update user's total score and bug count
            self.user.total_score += self.points_awarded
            self.user.bugs_found += 1
            self.user.last_activity = timezone.now()
            self.user.save()


class LeaderboardStats(models.Model):
    """Global statistics for the leaderboard"""
    total_users = models.IntegerField(default=0)
    total_bugs_found = models.IntegerField(default=0)
    total_points_awarded = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = "Leaderboard Stats"

    def __str__(self):
        return f"Stats: {self.total_users} users, {self.total_bugs_found} bugs"

    @classmethod
    def update_stats(cls):
        """Update global statistics"""
        stats, created = cls.objects.get_or_create(pk=1)
        
        stats.total_users = LeaderboardUser.objects.count()
        stats.total_bugs_found = BugDiscovery.objects.count()
        stats.total_points_awarded = sum(
            user.total_score for user in LeaderboardUser.objects.all()
        )
        stats.save()
        return stats

    @property
    def average_points_per_bug(self):
        """Calculate average points per bug discovery"""
        if self.total_bugs_found == 0:
            return 0
        return round(self.total_points_awarded / self.total_bugs_found, 1)

    @property
    def recent_discoveries_24h(self):
        """Count of discoveries in the last 24 hours"""
        from datetime import timedelta
        yesterday = timezone.now() - timedelta(days=1)
        return BugDiscovery.objects.filter(discovered_at__gte=yesterday).count()

    @property
    def top_user(self):
        """Get the top user"""
        return LeaderboardUser.objects.first()
