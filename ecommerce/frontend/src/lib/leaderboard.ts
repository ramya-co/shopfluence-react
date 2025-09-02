// Leaderboard Service - Handles communication with leaderboard backend
const LEADERBOARD_API_BASE = 'http://localhost:8002/api';

export interface LeaderboardUser {
  user_id: string;
  display_name: string;
  email?: string;
}

export interface BugDiscovery {
  user_id: string;
  display_name: string;
  bug_identifier: string;
  points: number;
  description?: string;
}

class LeaderboardService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${LEADERBOARD_API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Leaderboard API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Register a user with the leaderboard when they create an account
   */
  async registerUser(userData: LeaderboardUser): Promise<void> {
    try {
      console.log('🏆 Registering user with leaderboard:', userData.display_name);
      
      // For new users, we'll just store their info - they'll get points when they find bugs
      // We can't create a 0-point bug entry, so we'll use the Django user creation endpoint
      
      // Check if user already exists
      const existingUser = await this.getUserStats(userData.user_id);
      if (existingUser) {
        console.log('User already exists in leaderboard');
        return;
      }
      
      // Store user info for when they find their first bug
      console.log('✅ User will be registered with leaderboard when they find their first bug');
    } catch (error) {
      console.warn('⚠️ Failed to register user with leaderboard:', error);
      // Don't throw error - registration should not fail if leaderboard is down
    }
  }

  /**
   * Record a bug discovery for a user
   */
  async recordBugDiscovery(bugData: BugDiscovery): Promise<any> {
    try {
      console.log('🐛 Recording bug discovery:', bugData.bug_identifier, 'for', bugData.display_name);
      
      const response = await this.makeRequest('/record-bug/', {
        method: 'POST',
        body: JSON.stringify(bugData)
      });
      
      console.log('✅ Bug discovery recorded successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to record bug discovery:', error);
      throw error;
    }
  }

  /**
   * Get user's current leaderboard status
   */
  async getUserStats(userId: string): Promise<any> {
    try {
      return await this.makeRequest(`/user/${userId}/`);
    } catch (error) {
      console.warn('Failed to get user stats:', error);
      return null;
    }
  }

  /**
   * Check if leaderboard API is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      await this.makeRequest('/health/');
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const leaderboardService = new LeaderboardService();
