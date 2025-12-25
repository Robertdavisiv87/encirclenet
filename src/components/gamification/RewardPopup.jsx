import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Flame, DollarSign, Crown } from 'lucide-react';
import confetti from 'canvas-confetti';

const rewardTypes = {
  streak: { icon: Flame, color: 'from-orange-500 to-red-500', title: 'Streak Bonus!' },
  points: { icon: Star, color: 'from-yellow-500 to-orange-500', title: 'Points Earned!' },
  level: { icon: Trophy, color: 'from-purple-500 to-pink-500', title: 'Level Up!' },
  earnings: { icon: DollarSign, color: 'from-green-500 to-emerald-500', title: 'Earning Alert!' },
  vip: { icon: Crown, color: 'from-yellow-600 to-orange-600', title: 'VIP Status!' },
};

export default function RewardPopup({ type, message, value, onClose }) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Trigger confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B'],
    });

    // Auto-close after 3 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(() => onClose && onClose(), 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const config = rewardTypes[type] || rewardTypes.points;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-sm w-full px-4"
        >
          <div className={cn(
            "bg-zinc-900 rounded-2xl p-6 border-2",
            "shadow-2xl card-depth-3",
            "bg-gradient-to-br",
            config.color.replace('to-', 'to-transparent from-')
          )}>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br",
                  config.color,
                  "shadow-glow"
                )}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-1">{config.title}</h3>
                <p className="text-zinc-300 text-sm">{message}</p>
                {value && (
                  <p className="text-2xl font-bold gradient-text mt-2">{value}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}