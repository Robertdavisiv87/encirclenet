import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign, Users, TrendingUp, Eye, Calendar } from 'lucide-react';
import PostPerformanceCard from '../components/analytics/PostPerformanceCard';
import EarningsBreakdown from '../components/analytics/EarningsBreakdown';
import AudienceInsights from '../components/analytics/AudienceInsights';
import ReferralPerformance from '../components/analytics/ReferralPerformance';
import SEO from '../components/SEO';
import { Button } from '@/components/ui/button';

export default function Analytics() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: myPosts } = useQuery({
    queryKey: ['analytics-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: transactions } = useQuery({
    queryKey: ['analytics-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ to_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics-revenue', user?.email],
    queryFn: () => base44.entities.Revenue.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: referrals } = useQuery({
    queryKey: ['analytics-referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['analytics-followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: subscription } = useQuery({
    queryKey: ['analytics-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  // Calculate earnings by stream
  const tipsEarned = transactions
    .filter(t => t.type === 'tip')
    .reduce((sum, t) => sum + t.amount, 0);

  const subscriptionEarned = revenue
    .filter(r => r.source === 'subscription')
    .reduce((sum, r) => sum + r.amount, 0);

  const referralEarned = referrals
    .reduce((sum, r) => sum + (r.bonus_earned || 0), 0);

  const adsEarned = revenue
    .filter(r => r.source === 'ad_revenue')
    .reduce((sum, r) => sum + r.amount, 0);

  const affiliateEarned = revenue
    .filter(r => r.source === 'affiliate')
    .reduce((sum, r) => sum + r.amount, 0);

  const shopEarned = revenue
    .filter(r => r.source === 'shop')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalEarnings = tipsEarned + subscriptionEarned + referralEarned + adsEarned + affiliateEarned + shopEarned;
  const totalViews = myPosts.reduce((sum, p) => sum + (p.views_count || 0), 0);
  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please sign in to view analytics</p>
          <Button onClick={() => base44.auth.redirectToLogin()}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <SEO 
        title="Creator Analytics - Encircle Net"
        description="Track your performance, earnings, and audience growth on Encircle Net. Comprehensive analytics dashboard for creators."
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Creator Analytics</h1>
        <p className="text-gray-600">Track your performance and optimize your strategy</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Earnings</p>
                <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Views</p>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Total Likes</p>
                <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8" />
              <div>
                <p className="text-sm opacity-90">Followers</p>
                <p className="text-2xl font-bold">{followers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Filter */}
      <div className="flex justify-end mb-6">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-40">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Post Performance
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Earnings
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Audience
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid md:grid-cols-2 gap-6">
            <EarningsBreakdown
              tipsEarned={tipsEarned}
              subscriptionEarned={subscriptionEarned}
              referralEarned={referralEarned}
              adsEarned={adsEarned}
              affiliateEarned={affiliateEarned}
              shopEarned={shopEarned}
            />
            <AudienceInsights
              followers={followers}
              posts={myPosts}
            />
            <ReferralPerformance referrals={referrals} />
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Posts Created</span>
                    <span className="font-bold text-gray-900">{myPosts.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Avg. Engagement</span>
                    <span className="font-bold text-gray-900">
                      {myPosts.length > 0 
                        ? ((totalLikes / myPosts.length) || 0).toFixed(1)
                        : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Subscription Tier</span>
                    <span className="font-bold text-purple-600 capitalize">
                      {subscription?.tier || 'Free'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Post Performance Tab */}
        <TabsContent value="posts">
          {myPosts.length === 0 ? (
            <div className="text-center py-20">
              <Eye className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-bold mb-2 text-gray-700">No Posts Yet</h3>
              <p className="text-gray-600">Start creating content to see performance metrics</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myPosts.map(post => (
                <PostPerformanceCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings">
          <div className="grid md:grid-cols-2 gap-6">
            <EarningsBreakdown
              tipsEarned={tipsEarned}
              subscriptionEarned={subscriptionEarned}
              referralEarned={referralEarned}
              adsEarned={adsEarned}
              affiliateEarned={affiliateEarned}
              shopEarned={shopEarned}
            />
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="text-blue-900">Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.slice(0, 10).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{tx.type}</p>
                        <p className="text-xs text-gray-500">{tx.description}</p>
                      </div>
                      <span className="text-sm font-bold text-green-600">+${tx.amount}</span>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No transactions yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <div className="grid md:grid-cols-2 gap-6">
            <AudienceInsights
              followers={followers}
              posts={myPosts}
            />
            <ReferralPerformance referrals={referrals} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}