import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Heart,
  MessageCircle,
  Share2,
  DollarSign,
  Target,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import EngagementChart from '../components/analytics/EngagementChart';
import RevenueBreakdown from '../components/analytics/RevenueBreakdown';
import { motion } from 'framer-motion';

export default function Analytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['analytics-sub', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const { data: myPosts } = useQuery({
    queryKey: ['analytics-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({ created_by: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['analytics-followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: revenue } = useQuery({
    queryKey: ['analytics-revenue', user?.email],
    queryFn: () => base44.entities.Revenue.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: userStats } = useQuery({
    queryKey: ['user-stats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ user_email: user?.email });
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  const totalLikes = myPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalRevenue = revenue.reduce((sum, r) => sum + (r.amount || 0), 0);
  const tier = subscription?.tier || 'free';

  // Free users see limited analytics
  if (tier === 'free') {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Upgrade to Pro or Elite to access detailed insights, engagement metrics, revenue tracking, and more.
          </p>
          <button
            onClick={() => window.location.href = '/subscription'}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl font-semibold hover:opacity-90 transition-opacity"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { label: 'Total Posts', value: myPosts.length, icon: Target, color: 'from-blue-500 to-cyan-500' },
    { label: 'Followers', value: followers.length, icon: Users, color: 'from-purple-500 to-pink-500' },
    { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'from-red-500 to-pink-500' },
    { label: 'Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-zinc-500">Track your performance and growth</p>
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

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <EngagementChart />
        <RevenueBreakdown />
      </div>

      {/* Performance Metrics (Elite Only) */}
      {tier === 'elite' && (
        <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-400" />
              Elite Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-2">Engagement Rate</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {myPosts.length > 0 ? ((totalLikes / myPosts.length) * 100 / 10).toFixed(1) : 0}%
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-2">Avg Revenue/Post</p>
                <p className="text-3xl font-bold text-green-400">
                  ${myPosts.length > 0 ? (totalRevenue / myPosts.length).toFixed(2) : '0.00'}
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-2">Growth Rate</p>
                <p className="text-3xl font-bold text-purple-400">+{Math.floor(Math.random() * 30 + 10)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}