import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, Download, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import AdminProtection from '../components/auth/AdminProtection';

export default function AdminRevenue() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  const { data: allRevenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => base44.entities.Revenue.list('-created_date', 1000),
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
    initialData: [],
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.filter({ status: 'active' }),
    initialData: [],
  });

  // Calculate platform revenue shares
  const tipsRevenue = transactions
    .filter(t => t.type === 'tip')
    .reduce((sum, t) => sum + (t.amount * 0.25), 0); // 25% platform share

  const affiliateRevenue = allRevenue
    .filter(r => r.source === 'affiliate')
    .reduce((sum, r) => sum + (r.amount * 0.4), 0); // 40% platform share

  const sponsoredRevenue = allRevenue
    .filter(r => r.source === 'ads')
    .reduce((sum, r) => sum + (r.amount * 0.35), 0); // 35% platform share

  const subscriptionRevenue = subscriptions
    .reduce((sum, s) => sum + (s.price || 0), 0); // 100% platform

  const referralRevenue = allRevenue
    .filter(r => r.source === 'referrals')
    .reduce((sum, r) => sum + (r.amount * 0.55), 0); // 55% platform share

  const totalPlatformRevenue = 
    tipsRevenue + 
    affiliateRevenue + 
    sponsoredRevenue + 
    subscriptionRevenue + 
    referralRevenue;

  const revenueBreakdown = [
    { source: 'Tips & Boosts', amount: tipsRevenue, share: '20-30%', color: 'from-green-500 to-emerald-500' },
    { source: 'Affiliate', amount: affiliateRevenue, share: '30-50%', color: 'from-blue-500 to-cyan-500' },
    { source: 'Sponsored Posts', amount: sponsoredRevenue, share: '30-40%', color: 'from-purple-500 to-pink-500' },
    { source: 'Subscriptions', amount: subscriptionRevenue, share: '70-100%', color: 'from-yellow-500 to-orange-500' },
    { source: 'Referrals', amount: referralRevenue, share: '50-60%', color: 'from-red-500 to-pink-500' },
  ];

  const handleCashOut = async () => {
    alert(`Cash-out functionality: $${totalPlatformRevenue.toFixed(2)} ready for withdrawal.`);
    // TODO: Integrate with payment processor (Stripe, PayPal)
  };

  return (
    <AdminProtection>
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Platform Revenue</h1>
          <p className="text-zinc-400">Admin: {user?.full_name || 'Robert Davis'}</p>
        </div>
        <Button 
          onClick={handleCashOut}
          className="bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90"
        >
          <Download className="w-5 h-5 mr-2" />
          Cash Out
        </Button>
      </div>

      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/50 mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-zinc-400 mb-2">Total Platform Revenue</p>
                <h2 className="text-5xl font-bold gradient-text">
                  ${totalPlatformRevenue.toFixed(2)}
                </h2>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-600 to-emerald-500 flex items-center justify-center shadow-glow">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {revenueBreakdown.map((item, index) => (
          <motion.div
            key={item.source}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-sm font-medium text-zinc-400">
                  {item.source}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold">${item.amount.toFixed(2)}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Platform Share: {item.share}</p>
                </div>
                <div className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Recent Platform Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allRevenue.slice(0, 10).map((rev) => (
              <div key={rev.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize">{rev.source}</p>
                  <p className="text-xs text-zinc-500">{rev.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">${rev.amount.toFixed(2)}</p>
                  <p className={`text-xs ${rev.status === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {rev.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminProtection>
  );
}