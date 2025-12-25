import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users } from 'lucide-react';

const nicheIcons = {
  fitness: '💪',
  nutrition: '🥗',
  professional: '💼',
  remote: '🏠',
  lifestyle: '✨',
};

export default function NicheCard({ niche, trending, activeUsers, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="bg-zinc-900 border-zinc-800 hover:border-purple-500/50 transition-all cursor-pointer hover-lift overflow-hidden"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-4xl">{nicheIcons[niche.id] || '🌟'}</div>
            {trending && (
              <Badge variant="gradient" className="animate-pulse-glow">
                <TrendingUp className="w-3 h-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
          <h3 className="text-lg font-bold mb-2">{niche.name}</h3>
          <p className="text-sm text-zinc-400 mb-4">{niche.description}</p>
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{activeUsers || 0} active</span>
            </div>
            <span className="text-purple-400 font-semibold">{niche.postCount || 0} posts</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}