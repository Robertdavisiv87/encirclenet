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
  Clock,
  Heart,
  MousePointerClick,
  Crown,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReferralCard from '../components/monetization/ReferralCard';
import TierBadge from '../components/monetization/TierBadge';
import PassiveIncomeCard from '../components/monetization/PassiveIncomeCard';

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
  const adRevenue = allRevenue.filter(r => r.source === 'ads').reduce((sum, r) => sum + (r.amount || 0), 0);
  const affiliateRevenue = allRevenue.filter(r => r.source === 'affiliate').reduce((sum, r) => sum + (r.amount || 0), 0);
  const tipsEarnings = transactions.filter(t => t.type === 'tip').reduce((sum, t) => sum + (t.amount || 0), 0);
  const subscriptionRevenue = allRevenue.filter(r => r.source === 'subscriptions').reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalEarnings = tipsEarnings + referralEarnings + adRevenue + affiliateRevenue + subscriptionRevenue;
  const tipsCount = transactions.filter(t => t.type === 'tip').length;
  const boostsCount = transactions.filter(t => t.type === 'boost').length;

  // Calculate trend (mock data - in real app, compare with previous period)
  const earningsTrend = 12.5;

  const stats = [
    { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Tips & Boosts', value: `$${tipsEarnings.toFixed(2)}`, icon: Gift, color: 'from-pink-500 to-rose-500' },
    { label: 'Referrals', value: `$${referralEarnings.toFixed(2)}`, icon: Users, color: 'from-purple-500 to-indigo-500' },
    { label: 'Ads & Affiliate', value: `$${(adRevenue + affiliateRevenue).toFixed(2)}`, icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
  ];

  const userTier = subscription?.tier || 'free';

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Passive Income Dashboard</h1>
          <p className="text-zinc-300">Earn automatically from your participation & engagement</p>
        </div>
        <TierBadge tier={userTier} size="md" />
      </div>

      {/* Passive Income Explainer */}
      <div className="mb-6">
        <PassiveIncomeCard userTier={userTier} />
      </div>

      {/* Top Section - Total Earnings with Trend */}
      <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 border-purple-400/40 mb-6 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Total Earnings</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-bold text-green-400">
                  ${totalEarnings.toFixed(2)}
                </h2>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{earningsTrend}%</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/subscription'}
              className="bg-gradient-to-r from-purple-600 to-pink-500"
            >
              Upgrade Tier
            </Button>
          </div>
          
          {/* Mini Chart Preview */}
          <div className="flex items-end gap-1 h-16">
            {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 85, 100].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monetization Streams Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Monetization Streams
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-pink-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <p className="text-2xl font-bold">${tipsEarnings.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Tips & Boosts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-purple-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-2xl font-bold">${referralEarnings.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Referrals</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <MousePointerClick className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold">${adRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Ad Revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-green-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Link className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold">${affiliateRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Affiliate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold">${subscriptionRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Subscriptions</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Activity Feed & Referral */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Activity Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.type === 'tip' ? "bg-pink-500/20" : "bg-purple-500/20"
                    )}>
                      {transaction.type === 'tip' ? '💝' : '⭐'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.from_name || 'Anonymous'}</p>
                      <p className="text-xs text-zinc-500">
                        {transaction.type} • {new Date(transaction.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">+${transaction.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Card */}
        <ReferralCard 
          referralCount={referrals.length}
          totalEarnings={referralEarnings}
        />
      </div>



      {/* Payout Info */}
      <Card className="bg-zinc-900 border-zinc-800 mt-6">
        <CardContent className="p-6">
          {totalEarnings > 0 ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Available for Payout</p>
                  <p className="text-2xl font-bold text-green-400">${totalEarnings.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Minimum payout: $10.00</p>
                </div>
              </div>
              <Button 
                className="bg-gradient-to-r from-green-600 to-emerald-500"
                disabled={totalEarnings < 10}
              >
                {totalEarnings >= 10 ? 'Withdraw' : 'Not Available'}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-bold mb-2">Start Earning Today</h3>
              <p className="text-gray-400 text-sm mb-4">
                Your earnings will appear here. Start creating content, inviting friends, and engaging to earn!
              </p>
              <div className="bg-zinc-800/50 rounded-xl p-4 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2">Quick earning tips:</p>
                <ul className="space-y-1 text-xs text-gray-400">
                  <li>• Post quality content to receive tips</li>
                  <li>• Share your referral code to earn $5-$50 per signup</li>
                  <li>• Join affiliate programs for commission</li>
                  <li>• Engage with ads to earn PPC revenue</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}