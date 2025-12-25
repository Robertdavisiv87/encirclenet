import React from 'react';
import { Crown, Zap, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const tierConfig = {
  free: {
    icon: CheckCircle,
    color: 'text-zinc-400',
    bg: 'bg-zinc-800',
    label: 'Free'
  },
  pro: {
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/20',
    label: 'Pro'
  },
  elite: {
    icon: Crown,
    color: 'text-yellow-400',
    bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
    label: 'Elite'
  }
};

export default function TierBadge({ tier = 'free', size = 'sm' }) {
  const config = tierConfig[tier] || tierConfig.free;
  const Icon = config.icon;
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold shadow-lg hover-scale cursor-pointer",
      config.bg,
      config.color,
      size === 'sm' && "text-xs",
      size === 'md' && "text-sm px-3 py-1",
      tier === 'elite' && "shadow-glow-gold animate-pulse-glow"
    )}>
      <Icon className={cn(
        size === 'sm' ? "w-3 h-3" : "w-4 h-4",
        tier === 'elite' && "animate-float"
      )} />
      {config.label}
    </div>
  );
}