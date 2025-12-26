import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Link as LinkIcon,
  ShoppingBag,
  Zap,
  Crown,
  BarChart3,
  Target,
  Rocket
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import MultiStreamDashboard from '../components/monetization/MultiStreamDashboard';
import AffiliateTracker from '../components/monetization/AffiliateTracker';
import SEO from '../components/SEO';

export default function CreatorEconomy() {
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

  // Mock earnings data (replace with real data)
  const earnings = {
    tips: 234.50,
    subscriptions: 890.00,
    affiliate: 1234.75,
    referrals: 456.30,
    shop: 678.90,
    brands: 1890.50
  };

  const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + val, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Creator Economy Dashboard - EncircleNet | Multi-Stream Monetization"
        description="Track earnings from tips, subscriptions, affiliates, referrals, and brand deals. Full creator economy platform with real-time analytics."
        keywords="creator economy, monetization dashboard, affiliate earnings, subscription income, creator earnings, multi-stream revenue"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Creator Economy</h1>
            <p className="text-gray-600">Multi-stream monetization dashboard</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-glow"
          >
            <p className="text-sm opacity-90 mb-1">Total Earnings</p>
            <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Streams', value: '6', icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Conversion Rate', value: '3.2%', icon: Target, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Clicks', value: '12.4K', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { label: 'Growth', value: '+24%', icon: Rocket, color: 'from-orange-500 to-red-500' }
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border-2 border-gray-200 rounded-xl p-4 realistic-shadow hover-lift"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl bg-white border-2 border-gray-200 p-1 rounded-xl shadow-md">
          <TabsTrigger value="overview" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="affiliate" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Affiliates
          </TabsTrigger>
          <TabsTrigger value="referrals" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Referrals
          </TabsTrigger>
          <TabsTrigger value="shop" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            Shop
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <MultiStreamDashboard earnings={earnings} />
        </TabsContent>

        <TabsContent value="affiliate">
          <AffiliateTracker userEmail={user?.email} />
        </TabsContent>

        <TabsContent value="referrals">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-glow">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Referral Program</h3>
            <p className="text-gray-600 mb-6">Earn 20% recurring commission on all referred users</p>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-700 mb-2">Your Referral Code</p>
              <p className="text-3xl font-bold text-purple-900">CREATOR{user?.email?.slice(0, 4).toUpperCase()}</p>
            </div>
            <Button className="gradient-bg-primary text-white shadow-glow">
              Share Referral Link
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="shop">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-glow">
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-2">Creator Shop</h3>
            <p className="text-gray-600 mb-6">Sell digital products, merch, and services directly to your audience</p>
            <Button className="gradient-bg-primary text-white shadow-glow">
              Setup Your Shop
            </Button>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}