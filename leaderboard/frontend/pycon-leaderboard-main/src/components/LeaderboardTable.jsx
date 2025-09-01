import { Trophy, Medal, Award, Bug } from "lucide-react";

export function LeaderboardTable({ participants, startRank }) {
  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-100/70 ring-1 ring-inset ring-yellow-400/30 backdrop-blur-sm">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
        );
      case 2:
        return (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/70 ring-1 ring-inset ring-gray-400/30 backdrop-blur-sm">
            <Medal className="w-4 h-4 text-gray-600" />
          </div>
        );
      case 3:
        return (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-100/70 ring-1 ring-inset ring-amber-400/30 backdrop-blur-sm">
            <Medal className="w-4 h-4 text-amber-600" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50/70 ring-1 ring-inset ring-gray-200/50 backdrop-blur-sm">
            <span className="text-sm font-medium text-gray-600">#{rank}</span>
          </div>
        );
    }
  };

  const getRankBadge = (rank) => {
    if (rank <= 3) {
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm ${
          rank === 1 
            ? "bg-yellow-100/60 text-yellow-700 ring-1 ring-inset ring-yellow-400/30" 
            : rank === 2 
            ? "bg-gray-100/60 text-gray-700 ring-1 ring-inset ring-gray-400/30" 
            : "bg-amber-100/60 text-amber-700 ring-1 ring-inset ring-amber-400/30"
        } transition-all duration-300 group-hover:scale-105`}>
          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉"}
          <span className="ml-0.5">{rank === 1 ? "Gold" : rank === 2 ? "Silver" : "Bronze"}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <section className="py-16 sm:py-20 md:py-24 relative overflow-hidden">
      {/* Glass Morphism Container */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      
      <div className="container mx-auto px-3 sm:px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/50 backdrop-blur-md rounded-xl sm:rounded-2xl border border-orange-200/40 shadow-card mb-4 sm:mb-6">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
            <span className="text-sm sm:text-base text-orange-700 font-semibold">Leaderboard</span>
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
            Full Leaderboard
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Complete ranking of all participants in the competition
          </p>
        </div>
        
        {/* Table Container */}
        <div className="bg-white/60 backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-happyfox border border-orange-200/30 overflow-hidden">
          {/* Table Header */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-orange-200/30 bg-gradient-to-r from-orange-50/70 to-white/70 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-center sm:text-left mb-4 sm:mb-0">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Rankings</h3>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Track your progress and compare with others</p>
              </div>
              <div className="flex sm:hidden items-center space-x-1.5 px-3 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-orange-200/40 shadow-card">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse-slow" />
                <span className="text-xs font-medium text-orange-700">Live</span>
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse-slow" />
              </div>
              <div className="hidden sm:flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/50 backdrop-blur-md rounded-full border border-orange-200/40 shadow-card">
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
                <span className="text-xs sm:text-sm font-medium text-orange-700">Live Updates</span>
                <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50/70 to-orange-50/50 backdrop-blur-sm">
                  <th className="w-16 sm:w-20 md:w-24 font-bold text-left p-3 sm:p-4 md:p-6 text-sm sm:text-base text-gray-700">Rank</th>
                  <th className="font-bold text-left p-3 sm:p-4 md:p-6 text-sm sm:text-base text-gray-700">Participant</th>
                  <th className="text-center font-bold p-3 sm:p-4 md:p-6 text-sm sm:text-base text-gray-700">Points</th>
                  <th className="text-center font-bold p-3 sm:p-4 md:p-6 text-sm sm:text-base text-gray-700">Bugs Found</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => {
                  const rank = startRank + index;
                  const isTopThree = rank <= 3;
                  
                  return (
                    <tr 
                      key={participant.id}
                      className={`
                        transition-all duration-300 hover:bg-orange-50/30 cursor-pointer group
                        ${isTopThree ? 'bg-gradient-to-r from-orange-50/50 to-white' : ''}
                        ${rank % 2 === 0 ? 'bg-gray-50/30' : ''}
                        hover:shadow-lg hover:-translate-y-1
                      `}
                    >
                      <td className="font-semibold p-2 sm:p-4 md:p-6">
                        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
                          <div className="flex-shrink-0">
                            {getRankIcon(rank)}
                          </div>
                          <div className="flex-shrink-0 hidden sm:block">
                            {getRankBadge(rank)}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-2 sm:p-4 md:p-6">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                          <div className="relative">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-2 sm:ring-3 md:ring-4 ring-orange-100 group-hover:ring-orange-200 transition-all duration-300">
                              {participant.avatar ? (
                                <img src={participant.avatar} alt={participant.name} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-white font-bold text-sm sm:text-base md:text-lg">{participant.name.charAt(0)}</span>
                              )}
                            </div>
                            {isTopThree && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-[8px] sm:text-[10px] md:text-xs">⭐</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 text-sm sm:text-base md:text-lg line-clamp-1">{participant.name}</div>
                            {isTopThree && (
                              <div className="text-xs sm:text-sm text-orange-600 font-medium hidden sm:block">🏆 Top Performer</div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="text-center p-2 sm:p-4 md:p-6">
                        <div className="font-bold text-lg sm:text-xl md:text-2xl text-orange-600 group-hover:scale-110 transition-transform duration-300">
                          {participant.points}
                        </div>
                      </td>
                      
                      <td className="text-center p-2 sm:p-4 md:p-6">
                        <div className="inline-flex items-center gap-1 sm:gap-2">
                          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-orange-50/70 text-orange-700 rounded-full text-xs sm:text-sm font-medium backdrop-blur-sm ring-1 ring-inset ring-orange-200/40 transition-all duration-300 group-hover:scale-110">
                            <Bug className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-orange-600" />
                            <span>{participant.bugsFound}</span>
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-32 left-10 w-20 h-20 bg-orange-200/20 rounded-full blur-xl" />
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-orange-300/20 rounded-full blur-2xl" />
      </div>
    </section>
  );
}
