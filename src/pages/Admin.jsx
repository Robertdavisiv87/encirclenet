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
import AdminProtection from '../components/auth/AdminProtection';

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
  const tipsRevenue = allRevenue.filter(r => r.source === 'tips').reduce((sum, r) => sum + (r.amount || 0), 0);
  const affiliateRevenue = allRevenue.filter(r => r.source === 'affiliate').reduce((sum, r) => sum + (r.amount || 0), 0);
  
  const accurateTotal = subscriptionRevenue + tipsRevenue + adRevenue + affiliateRevenue + referralRevenue;

  const stats = [
    { label: 'Total Revenue', value: `$${accurateTotal.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Subscriptions', value: subscriptions.filter(s => s.status === 'active').length, icon: Crown, color: 'from-purple-500 to-pink-500' },
    { label: 'Ad Clicks', value: adClicks.length, icon: MousePointerClick, color: 'from-blue-500 to-cyan-500' },
    { label: 'Referrals', value: referrals.length, icon: Target, color: 'from-orange-500 to-red-500' }
  ];
  
  const revenueBreakdown = [
    { label: 'Subscriptions', amount: subscriptionRevenue, percentage: accurateTotal > 0 ? (subscriptionRevenue / accurateTotal * 100) : 0 },
    { label: 'Tips & Boosts', amount: tipsRevenue, percentage: accurateTotal > 0 ? (tipsRevenue / accurateTotal * 100) : 0 },
    { label: 'Ad Revenue', amount: adRevenue, percentage: accurateTotal > 0 ? (adRevenue / accurateTotal * 100) : 0 },
    { label: 'Affiliate', amount: affiliateRevenue, percentage: accurateTotal > 0 ? (affiliateRevenue / accurateTotal * 100) : 0 },
    { label: 'Referrals', amount: referralRevenue, percentage: accurateTotal > 0 ? (referralRevenue / accurateTotal * 100) : 0 }
  ];

  if (!user || user.role !== 'admin') return null;

  return (
    <AdminProtection>
      <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform analytics and revenue insights</p>
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
              <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Breakdown */}
      <Card className="bg-white border-2 border-gray-200 realistic-shadow mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Revenue Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {revenueBreakdown.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-blue-900">{item.label}</span>
                    <span className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
                <span className="text-lg font-bold ml-6 text-green-600">
                  ${item.amount.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-900">
              <span>Recent Subscriptions</span>
              <ArrowUpRight className="w-4 h-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <div>
                    <p className="font-medium text-sm text-blue-900">{sub.user_email}</p>
                    <p className="text-xs text-gray-600 uppercase">{sub.tier} tier</p>
                  </div>
                  <p className="font-bold text-green-600">${sub.price}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-blue-900">
              <span>Top Referrers</span>
              <Target className="w-4 h-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referrals.slice(0, 5).map((ref, i) => (
                <div key={ref.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center font-bold text-white shadow-md">
                      #{i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-blue-900">{ref.referrer_email}</p>
                      <p className="text-xs text-gray-600">{ref.status}</p>
                    </div>
                  </div>
                  <p className="font-bold text-green-600">${ref.commission_earned}</p>
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