import React from 'react';
import { Flame, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StreakDisplay({ currentStreak, longestStreak, size = 'md' }) {
  return (
    <div className={cn(
      "flex items-center gap-4",
      size === 'sm' && "gap-2"
    )}>
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="flex items-center gap-2"
      >
        <div className={cn(
          "rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center",
          size === 'sm' ? "w-8 h-8" : "w-12 h-12"
        )}>
          <Flame className={cn(
            "text-white",
            size === 'sm' ? "w-4 h-4" : "w-6 h-6"
          )} />
        </div>
        <div>
          <p className={cn(
            "font-bold text-orange-400",
            size === 'sm' ? "text-sm" : "text-lg"
          )}>
            {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
          </p>
          <p className={cn(
            "text-zinc-500",
            size === 'sm' ? "text-xs" : "text-sm"
          )}>
            Active Posting
          </p>
        </div>
      </motion.div>

      {longestStreak > 0 && (
        <div className="flex items-center gap-2">
          <div className={cn(
            "rounded-full bg-yellow-500/20 flex items-center justify-center",
            size === 'sm' ? "w-8 h-8" : "w-10 h-10"
          )}>
            <Trophy className={cn(
              "text-yellow-400",
              size === 'sm' ? "w-4 h-4" : "w-5 h-5"
            )} />
          </div>
          <div>
            <p className={cn(
              "font-bold text-yellow-400",
              size === 'sm' ? "text-sm" : "text-base"
            )}>
              {longestStreak}
            </p>
            <p className={cn(
              "text-zinc-500",
              size === 'sm' ? "text-xs" : "text-sm"
            )}>
              Best
            </p>
          </div>
        </div>
      )}
    </div>
  );
}