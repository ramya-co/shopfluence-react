// Leaderboard API Service
const LEADERBOARD_API_BASE = 'http://localhost:8002/api';

export interface LeaderboardUser {
  id: number;
  user_id: string;
  display_name: string;
  total_score: number;
  bugs_found: number;
  rank: number;
  created_at: string;
  last_activity: string;
  recent_discoveries_7d: number;
  recent_discoveries?: BugDiscovery[];
}

export interface BugDiscovery {
  id: number;
  bug_identifier: string;
  points_awarded: number;
  discovered_at: string;
  description: string;
  user_display_name: string;
}

export interface LeaderboardStats {
  total_users: number;
  total_bugs_found: number;
  total_points_awarded: number;
  average_points_per_bug: number;
  recent_discoveries_24h: number;
  last_updated: string;
  top_user: LeaderboardUser | null;
}

class LeaderboardAPI {
  private baseUrl = LEADERBOARD_API_BASE;

  async getLeaderboard(params?: { search?: string; limit?: number }): Promise<{ results: LeaderboardUser[] }> {
    const url = new URL(`${this.baseUrl}/leaderboard/`);
    
    if (params?.search) {
      url.searchParams.append('search', params.search);
    }
    if (params?.limit) {
      url.searchParams.append('limit', params.limit.toString());
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }
    return response.json();
  }

  async getStats(): Promise<LeaderboardStats> {
    const response = await fetch(`${this.baseUrl}/stats/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stats: ${response.statusText}`);
    }
    return response.json();
  }

  async getUserDetails(userId: string): Promise<LeaderboardUser> {
    const response = await fetch(`${this.baseUrl}/user/${userId}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user details: ${response.statusText}`);
    }
    return response.json();
  }

  async getRecentDiscoveries(hours: number = 24): Promise<BugDiscovery[]> {
    const response = await fetch(`${this.baseUrl}/recent-discoveries/${hours}/`);
    if (!response.ok) {
      throw new Error(`Failed to fetch recent discoveries: ${response.statusText}`);
    }
    return response.json();
  }

  async recordBug(data: {
    user_id: string;
    display_name: string;
    bug_identifier: string;
    points: number;
    description?: string;
  }): Promise<{ message: string; user: LeaderboardUser; discovery: BugDiscovery }> {
    const response = await fetch(`${this.baseUrl}/record-bug/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async testConnection(): Promise<{ connected: boolean; message?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/health/`);
      if (response.ok) {
        const data = await response.json();
        return { connected: true, message: `API healthy with ${data.total_users} users` };
      } else {
        return { connected: false, message: `API responded with ${response.status}` };
      }
    } catch (error) {
      return { connected: false, message: `Connection failed: ${error}` };
    }
  }
}

export const leaderboardAPI = new LeaderboardAPI();
