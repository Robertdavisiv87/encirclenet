import React from 'react';
import { Crown, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tierConfig = {
  free: {
    icon: CheckCircle,
    color: 'text-gray-700',
    bg: 'bg-gradient-to-r from-gray-100 to-gray-200',
    border: 'border-gray-300',
    label: 'Free'
  },
  pro: {
    icon: Zap,
    color: 'text-purple-700',
    bg: 'bg-gradient-to-r from-purple-100 to-pink-100',
    border: 'border-purple-400',
    label: 'Pro'
  },
  elite: {
    icon: Crown,
    color: 'text-yellow-700',
    bg: 'bg-gradient-to-r from-yellow-100 to-orange-100',
    border: 'border-yellow-500',
    label: 'Elite'
  }
};

export default function TierBadge({ tier = 'free', size = 'sm' }) {
  const config = tierConfig[tier] || tierConfig.free;
  const Icon = config.icon;
  
  return (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold shadow-md border-2",
        config.bg,
        config.color,
        config.border,
        size === 'sm' && "text-xs",
        size === 'md' && "text-sm px-3 py-1",
        tier === 'elite' && "shadow-glow-gold"
      )}
    >
      <motion.div
        animate={tier === 'elite' ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <Icon className={cn(
          size === 'sm' ? "w-3 h-3" : "w-4 h-4"
        )} />
      </motion.div>
      {config.label}
    </motion.div>
  );
}