import React from 'react';
import { Crown, Star, Zap, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tierConfigs = {
  free: {
    icon: CheckCircle,
    label: 'Member',
    color: 'from-zinc-600 to-zinc-700',
    glow: false,
  },
  pro: {
    icon: Zap,
    label: 'Pro',
    color: 'from-purple-600 to-purple-700',
    glow: true,
  },
  elite: {
    icon: Crown,
    label: 'Elite',
    color: 'from-yellow-500 via-orange-500 to-pink-500',
    glow: true,
    animated: true,
  },
};

export default function VIPBadge({ tier = 'free', size = 'md', showLabel = true }) {
  const config = tierConfigs[tier] || tierConfigs.free;
  const Icon = config.icon;

  const sizes = {
    sm: { container: 'w-6 h-6', icon: 'w-3 h-3', text: 'text-xs' },
    md: { container: 'w-8 h-8', icon: 'w-4 h-4', text: 'text-sm' },
    lg: { container: 'w-12 h-12', icon: 'w-6 h-6', text: 'text-base' },
  };

  const sizeConfig = sizes[size];

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={config.animated ? { rotate: [0, 5, -5, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        className={cn(
          sizeConfig.container,
          "rounded-full flex items-center justify-center",
          "bg-gradient-to-br",
          config.color,
          config.glow && "shadow-glow-gold",
          config.animated && "animate-pulse-glow"
        )}
      >
        <Icon className={cn(sizeConfig.icon, "text-white")} />
      </motion.div>
      {showLabel && (
        <span className={cn(
          sizeConfig.text,
          "font-bold",
          tier === 'elite' && "gradient-text"
        )}>
          {config.label}
        </span>
      )}
    </div>
  );
}