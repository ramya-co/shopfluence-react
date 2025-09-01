// API service for leaderboard integration
const API_BASE_URL = 'http://localhost:8002/api';

class LeaderboardAPI {
  async fetchLeaderboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return this.transformLeaderboardData(data.results);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Return mock data as fallback
      return this.getMockData();
    }
  }

  async fetchStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        total_users: 0,
        total_bugs_found: 0,
        total_points_awarded: 0,
        recent_discoveries_24h: 0
      };
    }
  }

  async fetchRecentDiscoveries(hours = 24) {
    try {
      const response = await fetch(`${API_BASE_URL}/recent-discoveries/${hours}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recent discoveries:', error);
      return [];
    }
  }

  transformLeaderboardData(apiData) {
    return apiData.map((user, index) => ({
      id: user.id,
      name: user.display_name,
      points: user.total_score,
      bugsFound: user.bugs_found,
      rank: user.rank || (index + 1),
      userId: user.user_id,
      lastActivity: user.last_activity,
      recentDiscoveries7d: user.recent_discoveries_7d,
      // Generate a consistent avatar based on user ID
      avatar: this.generateAvatar(user.user_id)
    }));
  }

  generateAvatar(userId) {
    // Generate consistent avatars based on user ID
    const avatars = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108755-2616b612b977?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face"
    ];
    
    // Use user ID to consistently select an avatar
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return avatars[Math.abs(hash) % avatars.length];
  }

  getMockData() {
    // Return empty array - no more mock data
    return [];
  }

  async testConnection() {
    try {
      const response = await fetch(`${API_BASE_URL}/health/`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export const leaderboardAPI = new LeaderboardAPI();
export default leaderboardAPI;
