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
  ArrowUpRight,
  Activity,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import AdminProtection from '../components/auth/AdminProtection';
import PayoutApprovalQueue from '../components/admin/PayoutApprovalQueue';
import AdvancedAnalyticsDashboard from '../components/admin/AdvancedAnalyticsDashboard';
import AIContentModerator from '../components/admin/AIContentModerator';
import ReferralTierManager from '../components/admin/ReferralTierManager';
import ReferralBonusManager from '../components/admin/ReferralBonusManager';
import EarningsDashboard from '../components/creator/EarningsDashboard';
import PerformanceMonitor from '../components/system/PerformanceMonitor';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';

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

  // Live tracking data
  const { data: allPosts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    refetchInterval: 5000, // Refresh every 5 seconds
    initialData: []
  });

  const { data: allLikes } = useQuery({
    queryKey: ['admin-likes'],
    queryFn: () => base44.entities.Like.list('-created_date', 100),
    refetchInterval: 5000,
    initialData: []
  });

  const { data: allTransactions } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 50),
    refetchInterval: 5000,
    initialData: []
  });

  const { data: allUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.asServiceRole.entities.User.list('-created_date', 100),
    refetchInterval: 10000,
    initialData: []
  });

  const { data: contactReferrals } = useQuery({
    queryKey: ['admin-contact-referrals'],
    queryFn: () => base44.entities.ContactReferral.list('-created_date', 50),
    refetchInterval: 5000,
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">24/7 Auto-Monitoring • AI-Powered • Elite Performance</p>
          </div>
          <a 
            href={base44.agents.getWhatsAppConnectURL('encirclenet_support_auditor')} 
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-lg"
          >
            💬 Support Agent
          </a>
        </div>
        
        {/* System Performance Monitor */}
        <div className="mb-6">
          <PerformanceMonitor />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <a href={createPageUrl('AdminRevenue')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-green-200">
            <CardContent className="p-4 text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-semibold text-sm text-gray-900">Revenue</p>
            </CardContent>
          </Card>
        </a>
        <a href={createPageUrl('SystemStatus')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-semibold text-sm text-gray-900">System Status</p>
            </CardContent>
          </Card>
        </a>
        <a href={createPageUrl('ModerationDashboard')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-red-200">
            <CardContent className="p-4 text-center">
              <Bell className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="font-semibold text-sm text-gray-900">Moderation</p>
            </CardContent>
          </Card>
        </a>
        <a href={createPageUrl('ManageServiceVerticals')}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-2 border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="font-semibold text-sm text-gray-900">Services</p>
            </CardContent>
          </Card>
        </a>
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

      {/* Automated Payout System */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Automated Payout System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Automatically process payouts for creators who meet the threshold criteria.
            </p>
            <Button
              onClick={async () => {
                try {
                  const result = await base44.functions.invoke('processAutomatedPayouts', {
                    threshold: 50,
                    auto_approve: true
                  });
                  alert(`✅ ${result.data.message}\n\nRevenue: ${result.data.processed}\nReferrals: ${result.data.referrals_processed}\nTotal Approved: ${result.data.approved}`);
                  window.location.reload();
                } catch (error) {
                  alert('❌ Automated payout failed: ' + error.message);
                }
              }}
              className="gradient-bg-primary text-white"
            >
              Run Automated Payouts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payout Approval Queue */}
      <div className="mb-8">
        <PayoutApprovalQueue />
      </div>

      {/* Advanced Analytics Dashboard */}
      <div className="mb-8">
        <AdvancedAnalyticsDashboard />
      </div>

      {/* AI Content Moderator */}
      <div className="mb-8">
        <AIContentModerator />
      </div>

      {/* Tabs for Recent Activity and Live Tracking */}
      <Tabs defaultValue="recent" className="mb-8">
        <TabsList className="w-full bg-white border-2 border-gray-200 p-1">
          <TabsTrigger value="recent" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Recent Activity
          </TabsTrigger>
          <TabsTrigger value="live" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            <Activity className="w-4 h-4 mr-2 inline" />
            Live Tracking
          </TabsTrigger>
          <TabsTrigger value="tiers" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Referral Tiers
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Bonus Rules
          </TabsTrigger>
        </TabsList>

        {/* Recent Activity Tab */}
        <TabsContent value="recent">
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
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="live">
          <div className="space-y-6">
            {/* Live Activity Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300">
                <CardContent className="p-4">
                  <Eye className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{allPosts.length}</p>
                  <p className="text-xs text-gray-600">Recent Posts</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300">
                <CardContent className="p-4">
                  <Heart className="w-8 h-8 text-pink-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{allLikes.length}</p>
                  <p className="text-xs text-gray-600">Recent Likes</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
                <CardContent className="p-4">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{allTransactions.length}</p>
                  <p className="text-xs text-gray-600">Transactions</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-300">
                <CardContent className="p-4">
                  <Users className="w-8 h-8 text-purple-600 mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{allUsers.length}</p>
                  <p className="text-xs text-gray-600">Total Users</p>
                </CardContent>
              </Card>
            </div>

            {/* Live Activity Feed */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recent Posts */}
              <Card className="bg-white border-2 border-gray-200 realistic-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                    Live Posts Feed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {allPosts.slice(0, 10).map((post) => (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm text-blue-900">{post.author_name}</p>
                            <p className="text-xs text-gray-600">{post.content_type} • {new Date(post.created_date).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {post.likes_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="w-3 h-3" />
                              {post.comments_count}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card className="bg-white border-2 border-gray-200 realistic-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <DollarSign className="w-5 h-5 text-green-600 animate-pulse" />
                    Live Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {allTransactions.slice(0, 10).map((tx) => (
                        <motion.div
                          key={tx.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-sm text-blue-900">{tx.type}</p>
                            <p className="text-xs text-gray-600">
                              {tx.from_name} → {tx.to_name}
                            </p>
                            <p className="text-xs text-gray-500">{new Date(tx.created_date).toLocaleTimeString()}</p>
                          </div>
                          <p className="font-bold text-green-600">${tx.amount}</p>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Recent User Signups */}
              <Card className="bg-white border-2 border-gray-200 realistic-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Users className="w-5 h-5 text-purple-600 animate-pulse" />
                    New Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {allUsers.slice(0, 10).map((user) => (
                        <motion.div
                          key={user.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-sm text-blue-900">{user.full_name || 'New User'}</p>
                            <p className="text-xs text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">{new Date(user.created_date).toLocaleDateString()}</p>
                          </div>
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-semibold">
                            {user.role}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Referral Activity */}
              <Card className="bg-white border-2 border-gray-200 realistic-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-900">
                    <Share2 className="w-5 h-5 text-orange-600 animate-pulse" />
                    Referral Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    <AnimatePresence>
                      {contactReferrals.slice(0, 10).map((ref) => (
                        <motion.div
                          key={ref.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-sm text-blue-900">{ref.referrer_email}</p>
                            <p className="text-xs text-gray-600">via {ref.invite_method}</p>
                            <p className="text-xs text-gray-500">{new Date(ref.created_date).toLocaleTimeString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            ref.status === 'signed_up' ? 'bg-green-100 text-green-800' :
                            ref.status === 'active_creator' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {ref.status}
                          </span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Referral Tiers Tab */}
        <TabsContent value="tiers">
          <ReferralTierManager />
        </TabsContent>

        {/* Bonus Rules Tab */}
        <TabsContent value="bonuses">
          <ReferralBonusManager />
        </TabsContent>
      </Tabs>
      </div>
    </AdminProtection>
  );
}