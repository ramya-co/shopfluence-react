import React, { useState, useEffect } from 'react';
import { leaderboardAPI, LeaderboardUser, LeaderboardStats } from '@/lib/leaderboard-api';
import { Trophy, Medal, Award, Users, Bug, TrendingUp, Clock } from 'lucide-react';

interface LeaderboardProps {
  className?: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ className = '' }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setError(null);
      const [leaderboardResponse, statsResponse] = await Promise.all([
        leaderboardAPI.getLeaderboard({ limit: 10 }),
        leaderboardAPI.getStats()
      ]);
      
      setUsers(leaderboardResponse.results);
      setStats(statsResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-red-600">
          <h3 className="text-lg font-semibold mb-2">Failed to Load Leaderboard</h3>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
          Bug Hunter Leaderboard
        </h2>
        <div className="text-sm text-gray-500">
          Last updated: {stats ? formatTimeAgo(stats.last_updated) : 'Never'}
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-3 rounded-lg text-center">
            <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="font-bold text-blue-600">{stats.total_users}</div>
            <div className="text-xs text-blue-700">Hunters</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <Bug className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="font-bold text-green-600">{stats.total_bugs_found}</div>
            <div className="text-xs text-green-700">Bugs Found</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg text-center">
            <TrendingUp className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="font-bold text-purple-600">{stats.total_points_awarded.toLocaleString()}</div>
            <div className="text-xs text-purple-700">Total Points</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg text-center">
            <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="font-bold text-orange-600">{stats.recent_discoveries_24h}</div>
            <div className="text-xs text-orange-700">Last 24h</div>
          </div>
        </div>
      )}

      {/* Leaderboard List */}
      <div className="space-y-3">
        {users.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Bug className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No bug hunters yet!</p>
            <p className="text-sm">Be the first to find a bug and join the leaderboard.</p>
          </div>
        ) : (
          users.map((user, index) => (
            <div
              key={user.user_id}
              className={`flex items-center p-3 rounded-lg border transition-colors ${
                user.rank <= 3 
                  ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200' 
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center mr-4">
                {getRankIcon(user.rank)}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{user.display_name}</h3>
                  <div className="text-right">
                    <div className="font-bold text-lg text-blue-600">
                      {user.total_score.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="text-sm text-gray-600">
                    {user.bugs_found} bugs found
                  </div>
                  <div className="text-xs text-gray-500">
                    Last active: {formatTimeAgo(user.last_activity)}
                  </div>
                </div>
                
                {user.recent_discoveries_7d > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      🔥 {user.recent_discoveries_7d} this week
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-center">
        <a 
          href="/leaderboard" 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          View Full Leaderboard →
        </a>
      </div>
    </div>
  );
};

export default Leaderboard;
