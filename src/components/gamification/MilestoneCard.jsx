import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Flame, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const milestoneTypes = {
  posts: { icon: Star, color: 'from-blue-500 to-cyan-500', label: 'Content Creator' },
  likes: { icon: Flame, color: 'from-red-500 to-orange-500', label: 'Trending Star' },
  referrals: { icon: Users, color: 'from-purple-500 to-pink-500', label: 'Community Builder' },
  earnings: { icon: Zap, color: 'from-green-500 to-emerald-500', label: 'Value Champion' },
  streak: { icon: Trophy, color: 'from-yellow-500 to-orange-500', label: 'Consistency King' },
};

export default function MilestoneCard({ type, current, target, title }) {
  const config = milestoneTypes[type] || milestoneTypes.posts;
  const Icon = config.icon;
  const progress = (current / target) * 100;
  const isComplete = current >= target;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className={cn(
        "bg-zinc-900 border-zinc-800 overflow-hidden hover-lift",
        isComplete && "border-2 border-purple-500/50 shadow-glow"
      )}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br",
                config.color,
                isComplete && "animate-pulse-glow"
              )}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">{title || config.label}</p>
                <p className="text-xs text-zinc-500">
                  {current}/{target}
                </p>
              </div>
            </div>
            {isComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-2xl"
              >
                🎉
              </motion.div>
            )}
          </div>
          <Progress value={progress} className="h-2" />
          {isComplete && (
            <p className="text-xs text-green-400 mt-2 font-semibold">✓ Milestone Complete!</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}