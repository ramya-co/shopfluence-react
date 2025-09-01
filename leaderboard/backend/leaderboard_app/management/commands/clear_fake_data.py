from django.core.management.base import BaseCommand
from leaderboard_app.models import LeaderboardUser, BugDiscovery, LeaderboardStats


class Command(BaseCommand):
    help = 'Clear all fake/sample data from the leaderboard database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('🧹 Clearing fake data from leaderboard...'))
        
        # Delete all bug discoveries
        bug_count = BugDiscovery.objects.count()
        BugDiscovery.objects.all().delete()
        self.stdout.write(f'   Deleted {bug_count} bug discoveries')
        
        # Delete all users
        user_count = LeaderboardUser.objects.count()
        LeaderboardUser.objects.all().delete()
        self.stdout.write(f'   Deleted {user_count} users')
        
        # Reset stats
        LeaderboardStats.objects.all().delete()
        self.stdout.write('   Reset statistics')
        
        self.stdout.write(self.style.SUCCESS('✅ Leaderboard cleared! Ready for real users.'))
        self.stdout.write(self.style.NOTICE('📝 The leaderboard will now populate only with real ecommerce users.'))
