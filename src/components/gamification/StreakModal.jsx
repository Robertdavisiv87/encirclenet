import React from 'react';
import { X, Flame, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function StreakModal({ isOpen, onClose, userStats, posts }) {
  if (!isOpen) return null;

  const currentStreak = userStats?.current_streak || 0;
  const longestStreak = userStats?.longest_streak || 0;
  const totalPosts = userStats?.posts_count || 0;
  
  // Get recent posting days
  const postsByDate = posts.reduce((acc, post) => {
    const date = new Date(post.created_date).toDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const recentDays = Object.entries(postsByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 7);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 w-full max-w-md border-2 border-purple-200 shadow-glow"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <Flame className="w-7 h-7 text-orange-500 animate-pulse" />
              Your Streak
            </h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-4 text-white shadow-glow">
              <Flame className="w-8 h-8 mb-2 animate-bounce" />
              <p className="text-3xl font-bold">{currentStreak}</p>
              <p className="text-sm opacity-90">Day Streak</p>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-4 text-white shadow-glow">
              <Trophy className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{longestStreak}</p>
              <p className="text-sm opacity-90">Best Streak</p>
            </div>
          </div>

          {/* Total Posts */}
          <div className="bg-white rounded-xl p-4 mb-6 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{totalPosts}</p>
                  <p className="text-sm text-gray-600">Total Posts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-blue-900">Recent Activity</h3>
            </div>
            
            {recentDays.length > 0 ? (
              <div className="space-y-2">
                {recentDays.map((day, index) => (
                  <div 
                    key={day.date}
                    className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <div>
                      <p className="font-medium text-blue-900 text-sm">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      {index === 0 && (
                        <p className="text-xs text-purple-600">Today</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">
                        {day.count} post{day.count !== 1 ? 's' : ''}
                      </span>
                      <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm text-center py-4">
                No recent posts. Start posting to build your streak!
              </p>
            )}
          </div>

          {/* Motivation */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-white text-center">
            <p className="font-semibold mb-1">
              {currentStreak === 0 
                ? "🚀 Start your streak today!" 
                : currentStreak < 7 
                  ? "🔥 Keep it going!" 
                  : currentStreak < 30 
                    ? "⭐ You're on fire!" 
                    : "👑 Streak Master!"}
            </p>
            <p className="text-sm opacity-90">
              {currentStreak === 0 
                ? "Post today to begin your journey"
                : "Post daily to maintain your streak"}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}