import { Users, Star, Bug, Trophy } from "lucide-react";

export function LeaderboardHeader({ title, date, activeParticipants, totalBugs, totalPoints }) {
  return (
    <header className="relative overflow-hidden">
      {/* Glass Morphism Container */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
      {/* Content */}
      <div className="relative text-center py-6 sm:py-16 md:py-20 px-2 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          {/* HappyFox Brand Badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/50 backdrop-blur-md rounded-full border border-orange-200/40 shadow-card mb-6 sm:mb-8">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-slow" />
            <span className="text-sm font-semibold text-orange-700">PYCON</span>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse-slow" />
          </div>
          {/* Main Title Row: Logos left/right, title centered for all views */}
          <div className="flex items-center justify-between w-full mb-2 sm:mb-4">
            {/* HappyFox logo left */}
            <div className="flex-1 flex justify-start items-center">
              <img src="/hf-mini.png" alt="HappyFox" className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-lg" />
            </div>
            {/* Title center */}
            <div className="flex-1 flex justify-center items-center">
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 whitespace-normal break-words max-w-xs sm:max-w-xl leading-tight">
                {title}
              </h1>
            </div>
            {/* Python logo right */}
            <div className="flex-1 flex justify-end items-center">
              <img src="/python.svg" alt="Python" className="w-10 h-10 sm:w-14 sm:h-14 drop-shadow-lg" />
            </div>
          </div>
          {/* Subtitle and Info */}
          <div className="space-y-2 sm:space-y-3 max-w-xs sm:max-w-3xl mx-auto">
            <p className="text-base sm:text-xl md:text-2xl text-gray-600 font-medium">
              {date}
            </p>
            <div className="inline-flex flex-wrap justify-center items-center gap-2 sm:gap-4 px-3 sm:px-6 py-2 sm:py-3 bg-orange-50 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-orange-200/50 shadow-card">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                <span className="text-gray-700 font-semibold text-xs sm:text-sm">
                  Participants: <span className="text-orange-600 font-bold">{activeParticipants}</span>
                </span>
              </div>
              {totalBugs !== undefined && (
                <div className="flex items-center space-x-2">
                  <Bug className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
                  <span className="text-gray-700 font-semibold text-xs sm:text-sm">
                    Bugs Found: <span className="text-red-600 font-bold">{totalBugs}</span>
                  </span>
                </div>
              )}
              {totalPoints !== undefined && (
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  <span className="text-gray-700 font-semibold text-xs sm:text-sm">
                    Total Points: <span className="text-amber-600 font-bold">{totalPoints}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Decorative Elements: hide on mobile for clarity */}
          <div className="hidden sm:block absolute top-10 left-10 w-20 h-20 bg-orange-200/20 rounded-full blur-xl" />
          <div className="hidden sm:block absolute bottom-10 right-10 w-32 h-32 bg-orange-300/20 rounded-full blur-2xl" />
        </div>
      </div>
    </header>
  );
}
