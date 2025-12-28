import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Users, DollarSign, Zap, Eye, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function RealTimeMetrics({ userEmail }) {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['real-time-metrics', userEmail],
    queryFn: async () => {
      // Fetch all data in parallel
      const [posts, followers, transactions, referrals, subscriptions, productOrders, serviceOrders] = await Promise.all([
        base44.entities.Post.filter({ created_by: userEmail }),
        base44.entities.Follow.filter({ following_email: userEmail }),
        base44.entities.Transaction.filter({ to_email: userEmail }),
        base44.entities.Referral.filter({ referrer_email: userEmail }),
        base44.entities.Subscription.filter({ user_email: userEmail, status: 'active' }),
        base44.entities.ProductOrder.filter({ seller_email: userEmail }),
        base44.entities.ServiceOrder.filter({ seller_email: userEmail })
      ]);

      // Calculate metrics
      const totalEngagement = posts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0);
      const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'completed').length;
      const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 0), 0);

      return {
        totalPosts: posts.length,
        totalFollowers: followers.length,
        totalEngagement,
        totalRevenue,
        activeReferrals,
        totalViews,
        revenueBreakdown: {
          tips: transactions.filter(t => t.type === 'tip').reduce((sum, t) => sum + t.amount, 0),
          subscriptions: subscriptions.reduce((sum, s) => sum + (s.price || 0), 0),
          products: productOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          services: serviceOrders.reduce((sum, o) => sum + (o.amount || 0), 0),
          referrals: referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0)
        }
      };
    },
    enabled: !!userEmail,
    refetchInterval: 30000 // Update every 30 seconds
  });

  if (isLoading || !metrics) {
    return <div className="text-center py-8 text-gray-500">Loading metrics...</div>;
  }

  const metricCards = [
    { label: 'Total Posts', value: metrics.totalPosts, icon: Zap, color: 'from-blue-500 to-cyan-500', change: '+12%' },
    { label: 'Followers', value: metrics.totalFollowers, icon: Users, color: 'from-purple-500 to-pink-500', change: '+8%' },
    { label: 'Engagement', value: metrics.totalEngagement, icon: Heart, color: 'from-red-500 to-orange-500', change: '+24%' },
    { label: 'Total Views', value: metrics.totalViews, icon: Eye, color: 'from-green-500 to-emerald-500', change: '+15%' },
    { label: 'Total Revenue', value: `$${metrics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'from-yellow-500 to-orange-500', change: '+32%' },
    { label: 'Active Referrals', value: metrics.activeReferrals, icon: TrendingUp, color: 'from-indigo-500 to-purple-500', change: '+5%' }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {metricCards.map((metric, index) => {
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
              <CardContent className="p-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-3 shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-2xl font-bold text-blue-900 mb-1">{metric.value}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">{metric.label}</p>
                  <span className="text-xs font-semibold text-green-600">{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}