import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
  Rocket,
  Copy,
  ExternalLink,
  Plus
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import MultiStreamDashboard from '../components/monetization/MultiStreamDashboard';
import AffiliateTracker from '../components/monetization/AffiliateTracker';
import ReferralCard from '../components/monetization/ReferralCard';
import SEO from '../components/SEO';
import { createPageUrl } from '../utils';

export default function CreatorEconomy() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  // Fetch referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email
  });

  // Fetch creator shop
  const { data: creatorShop } = useQuery({
    queryKey: ['creator-shop', user?.email],
    queryFn: async () => {
      const shops = await base44.entities.CreatorShop.filter({ creator_email: user?.email });
      return shops[0];
    },
    enabled: !!user?.email
  });

  const handleCopyReferralLink = () => {
    const referralCode = `CREATOR${user?.email?.slice(0, 4).toUpperCase()}`;
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShareReferral = () => {
    const referralCode = `CREATOR${user?.email?.slice(0, 4).toUpperCase()}`;
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    const text = `Join me on Encircle Net! Use my referral code: ${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Encircle Net',
        text: text,
        url: referralLink
      });
    } else {
      handleCopyReferralLink();
    }
  };

  const handleSetupShop = async () => {
    if (creatorShop) {
      // Navigate to shop management (you can create this page later)
      toast({
        title: "Shop Active",
        description: "Your shop is already set up!",
      });
    } else {
      // Create new shop
      try {
        await base44.entities.CreatorShop.create({
          creator_email: user.email,
          shop_name: `${user.full_name}'s Shop`,
          shop_url: user.email.split('@')[0],
          description: "Welcome to my creator shop!"
        });
        toast({
          title: "Shop Created!",
          description: "Your creator shop is now live",
        });
      } catch (e) {
        toast({
          title: "Error",
          description: "Failed to create shop. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

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
            className="space-y-6"
          >
            {/* Referral Stats Card */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Referral Program</h3>
                  <p className="text-gray-600">Earn $5-$50 per active referral</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-glow">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
                  <p className="text-3xl font-bold text-blue-900">{referrals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-green-900">
                    {referrals.filter(r => r.status === 'active').length}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Earnings</p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Referral Link */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 mb-4">
                <p className="text-sm text-gray-700 mb-3 font-semibold">Your Referral Code</p>
                <div className="flex items-center gap-3 mb-4">
                  <Input 
                    value={`CREATOR${user?.email?.slice(0, 4).toUpperCase()}`}
                    readOnly
                    className="text-xl font-bold text-center bg-white border-2 border-purple-400"
                  />
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={handleCopyReferralLink}
                    className="border-2 border-purple-400 hover:bg-purple-100"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Share this code or use the link below
                </p>
              </div>

              <div className="flex gap-3">
                <Button 
                  onClick={handleShareReferral}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Share Referral Link
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl('Referrals'))}
                  variant="outline"
                  className="border-2 border-purple-400 hover:bg-purple-50"
                >
                  View Details
                </Button>
              </div>
            </div>

            {/* Referral List */}
            {referrals.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-blue-900">Recent Referrals</h4>
                {referrals.slice(0, 5).map((referral) => (
                  <ReferralCard key={referral.id} referral={referral} />
                ))}
              </div>
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="shop">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Shop Header */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Creator Shop</h3>
                  <p className="text-gray-600">Sell products and services to your audience</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-glow">
                  <ShoppingBag className="w-10 h-10 text-white" />
                </div>
              </div>

              {creatorShop ? (
                <div className="space-y-4">
                  {/* Shop Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Products</p>
                      <p className="text-3xl font-bold text-blue-900">{creatorShop.product_count || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Sales</p>
                      <p className="text-3xl font-bold text-green-900">{creatorShop.total_sales || 0}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-3xl font-bold text-purple-900">${(creatorShop.total_revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Shop Info */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-300 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Shop Name</p>
                        <p className="text-xl font-bold text-blue-900">{creatorShop.shop_name}</p>
                      </div>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="border-2 border-pink-400"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View Shop
                      </Button>
                    </div>
                    <p className="text-sm text-gray-700">{creatorShop.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate(createPageUrl('Explore'))}
                      className="flex-1 gradient-bg-primary text-white shadow-glow"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-2 border-pink-400 hover:bg-pink-50"
                    >
                      Manage Shop
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Create your shop to start selling digital products, merch, and services
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2 text-left max-w-md mx-auto">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        Sell digital downloads, courses, and templates
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        Offer physical merchandise and products
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        Provide services and consultations
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                        Keep 90% of all sales revenue
                      </li>
                    </ul>
                  </div>
                  <Button 
                    onClick={handleSetupShop}
                    className="gradient-bg-primary text-white shadow-glow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Setup Your Shop
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}