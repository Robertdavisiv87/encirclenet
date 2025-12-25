import React from 'react';
import { Award, Star, Zap, Crown, Gift, Target, TrendingUp, Heart, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const badgeIcons = {
  first_post: Star,
  week_streak: Zap,
  month_streak: Crown,
  top_creator: TrendingUp,
  influencer: Users,
  referral_master: Gift,
  early_adopter: Award,
  elite_member: Crown,
  engagement_king: Heart,
  viral_post: Target
};

const badgeColors = {
  first_post: 'from-blue-500 to-cyan-500',
  week_streak: 'from-orange-500 to-red-500',
  month_streak: 'from-yellow-500 to-orange-500',
  top_creator: 'from-purple-500 to-pink-500',
  influencer: 'from-green-500 to-emerald-500',
  referral_master: 'from-pink-500 to-rose-500',
  early_adopter: 'from-indigo-500 to-purple-500',
  elite_member: 'from-yellow-400 to-orange-400',
  engagement_king: 'from-red-500 to-pink-500',
  viral_post: 'from-cyan-500 to-blue-500'
};

export default function BadgeShowcase({ badges, maxDisplay = 5 }) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remaining = badges.length - maxDisplay;

  return (
    <div className="flex items-center gap-2">
      {displayBadges.map((badge, index) => {
        const Icon = badgeIcons[badge.badge_type] || Award;
        const gradient = badgeColors[badge.badge_type] || 'from-zinc-500 to-zinc-600';
        
        return (
          <motion.div
            key={badge.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center ring-2 ring-black",
              gradient
            )}
            title={badge.display_name}
          >
            <Icon className="w-5 h-5 text-white" />
          </motion.div>
        );
      })}
      
      {remaining > 0 && (
        <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
          +{remaining}
        </div>
      )}
    </div>
  );
}