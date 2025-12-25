import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Utensils, Briefcase, Home, Cpu, Zap, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { 
    id: 'fitness', 
    name: 'Health & Fitness', 
    icon: Dumbbell, 
    color: 'from-red-500 to-orange-500',
    monetization: ['tips', 'affiliate', 'sponsored']
  },
  { 
    id: 'nutrition', 
    name: 'Nutrition', 
    icon: Utensils, 
    color: 'from-green-500 to-emerald-500',
    monetization: ['affiliate', 'tips']
  },
  { 
    id: 'professional', 
    name: 'Work-from-Home', 
    icon: Home, 
    color: 'from-blue-500 to-cyan-500',
    monetization: ['affiliate', 'sponsored', 'tips']
  },
  { 
    id: 'lifestyle', 
    name: 'Lifestyle', 
    icon: Zap, 
    color: 'from-purple-500 to-pink-500',
    monetization: ['tips', 'sponsored', 'affiliate']
  },
  { 
    id: 'tech', 
    name: 'Tech & Gadgets', 
    icon: Cpu, 
    color: 'from-cyan-500 to-blue-500',
    monetization: ['affiliate', 'sponsored']
  },
  { 
    id: 'viral', 
    name: 'Pop Culture', 
    icon: TrendingUp, 
    color: 'from-pink-500 to-purple-500',
    monetization: ['tips', 'sponsored', 'referrals']
  },
];

export default function TrendingTabs({ activeTab, onTabChange }) {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar bg-black/50 backdrop-blur-lg border-b border-zinc-800">
      <div className="flex gap-2 p-4 min-w-max">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onTabChange(tab)}
              className={cn(
                "relative flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all",
                "border backdrop-blur-sm",
                isActive
                  ? "bg-gradient-to-r border-purple-500/50 shadow-glow"
                  : "bg-zinc-900/50 border-zinc-800 hover:border-zinc-700"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                tab.color,
                !isActive && "opacity-70"
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className={cn(
                "font-semibold text-sm whitespace-nowrap",
                isActive ? "text-white" : "text-zinc-400"
              )}>
                {tab.name}
              </span>
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 border-2 border-purple-500 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export { tabs };