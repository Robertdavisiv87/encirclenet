import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Flame, TrendingUp, Award, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StreakModal from './StreakModal';

export default function StreakDisplay({ currentStreak: initialStreak = 0, longestStreak: initialLongest = 0 }) {
  const [currentStreak, setCurrentStreak] = useState(initialStreak);
  const [longestStreak, setLongestStreak] = useState(initialLongest);
  const [showModal, setShowModal] = useState(false);
  const [streakBonus, setStreakBonus] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentStreak(initialStreak);
    setLongestStreak(initialLongest);
  }, [initialStreak, initialLongest]);

  const handleUpdateStreak = async () => {
    setIsUpdating(true);
    try {
      const result = await base44.functions.invoke('updateStreak', {});
      setCurrentStreak(result.data.current_streak);
      setLongestStreak(result.data.longest_streak);
      
      if (result.data.bonus_points > 0) {
        setStreakBonus(result.data.bonus_points);
        setShowModal(true);
      }
    } catch (e) {
      console.error('Failed to update streak:', e);
    } finally {
      setIsUpdating(false);
    }
  };

  const nextMilestone = currentStreak < 7 ? 7 : currentStreak < 30 ? 30 : currentStreak < 100 ? 100 : (Math.ceil(currentStreak / 10) * 10);
  const daysToMilestone = nextMilestone - currentStreak;

  return (
    <>
      <StreakModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)}
        streakCount={currentStreak}
        bonusPoints={streakBonus}
      />
      
      <div className="space-y-6">
        {/* Main Streak Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ 
                scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
              className="relative"
            >
              <Flame 
                className={`w-12 h-12 ${
                  currentStreak >= 30 ? 'text-red-500' :
                  currentStreak >= 7 ? 'text-orange-500' : 
                  currentStreak >= 3 ? 'text-yellow-500' : 
                  'text-gray-400'
                }`} 
              />
              {currentStreak >= 7 && (
                <motion.div
                  className={`absolute inset-0 rounded-full opacity-30 blur-xl ${
                    currentStreak >= 30 ? 'bg-red-400' : 'bg-orange-400'
                  }`}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.div>
            
            <div>
              <p className="text-3xl font-bold text-blue-900">{currentStreak} Days</p>
              <p className="text-sm text-gray-600">Current Streak 🔥</p>
              <Button
                onClick={handleUpdateStreak}
                disabled={isUpdating}
                size="sm"
                className="mt-2 gradient-bg-primary text-white text-xs"
              >
                {isUpdating ? 'Updating...' : 'Log Today\'s Activity'}
              </Button>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-purple-900">{longestStreak} Days</p>
            <p className="text-sm text-gray-600">Best Streak 🏆</p>
          </div>
        </div>

        {/* Streak Progress */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Next Milestone</p>
            <p className="text-sm text-gray-600">{daysToMilestone} days to go</p>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((currentStreak % nextMilestone) / nextMilestone) * 100}%` }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-500"
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            {nextMilestone === 7 && '🎯 7-day milestone: +50 bonus points'}
            {nextMilestone === 30 && '🎯 30-day milestone: +200 bonus points'}
            {nextMilestone === 100 && '🎯 100-day milestone: +1000 bonus points'}
            {nextMilestone > 100 && `🎯 ${nextMilestone}-day milestone: +${Math.floor(nextMilestone / 10) * 30} bonus points`}
          </p>
        </div>

        {/* Streak Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
            <Calendar className="w-6 h-6 mx-auto mb-1 text-blue-600" />
            <p className="text-lg font-bold text-blue-900">{currentStreak}</p>
            <p className="text-xs text-gray-600">Days Active</p>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-600" />
            <p className="text-lg font-bold text-green-900">{longestStreak}</p>
            <p className="text-xs text-gray-600">Best Record</p>
          </div>
          <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
            <Award className="w-6 h-6 mx-auto mb-1 text-purple-600" />
            <p className="text-lg font-bold text-purple-900">
              {currentStreak >= 30 ? '🔥' : currentStreak >= 7 ? '⭐' : '🌱'}
            </p>
            <p className="text-xs text-gray-600">
              {currentStreak >= 30 ? 'On Fire' : currentStreak >= 7 ? 'Hot' : 'Building'}
            </p>
          </div>
        </div>

        {/* Streak Tips */}
        {currentStreak === 0 && (
          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-900 mb-2">Start Your Streak Today! 🚀</p>
            <p className="text-xs text-gray-700">
              Post, comment, or engage daily to build your streak. Earn bonus points at milestones: 7, 30, and 100 days!
            </p>
          </div>
        )}

        {currentStreak > 0 && currentStreak < 7 && (
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-yellow-900 mb-2">Keep It Going! 🌟</p>
            <p className="text-xs text-gray-700">
              You're {7 - currentStreak} day{7 - currentStreak !== 1 ? 's' : ''} away from your first milestone bonus (+50 points)
            </p>
          </div>
        )}

        {currentStreak >= 7 && (
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-4">
            <p className="text-sm font-semibold text-orange-900 mb-2">You're On Fire! 🔥</p>
            <p className="text-xs text-gray-700">
              Amazing commitment! Keep this momentum going to reach the {nextMilestone}-day milestone.
            </p>
          </div>
        )}
      </div>
    </>
  );
}