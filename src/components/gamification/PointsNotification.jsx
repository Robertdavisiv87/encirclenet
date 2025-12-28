import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Zap } from 'lucide-react';

export default function PointsNotification({ points, level, leveledUp, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce-in">
            {leveledUp ? (
              <>
                <Trophy className="w-8 h-8 text-yellow-300 animate-pulse-glow" />
                <div>
                  <p className="font-bold text-lg">Level Up! 🎉</p>
                  <p className="text-sm">You're now Level {level}</p>
                </div>
              </>
            ) : (
              <>
                <Star className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="font-bold text-lg">+{points} Points!</p>
                  <p className="text-sm">Keep it up!</p>
                </div>
              </>
            )}
            <Zap className="w-6 h-6 text-yellow-300 animate-pulse" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}