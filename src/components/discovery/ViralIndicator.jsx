import React from 'react';
import { Flame, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ViralIndicator({ type = 'hot', count }) {
  const configs = {
    hot: {
      icon: Flame,
      label: 'Hot',
      color: 'from-red-500 to-orange-500',
      bg: 'bg-red-500/20',
    },
    trending: {
      icon: TrendingUp,
      label: 'Trending',
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-500/20',
    },
    viral: {
      icon: Zap,
      label: 'Viral',
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-500/20',
    },
  };

  const config = configs[type] || configs.hot;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
        config.bg,
        "border border-white/10",
        "backdrop-blur-sm"
      )}
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Icon className="w-3.5 h-3.5 text-white" />
      </motion.div>
      <span className="text-xs font-bold text-white">{config.label}</span>
      {count && (
        <span className="text-xs font-semibold text-white/80">{count}</span>
      )}
    </motion.div>
  );
}