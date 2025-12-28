import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { BarChart3, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import RealTimeMetrics from '../components/analytics/RealTimeMetrics';
import RevenueChart from '../components/analytics/RevenueChart';
import FollowerGrowthChart from '../components/analytics/FollowerGrowthChart';
import TopPerformingPosts from '../components/analytics/TopPerformingPosts';
import ReferralConversionRate from '../components/analytics/ReferralConversionRate';
import EngagementChart from '../components/analytics/EngagementChart';
import RevenueBreakdown from '../components/analytics/RevenueBreakdown';
import RevenueBreakdownCard from '../components/analytics/RevenueBreakdownCard';
import TipHistoryCard from '../components/analytics/TipHistoryCard';
import AudienceGrowthChart from '../components/analytics/AudienceGrowthChart';
import AutomatedPerksManager from '../components/automation/AutomatedPerksManager';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

export default function CreatorAnalytics() {
  const [user, setUser] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const queryClient = useQueryClient();

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

    // Update timestamp every 30 seconds
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    setLastUpdated(new Date());
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Analytics Dashboard - Real-Time Creator Metrics | EncircleNet"
        description="Track your performance with real-time analytics. Monitor engagement, revenue, follower growth, and referral conversions."
        keywords="creator analytics, real-time metrics, engagement tracking, revenue dashboard, social media analytics"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-purple-600" />
              Analytics Dashboard
            </h1>
            <p className="text-gray-600">Real-time insights into your creator performance</p>
          </div>
          <div className="text-right">
            <Button 
              onClick={handleRefresh}
              variant="outline"
              className="border-2 border-purple-400 hover:bg-purple-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-4">
          <p className="text-sm text-blue-900">
            <strong>Live Data:</strong> Dashboard updates every 30 seconds with real-time metrics from all revenue streams and engagement sources.
          </p>
        </div>
      </motion.div>

      {/* Real-Time Metrics */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-blue-900 mb-4">Key Metrics</h2>
        <RealTimeMetrics userEmail={user.email} />
      </div>

      {/* Revenue Breakdown */}
      <div className="mb-6">
        <RevenueBreakdownCard creatorEmail={user.email} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <AudienceGrowthChart creatorEmail={user.email} />
        <RevenueChart userEmail={user.email} />
      </div>

      {/* Tip History */}
      <div className="mb-6">
        <TipHistoryCard creatorEmail={user.email} />
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <EngagementChart userEmail={user.email} />
        <RevenueBreakdown userEmail={user.email} />
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <TopPerformingPosts userEmail={user.email} />
        <ReferralConversionRate userEmail={user.email} />
      </div>

      {/* Automated Perks */}
      <div className="mb-6">
        <AutomatedPerksManager creatorEmail={user.email} />
      </div>

      {/* Footer Note */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          💡 Pro Tip: Use these insights to optimize your content strategy and maximize earnings
        </p>
      </div>
    </div>
  );
}