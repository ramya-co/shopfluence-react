#!/usr/bin/env python
"""
Create sample data for the leaderboard system
"""
import os
import sys
import django
from datetime import datetime, timedelta
from django.utils import timezone

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'leaderboard.settings')
django.setup()

from leaderboard_app.models import LeaderboardUser, BugDiscovery, LeaderboardStats


def create_sample_data():
    """Create sample users and bug discoveries"""
    print("Creating sample leaderboard data...")
    
    # Sample users with varying scores
    sample_users = [
        {'user_id': 'user_elite_001', 'display_name': 'CyberHawk', 'bugs': [
            {'bug': 'XSS_HEADER_INJECTION', 'points': 75},
            {'bug': 'SQL_INJECTION_LOGIN', 'points': 90},
            {'bug': 'CSRF_TOKEN_BYPASS', 'points': 60},
            {'bug': 'AUTH_BYPASS_ADMIN', 'points': 100},
            {'bug': 'RCE_FILE_UPLOAD', 'points': 120},
        ]},
        {'user_id': 'user_pro_002', 'display_name': 'SecurityNinja', 'bugs': [
            {'bug': 'IDOR_USER_DATA', 'points': 80},
            {'bug': 'XXE_PARSER_EXPLOIT', 'points': 85},
            {'bug': 'SSRF_INTERNAL_ACCESS', 'points': 70},
            {'bug': 'RACE_CONDITION_CART', 'points': 65},
        ]},
        {'user_id': 'user_adv_003', 'display_name': 'BugMaster', 'bugs': [
            {'bug': 'LFI_CONFIG_EXPOSURE', 'points': 55},
            {'bug': 'PRIVILEGE_ESCALATION', 'points': 95},
            {'bug': 'SESSION_FIXATION', 'points': 45},
        ]},
        {'user_id': 'user_med_004', 'display_name': 'WhiteHat007', 'bugs': [
            {'bug': 'INFO_DISCLOSURE_API', 'points': 40},
            {'bug': 'WEAK_CRYPTO_IMPL', 'points': 60},
        ]},
        {'user_id': 'user_new_005', 'display_name': 'Rookie_Hunter', 'bugs': [
            {'bug': 'BROKEN_ACCESS_CONTROL', 'points': 50},
        ]},
        {'user_id': 'user_reg_006', 'display_name': 'CodeBreaker', 'bugs': [
            {'bug': 'INSECURE_DESERIALIZATION', 'points': 110},
            {'bug': 'COMMAND_INJECTION', 'points': 105},
        ]},
        {'user_id': 'user_exp_007', 'display_name': 'VulnFinder', 'bugs': [
            {'bug': 'BUFFER_OVERFLOW', 'points': 130},
            {'bug': 'USE_AFTER_FREE', 'points': 125},
            {'bug': 'FORMAT_STRING_BUG', 'points': 90},
        ]},
    ]
    
    created_users = 0
    created_discoveries = 0
    
    for user_data in sample_users:
        # Create or get user
        user, user_created = LeaderboardUser.objects.get_or_create(
            user_id=user_data['user_id'],
            defaults={'display_name': user_data['display_name']}
        )
        
        if user_created:
            created_users += 1
            print(f"Created user: {user.display_name}")
        
        # Create bug discoveries
        for i, bug_data in enumerate(user_data['bugs']):
            # Vary the discovery times
            discovery_time = timezone.now() - timedelta(
                days=i, 
                hours=i * 2, 
                minutes=i * 15
            )
            
            discovery, disc_created = BugDiscovery.objects.get_or_create(
                user=user,
                bug_identifier=bug_data['bug'],
                defaults={
                    'points_awarded': bug_data['points'],
                    'discovered_at': discovery_time,
                    'description': f'Successfully identified {bug_data["bug"]} vulnerability'
                }
            )
            
            if disc_created:
                created_discoveries += 1
                print(f"  + {bug_data['bug']} (+{bug_data['points']} points)")
    
    # Update global stats
    stats = LeaderboardStats.update_stats()
    
    print(f"\n✅ Sample data created successfully!")
    print(f"   Users: {created_users} new, {LeaderboardUser.objects.count()} total")
    print(f"   Bug discoveries: {created_discoveries} new, {BugDiscovery.objects.count()} total")
    print(f"   Total points awarded: {stats.total_points_awarded}")
    print(f"   Current champion: {stats.top_user.display_name if stats.top_user else 'None'}")


if __name__ == "__main__":
    create_sample_data()
