import { PodiumCard } from "./PodiumCard";
// ...existing code...
import { Award, Medal, Crown } from "lucide-react";
import { useState } from "react";
import { useSwipeable } from "react-swipeable";

export function Podium({ topThree }) {
  if (topThree.length < 3) return null;

  // Mobile swipe logic
  const [mobileIndex, setMobileIndex] = useState(0); // 0: bronze, 1: gold, 2: silver
  // Infinite carousel swipe logic, Gold-Silver-Bronze order
  const [bounce, setBounce] = useState(false);
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setMobileIndex(i => (i + 1) % 3);
      setBounce(false);
    },
    onSwipedRight: () => {
      setMobileIndex(i => (i + 2) % 3); // (i-1+3)%3 for wrap-around
      setBounce(false);
    },
    delta: 30,
    preventDefaultTouchmoveEvent: true,
    trackMouse: false,
    trackTouch: true,
  });

  return (
    <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
      {/* Glass Morphism Container with Enhanced Bottom-to-Top Fade */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />
      <div className="absolute bottom-0 left-0 right-0 h-full bg-gradient-to-t from-white/40 via-white/10 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16 md:mb-20">
          <div className="inline-flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/25 backdrop-blur-md rounded-xl sm:rounded-2xl border border-orange-200/20 shadow-card mb-4 sm:mb-6">
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
            <span className="text-sm sm:text-base text-orange-700 font-semibold">Champions</span>
            <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-orange-500 rounded-full animate-pulse-slow" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight mb-3 sm:mb-4">
            Top Performers
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-2 sm:px-0">
            Celebrating excellence and outstanding achievements in our bug bounty competition
          </p>
        </div>
        
        {/* Podium Layout */}
        {/* Mobile slideshow/carousel view */}
        <div className={`sm:hidden w-full max-w-xs mx-auto min-h-[220px] bg-transparent relative overflow-hidden ${bounce ? 'animate-shake' : ''}`} {...handlers}>
          {/* Swipe indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {[0,1,2].map(i => (
              <span key={i} className={`w-2 h-2 rounded-full ${mobileIndex===i ? 'bg-orange-500' : 'bg-gray-300/60'} transition-all`} />
            ))}
          </div>
          {/* Arrow navigation - infinite cycle */}
          <button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/60 rounded-full p-1 shadow hover:bg-orange-100 transition"
            onClick={() => setMobileIndex(i => (i + 2) % 3)}
            aria-label="Previous"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/60 rounded-full p-1 shadow hover:bg-orange-100 transition"
            onClick={() => setMobileIndex(i => (i + 1) % 3)}
            aria-label="Next"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
          </button>
          {/* Slideshow cards: Gold, Silver, Bronze */}
          <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${mobileIndex * 100}%)` }}>
            {/* Gold */}
            <div className="w-full shrink-0 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-pulse-slow">
                    <Crown className="w-8 h-8 text-yellow-600 drop-shadow-lg" />
                  </div>
                </div>
                <PodiumCard 
                  rank={1}
                  name={topThree[0].name}
                  points={topThree[0].points}
                  avatar={topThree[0].avatar}
                  height="h-40"
                />
              </div>
            </div>
            {/* Silver */}
            <div className="w-full shrink-0 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(192,192,192,0.4)]">
                    <Medal className="w-6 h-6 text-gray-500 drop-shadow-lg" />
                  </div>
                </div>
                <PodiumCard 
                  rank={2}
                  name={topThree[1].name}
                  points={topThree[1].points}
                  avatar={topThree[1].avatar}
                  height="h-32"
                />
              </div>
            </div>
            {/* Bronze */}
            <div className="w-full shrink-0 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(205,127,50,0.4)]">
                    <Medal className="w-6 h-6 text-amber-700 drop-shadow-lg" />
                  </div>
                </div>
                <PodiumCard 
                  rank={3}
                  name={topThree[2].name}
                  points={topThree[2].points}
                  avatar={topThree[2].avatar}
                  height="h-24"
                />
              </div>
            </div>
          </div>
        </div>
        {/* Desktop view */}
        <div className="hidden sm:flex flex-row justify-center items-end space-y-0 max-w-6xl mx-auto">
          <div className="flex flex-row w-full sm:w-auto items-end gap-6 md:gap-10 lg:gap-14">
            {/* Bronze - 3rd Place (left) */}
            <div className="relative order-1 mx-auto mb-14 group">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-700 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(205,127,50,0.4)]">
                  <Medal className="w-6 h-6 text-amber-700 drop-shadow-lg" />
                </div>
              </div>
              <PodiumCard 
                rank={3}
                name={topThree[2].name}
                points={topThree[2].points}
                avatar={topThree[2].avatar}
                height="h-24"
              />
            </div>
            {/* Gold - 1st Place (center) */}
            <div className="relative z-10 order-2 mx-auto mb-24 group">
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(255,215,0,0.4)] animate-pulse-slow">
                  <Crown className="w-8 h-8 text-yellow-600 drop-shadow-lg" />
                </div>
              </div>
              <PodiumCard 
                rank={1}
                name={topThree[0].name}
                points={topThree[0].points}
                avatar={topThree[0].avatar}
                height="h-40"
              />
            </div>
            {/* Silver - 2nd Place (right) */}
            <div className="relative order-3 mx-auto mb-14 group">
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(192,192,192,0.4)]">
                  <Medal className="w-6 h-6 text-gray-500 drop-shadow-lg" />
                </div>
              </div>
              <PodiumCard 
                rank={2}
                name={topThree[1].name}
                points={topThree[1].points}
                avatar={topThree[1].avatar}
                height="h-32"
              />
            </div>
          </div>
        </div>
        
        {/* Decorative Elements - Further Reduced opacity */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-orange-200/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-orange-300/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-24 w-16 h-16 bg-yellow-200/15 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute bottom-40 left-24 w-20 h-20 bg-amber-200/15 rounded-full blur-xl animate-pulse-slow" />
        <div className="absolute top-1/2 left-1/2 w-40 h-40 -translate-x-1/2 -translate-y-1/2 bg-white/5 rounded-full blur-3xl" />
        
        {/* Enhanced Bottom-to-Top Fade Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-white/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white/15 to-transparent" />
      </div>
    </section>
  );
}
