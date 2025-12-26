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
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">💰 Your Earnings, Your Growth!</h1>
        <p className="text-blue-900 font-medium">Track your total revenue across multiple streams in real-time. Share, post, and engage to boost your earnings automatically!</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button 
          onClick={handleCashOut}
          className="gradient-bg-primary text-white shadow-glow hover-lift"
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
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 realistic-shadow mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-semibold mb-2">Total Platform Revenue</p>
                <h2 className="text-5xl font-bold gradient-text">
                  ${totalPlatformRevenue.toFixed(2)}
                </h2>
              </div>
              <div className="w-20 h-20 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
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
            <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-blue-900">
                  {item.source}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-blue-900">${item.amount.toFixed(2)}</h3>
                  <p className="text-xs text-gray-600 mt-1">Platform Share: {item.share}</p>
                </div>
                <div className={`h-3 rounded-full bg-gradient-to-r ${item.color} shadow-md`}></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white border-2 border-gray-200 realistic-shadow">
        <CardHeader>
          <CardTitle className="text-blue-900">Recent Platform Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allRevenue.slice(0, 10).map((rev) => (
              <div key={rev.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-xl hover-lift">
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize text-blue-900">{rev.source}</p>
                  <p className="text-xs text-gray-600">{rev.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${rev.amount.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${rev.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
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