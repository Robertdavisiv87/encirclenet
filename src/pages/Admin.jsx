import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  MousePointerClick,
  Crown,
  Gift,
  Target,
  ArrowUpRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function Admin() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser.role !== 'admin') {
          window.location.href = '/';
          return;
        }
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: allRevenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => base44.entities.Revenue.list('-created_date', 100),
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 100),
    initialData: []
  });

  const { data: adClicks } = useQuery({
    queryKey: ['admin-adclicks'],
    queryFn: () => base44.entities.AdClick.list('-created_date', 100),
    initialData: []
  });

  const { data: referrals } = useQuery({
    queryKey: ['admin-referrals'],
    queryFn: () => base44.entities.Referral.list('-created_date', 100),
    initialData: []
  });

  const totalRevenue = allRevenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const subscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0);
  const adRevenue = adClicks.reduce((sum, a) => sum + (a.click_value || 0), 0);
  const referralRevenue = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

  const stats = [
    { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Subscriptions', value: subscriptions.filter(s => s.status === 'active').length, icon: Crown, color: 'from-purple-500 to-pink-500' },
    { label: 'Ad Clicks', value: adClicks.length, icon: MousePointerClick, color: 'from-blue-500 to-cyan-500' },
    { label: 'Referrals', value: referrals.length, icon: Target, color: 'from-orange-500 to-red-500' }
  ];

  const revenueBreakdown = [
    { label: 'Subscriptions', amount: subscriptionRevenue, percentage: (subscriptionRevenue / totalRevenue * 100) || 0 },
    { label: 'Tips & Boosts', amount: allRevenue.filter(r => r.source === 'tips').reduce((sum, r) => sum + r.amount, 0), percentage: 0 },
    { label: 'Ad Revenue', amount: adRevenue, percentage: (adRevenue / totalRevenue * 100) || 0 },
    { label: 'Affiliate', amount: allRevenue.filter(r => r.source === 'affiliate').reduce((sum, r) => sum + r.amount, 0), percentage: 0 },
    { label: 'Referrals', amount: referralRevenue, percentage: (referralRevenue / totalRevenue * 100) || 0 }
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-500">Platform analytics and revenue insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-zinc-500">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Breakdown */}
      <Card className="bg-zinc-900 border-zinc-800 mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-sm text-zinc-500">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold ml-6 text-green-400">
                  ${item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Subscriptions</span>
              <ArrowUpRight className="w-4 h-4 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{sub.user_email}</p>
                    <p className="text-xs text-zinc-500 uppercase">{sub.tier} tier</p>
                  </div>
                  <p className="font-bold text-green-400">${sub.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Top Referrers</span>
              <Target className="w-4 h-4 text-orange-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((ref, i) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{ref.referrer_email}</p>
                      <p className="text-xs text-zinc-500">{ref.status}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">${ref.commission_earned}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </AdminProtection>
  );
}