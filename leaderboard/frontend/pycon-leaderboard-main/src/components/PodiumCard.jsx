import { Medal, Trophy, Award, Crown } from "lucide-react";

export function PodiumCard({ rank, name, points, avatar, height }) {
  const getRankConfig = () => {
    switch (rank) {
      case 1:
        return {
          className: "podium-gold",
          icon: <Crown className="w-8 h-8 text-yellow-600 drop-shadow-lg" />,
          medalColor: "text-yellow-700",
          textColor: "text-yellow-700",
          position: "order-2", // Center position
          glow: "shadow-[0_0_40px_rgba(255,215,0,0.3)]",
          border: "border-yellow-300/50"
        };
      case 2:
        return {
          className: "podium-silver",
          icon: <Award className="w-7 h-7 text-gray-600 drop-shadow-lg" />,
          medalColor: "text-gray-700", 
          textColor: "text-gray-700",
          position: "order-1", // Left position
          glow: "shadow-[0_0_30px_rgba(192,192,192,0.3)]",
          border: "border-gray-300/50"
        };
      case 3:
        return {
          className: "podium-bronze",
          icon: <Award className="w-7 h-7 text-amber-700 drop-shadow-lg" />,
          medalColor: "text-amber-700",
          textColor: "text-amber-700", 
          position: "order-3", // Right position
          glow: "shadow-[0_0_30px_rgba(205,127,50,0.3)]",
          border: "border-amber-300/50"
        };
      default:
        return {
          className: "",
          icon: null,
          medalColor: "",
          textColor: "",
          position: "",
          glow: "",
          border: ""
        };
    }
  };

  const config = getRankConfig();

  return (
    <div className={`flex flex-col items-center ${config.position}`}>
      <div className={`w-40 sm:w-48 md:w-52 ${config.className} border-0 rounded-xl sm:rounded-2xl shadow-podium ${config.glow} ${config.border} relative overflow-hidden bg-white/10`}>
        {/* Background Pattern with Glassmorphism */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
        <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full blur-xl" />

        <div className="relative p-4 sm:p-6 md:p-8 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-3 sm:mb-4 md:mb-6">
            <div className="p-2 sm:p-3 bg-white/20 rounded-full backdrop-blur-sm">
              {config.icon}
            </div>
          </div>

          {/* Avatar */}
          <div className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-3 sm:mb-4 md:mb-6 ring-3 sm:ring-4 ring-white/40 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center overflow-hidden`}>
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg sm:text-xl md:text-2xl drop-shadow-lg">{name.charAt(0)}</span>
            )}
          </div>

          {/* Name */}
          <h3 className={`font-bold text-base sm:text-lg md:text-xl mb-2 sm:mb-3 ${config.textColor} drop-shadow-sm line-clamp-1`}>
            {name}
          </h3>

          {/* Points */}
          <div className={`${config.textColor} font-semibold`}>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold drop-shadow-sm">{points}</div>
            <div className="text-xs sm:text-sm opacity-90 font-medium">points</div>
          </div>

          {/* Rank Badge */}
          <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50">
            <span className="text-xs sm:text-sm font-bold text-gray-900 drop-shadow-sm">#{rank}</span>
          </div>
        </div>
      </div>
      {/* Rank-based colored base with reduced opacity and glow */}
      {rank === 1 && (
        <div className="w-32 sm:w-40 md:w-48 h-2 mt-2 rounded-full mx-auto" style={{
          background: 'rgba(255, 215, 0, 0.18)',
          boxShadow: '0 0 18px 5px rgba(255, 215, 0, 0.28)'
        }} />
      )}
      {rank === 2 && (
        <div className="w-32 sm:w-40 md:w-48 h-2 mt-2 rounded-full mx-auto" style={{
          background: 'rgba(192, 192, 192, 0.15)',
          boxShadow: '0 0 16px 4px rgba(192, 192, 192, 0.24)'
        }} />
      )}
      {rank === 3 && (
        <div className="w-32 sm:w-40 md:w-48 h-2 mt-2 rounded-full mx-auto" style={{
          background: 'rgba(205, 127, 50, 0.15)',
          boxShadow: '0 0 16px 4px rgba(205, 127, 50, 0.24)'
        }} />
      )}
      {![1,2,3].includes(rank) && (
        <div className="w-32 sm:w-40 md:w-48 h-2 mt-2 rounded-full bg-black/5 mx-auto shadow-sm" />
      )}
    </div>
  );
}
