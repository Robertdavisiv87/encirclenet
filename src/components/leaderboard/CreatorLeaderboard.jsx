import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';
import VIPBadge from '../profile/VIPBadge';
import { cn } from '@/lib/utils';

export default function CreatorLeaderboard({ creators, type = 'engagement' }) {
  const icons = {
    engagement: TrendingUp,
    earnings: DollarSign,
    growth: Trophy,
  };

  const Icon = icons[type] || TrendingUp;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-yellow-500" />
          Top Creators - {type === 'engagement' ? 'Engagement' : type === 'earnings' ? 'Earnings' : 'Growth'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {creators.map((creator, index) => (
            <motion.div
              key={creator.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "flex items-center gap-4 p-3 rounded-xl hover-lift cursor-pointer",
                index === 0 && "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30",
                index === 1 && "bg-gradient-to-r from-zinc-400/20 to-zinc-500/20 border border-zinc-400/30",
                index === 2 && "bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30",
                index > 2 && "bg-zinc-800/50 hover:bg-zinc-800"
              )}
            >
              <div className={cn(
                "text-2xl font-bold w-8 text-center",
                index === 0 && "text-yellow-500",
                index === 1 && "text-zinc-400",
                index === 2 && "text-orange-500",
                index > 2 && "text-zinc-500"
              )}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <Avatar className="w-12 h-12 ring-2 ring-purple-500/50">
                <AvatarImage src={creator.avatar} />
                <AvatarFallback className="gradient-bg-primary">
                  {creator.full_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold truncate">{creator.full_name}</p>
                  <VIPBadge tier={creator.tier} size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-zinc-500 truncate">{creator.email}</p>
              </div>
              <div className="text-right">
                {type === 'engagement' && (
                  <p className="text-sm font-bold text-purple-400">{creator.likes_received || 0}</p>
                )}
                {type === 'earnings' && (
                  <p className="text-sm font-bold text-green-400">${creator.total_earned || 0}</p>
                )}
                {type === 'growth' && (
                  <p className="text-sm font-bold text-yellow-400">+{creator.followers || 0}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}