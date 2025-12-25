import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Zap, Users, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PassiveIncomeCard({ userTier = 'free' }) {
  const incomeStreams = [
    {
      icon: Zap,
      title: 'Engagement Revenue',
      description: 'Earn from every like, comment, and share you receive',
      earnings: userTier === 'free' ? '$0.01' : userTier === 'pro' ? '$0.05' : '$0.10',
      color: 'from-purple-500 to-blue-500'
    },
    {
      icon: TrendingUp,
      title: 'Content Royalties',
      description: 'Your posts earn continuously as they get views',
      earnings: userTier === 'free' ? 'Locked' : userTier === 'pro' ? '$0.02/view' : '$0.05/view',
      color: 'from-blue-500 to-green-500'
    },
    {
      icon: Users,
      title: 'Referral Network',
      description: 'Earn 10% from everyone you invite, forever',
      earnings: '10% lifetime',
      color: 'from-green-500 to-orange-500'
    },
    {
      icon: DollarSign,
      title: 'Tier Multiplier',
      description: 'Higher tiers multiply your participation earnings',
      earnings: userTier === 'free' ? '1x' : userTier === 'pro' ? '3x' : '10x',
      color: 'from-orange-500 to-purple-500'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 shadow-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          <span className="gradient-text">Passive Income Streams</span>
        </CardTitle>
        <p className="text-sm text-zinc-400">
          Earn money automatically from your participation
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {incomeStreams.map((stream, index) => {
          const Icon = stream.icon;
          return (
            <motion.div
              key={stream.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-4 p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800/70 transition-all"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stream.color} flex items-center justify-center shadow-glow-blue flex-shrink-0`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">{stream.title}</h4>
                <p className="text-sm text-zinc-400 mb-2">{stream.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                    {stream.earnings} per action
                  </span>
                  {userTier === 'free' && stream.earnings === 'Locked' && (
                    <span className="text-xs text-orange-400">Upgrade to unlock</span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
        
        {userTier === 'free' && (
          <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-xl border border-purple-500/30">
            <p className="text-sm text-center font-medium mb-2">
              🚀 Upgrade to multiply your earnings by up to 10x!
            </p>
            <p className="text-xs text-center text-zinc-400">
              Pro & Elite members earn passive income from all platform activity
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}