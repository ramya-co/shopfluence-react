import React from 'react';
import Leaderboard from '@/components/leaderboard/Leaderboard';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Bug Hunter Leaderboard
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compete with fellow security researchers and climb the ranks by discovering bugs in our platform.
          </p>
        </div>
        
        <Leaderboard className="max-w-3xl mx-auto" />
      </div>
    </div>
  );
};

export default LeaderboardPage;
