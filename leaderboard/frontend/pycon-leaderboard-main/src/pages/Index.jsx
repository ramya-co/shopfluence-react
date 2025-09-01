import { useState, useEffect } from "react";
import hfMiniLogo from '/hf-mini.png';
import { LeaderboardHeader } from "../components/LeaderboardHeader";
import { Podium } from "../components/Podium";
import { LeaderboardTable } from "../components/LeaderboardTable";
import { Pagination } from "../components/Pagination";
import { competitionInfo } from "../data/mockData";
import { leaderboardAPI } from "../data/apiService";

const ITEMS_PER_PAGE = 10;

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showSplash, setShowSplash] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [leaderboardData, statsData] = await Promise.all([
          leaderboardAPI.fetchLeaderboard(),
          leaderboardAPI.fetchStats()
        ]);
        setParticipants(leaderboardData);
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up automatic refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const topThree = participants.slice(0, 3);
  const totalPages = Math.ceil(participants.length / ITEMS_PER_PAGE);

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return participants.slice(startIndex, endIndex);
  };

  const startRank = (currentPage - 1) * ITEMS_PER_PAGE + 1;

  return (
    <>
      {showSplash && (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <img
            src={hfMiniLogo}
            alt="Logo"
            className="w-28 h-28 animate-splash"
            style={{ filter: 'drop-shadow(0 0 32px orange)' }}
            onAnimationEnd={() => setShowSplash(false)}
          />
        </div>
      )}
      {!showSplash && (
        <div className="min-h-screen relative">
          {/* Main Background for entire page */}
          <div className="fixed inset-0 bg-gradient-to-b from-white via-orange-50/30 to-white z-0" />
          <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,165,0,0.05),transparent_70%)] z-0" />
          <div className="fixed inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.8),rgba(255,255,255,0.9),rgba(255,165,0,0.05))] z-0" />

          {/* Content */}
          <div className="relative z-10">
            <LeaderboardHeader 
              title={competitionInfo.title}
              date={competitionInfo.date}
              activeParticipants={stats?.total_users || competitionInfo.activeParticipants}
              totalBugs={stats?.total_bugs_found}
              totalPoints={stats?.total_points_awarded}
            />

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
              </div>
            ) : participants.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="text-center max-w-md">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Leaderboard is Empty
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No bug hunters have started their journey yet. Be the first to find vulnerabilities and claim your spot on the leaderboard!
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
                    <p><strong>How to get started:</strong></p>
                    <ol className="list-decimal list-inside mt-2 space-y-1">
                      <li>Create an account on the ecommerce site</li>
                      <li>Login and explore the application</li>
                      <li>Find security vulnerabilities</li>
                      <li>Earn points and climb the rankings!</li>
                    </ol>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Podium topThree={topThree} />

                <LeaderboardTable 
                  participants={getCurrentPageData()}
                  startRank={startRank}
                />

                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Index;
