import React, { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Flame, Trophy, Star, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

export default function StreakModal({ isOpen, onClose, streakCount = 7, bonusPoints = 0 }) {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-gradient-to-br from-orange-100 to-red-100 border-4 border-orange-500">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.2, 1, 1.2, 1]
            }}
            transition={{ duration: 0.6, repeat: 3 }}
          >
            <Flame className="w-24 h-24 mx-auto mb-4 text-orange-500" />
          </motion.div>
          
          <h2 className="text-4xl font-bold gradient-text mb-3">
            {streakCount} Day Streak! 🔥
          </h2>
          
          <p className="text-gray-700 mb-6">
            {streakCount >= 100 && "Legendary dedication! You're unstoppable!"}
            {streakCount >= 30 && streakCount < 100 && "You're absolutely crushing it!"}
            {streakCount >= 7 && streakCount < 30 && "You're on fire! Keep this momentum going!"}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white/80 rounded-xl p-4 border-2 border-orange-400">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <p className="text-sm text-gray-600">Achievement</p>
              <p className="text-xl font-bold text-blue-900">{streakCount} Days</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 border-2 border-orange-400">
              <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-sm text-gray-600">Bonus Points</p>
              <p className="text-xl font-bold text-purple-900">+{bonusPoints} XP</p>
            </div>
          </div>

          {streakCount >= 100 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-4 mb-4">
              <p className="text-sm font-bold text-yellow-900">🏆 Elite Achiever Badge Unlocked!</p>
            </div>
          )}

          <Button 
            onClick={onClose}
            className="w-full gradient-bg-primary text-white shadow-glow"
          >
            Keep Going! 🚀
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}