import React from 'react';
import { Trophy, TrendingUp, Award, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const RANK_CONFIG = {
  bronze: { icon: '🥉', color: 'text-orange-700', bg: 'bg-orange-100', border: 'border-orange-300' },
  silver: { icon: '🥈', color: 'text-gray-600', bg: 'bg-gray-100', border: 'border-gray-300' },
  gold: { icon: '🥇', color: 'text-yellow-600', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  platinum: { icon: '💎', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-300' },
  diamond: { icon: '💠', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-300' }
};

export default function PointsDisplay({ userPoints, compact = false }) {
  if (!userPoints) return null;

  const rankConfig = RANK_CONFIG[userPoints.rank] || RANK_CONFIG.bronze;

  if (compact) {
    return (
      <motion.div 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold",
          rankConfig.bg, rankConfig.color, rankConfig.border, "border"
        )}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <span>{rankConfig.icon}</span>
        <span>Lv{userPoints.current_level}</span>
        <span className="text-gray-400">•</span>
        <span>{userPoints.total_points}pts</span>
      </motion.div>
    );
  }

  return (
    <div className={cn(
      "p-4 rounded-xl border-2",
      rankConfig.bg, rankConfig.border
    )}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{rankConfig.icon}</span>
          <div>
            <p className={cn("font-bold text-sm", rankConfig.color)}>
              {userPoints.rank.toUpperCase()} RANK
            </p>
            <p className="text-xs text-gray-600">Level {userPoints.current_level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("font-bold text-xl", rankConfig.color)}>
            {userPoints.total_points}
          </p>
          <p className="text-xs text-gray-600">Total Points</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-gray-600">This Month</p>
          <p className="font-bold text-blue-900">{userPoints.points_this_month} pts</p>
        </div>
        <div className="bg-white/50 rounded-lg p-2">
          <p className="text-gray-600">Streak</p>
          <p className="font-bold text-blue-900">{userPoints.streak_days} days 🔥</p>
        </div>
      </div>
    </div>
  );
}