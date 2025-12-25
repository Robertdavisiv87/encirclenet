import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight,
  Gift,
  Star,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReferralCard from '../components/monetization/ReferralCard';
import TierBadge from '../components/monetization/TierBadge';

export default function Earnings() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ['my-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ to_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: allRevenue } = useQuery({
    queryKey: ['my-revenue', user?.email],
    queryFn: () => base44.entities.Revenue.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: referrals } = useQuery({
    queryKey: ['my-referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: subscription } = useQuery({
    queryKey: ['my-sub-earnings', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const adRevenue = allRevenue.filter(r => r.source === 'ads').reduce((sum, r) => sum + r.amount, 0);
  const affiliateRevenue = allRevenue.filter(r => r.source === 'affiliate').reduce((sum, r) => sum + r.amount, 0);

  const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const tipsCount = transactions.filter(t => t.type === 'tip').length;
  const boostsCount = transactions.filter(t => t.type === 'boost').length;

  const stats = [
    { label: 'Total Earned', value: `$${(totalEarnings + referralEarnings + adRevenue + affiliateRevenue).toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Tips & Boosts', value: `$${totalEarnings.toFixed(2)}`, icon: Gift, color: 'from-pink-500 to-rose-500' },
    { label: 'Referrals', value: `$${referralEarnings.toFixed(2)}`, icon: Users, color: 'from-purple-500 to-indigo-500' },
    { label: 'Ads & Affiliate', value: `$${(adRevenue + affiliateRevenue).toFixed(2)}`, icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">CircleValue</h1>
        <p className="text-zinc-500">Your earnings from authentic connections</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
              <CardContent className="p-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3",
                  stat.color
                )}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-zinc-500">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Tier Upgrade CTA */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-500/30 mb-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-bold">Maximize Your Earnings</h3>
                <TierBadge tier={subscription?.tier || 'free'} />
              </div>
              <p className="text-zinc-300 text-sm">
                {subscription?.tier === 'elite' 
                  ? 'You\'re earning at maximum capacity with Elite tier benefits!'
                  : `Upgrade to ${subscription?.tier === 'pro' ? 'Elite' : 'Pro'} for ${subscription?.tier === 'pro' ? '5x' : '2x'} referral bonuses and more revenue streams.`
                }
              </p>
            </div>
            {subscription?.tier !== 'elite' && (
              <Button 
                onClick={() => window.location.href = '/subscription'}
                className="bg-white text-purple-900 hover:bg-zinc-100"
              >
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <ReferralCard 
        user={user} 
        referralStats={{ count: referrals.length, earnings: referralEarnings }}
      />

      {/* Recent Transactions */}
      <Card className="bg-zinc-900 border-zinc-800 mt-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <Button variant="ghost" size="sm" className="text-purple-400">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Start creating content to receive tips!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      transaction.type === 'tip' 
                        ? "bg-pink-500/20 text-pink-500"
                        : "bg-yellow-500/20 text-yellow-500"
                    )}>
                      {transaction.type === 'tip' ? <Gift className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.from_name || 'Anonymous'}</p>
                      <p className="text-sm text-zinc-500">
                        {transaction.type === 'tip' ? 'Sent you a tip' : 'Boosted your value'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">+${transaction.amount}</p>
                    <p className="text-xs text-zinc-500">
                      <Clock className="w-3 h-3 inline mr-1" />
                      {new Date(transaction.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Info */}
      <Card className="bg-zinc-900 border-zinc-800 mt-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="font-medium">Available for Payout</p>
                <p className="text-2xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
            <Button className="bg-gradient-to-r from-green-600 to-emerald-500">
              Withdraw
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}