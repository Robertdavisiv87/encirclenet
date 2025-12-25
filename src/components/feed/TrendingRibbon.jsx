import React from 'react';
import { Flame, TrendingUp, Zap, Star, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const trendingTopics = [
  { id: 1, label: 'Hot this hour', icon: Flame, color: 'from-red-500 to-orange-500', tag: '#ViralToday' },
  { id: 2, label: 'Trending', icon: TrendingUp, color: 'from-purple-500 to-pink-500', tag: '#EliteCircles' },
  { id: 3, label: 'Top Value', icon: Zap, color: 'from-yellow-500 to-orange-500', tag: '#ValuePosts' },
  { id: 4, label: 'Rising Stars', icon: Star, color: 'from-blue-500 to-cyan-500', tag: '#NewCreators' },
  { id: 5, label: 'Elite Content', icon: Trophy, color: 'from-purple-600 to-pink-600', tag: '#ElitePosts' },
];

export default function TrendingRibbon({ onSelectTrend }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar py-3 px-4 border-b border-zinc-800 bg-black/50 backdrop-blur-lg">
      <div className="flex gap-3 min-w-max">
        {trendingTopics.map((topic, index) => {
          const Icon = topic.icon;
          return (
            <motion.button
              key={topic.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onSelectTrend && onSelectTrend(topic)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full",
                "bg-zinc-900 border border-zinc-800",
                "hover-lift hover:border-purple-500/50 transition-all"
              )}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                "bg-gradient-to-br",
                topic.color,
                "shadow-glow"
              )}>
                <Icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold">{topic.label}</span>
              <span className="text-xs text-zinc-500">{topic.tag}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}