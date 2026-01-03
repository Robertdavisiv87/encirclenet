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
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import MultiStreamDashboard from '../components/monetization/MultiStreamDashboard';
import AffiliateTracker from '../components/monetization/AffiliateTracker';
import ReferralCard from '../components/monetization/ReferralCard';
import AISuggestions from '../components/ai/AISuggestions';
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

  // Fetch circles
  const { data: circles = [] } = useQuery({
    queryKey: ['user-circles', user?.email],
    queryFn: () => base44.entities.Circle.filter({ owner_email: user?.email }),
    enabled: !!user?.email
  });

  // Fetch brand campaigns
  const { data: brandAccount } = useQuery({
    queryKey: ['brand-account', user?.email],
    queryFn: async () => {
      const accounts = await base44.entities.BrandAccount.filter({ owner_email: user?.email });
      return accounts[0];
    },
    enabled: !!user?.email
  });

  // Fetch transactions for tips
  const { data: tipTransactions = [] } = useQuery({
    queryKey: ['tip-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      to_email: user?.email,
      type: 'tip'
    }),
    enabled: !!user?.email
  });

  // Fetch subscriptions (platform tier subscriptions)
  const { data: subscriptions = [] } = useQuery({
    queryKey: ['user-subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ 
      user_email: user?.email,
      status: 'active'
    }),
    enabled: !!user?.email
  });

  // Fetch affiliate links
  const { data: affiliateLinks = [] } = useQuery({
    queryKey: ['affiliate-links', user?.email],
    queryFn: () => base44.entities.AffiliateLink.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  // Fetch products from shop
  const { data: shopProducts = [] } = useQuery({
    queryKey: ['shop-products', user?.email],
    queryFn: () => base44.entities.Product.filter({ creator_email: user?.email }),
    enabled: !!user?.email
  });

  // Fetch campaigns
  const { data: campaigns = [] } = useQuery({
    queryKey: ['campaigns', brandAccount?.id],
    queryFn: () => base44.entities.Campaign.filter({ brand_account_id: brandAccount?.id }),
    enabled: !!brandAccount?.id
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

  // Calculate accurate earnings from all sources
  const tipsTotal = tipTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const subscriptionsTotal = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90; // 90% revenue share
  const referralsTotal = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const affiliateTotal = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);
  
  const earnings = {
    tips: tipsTotal,
    subscriptions: subscriptionsTotal,
    affiliate: affiliateTotal,
    referrals: referralsTotal,
    shop: creatorShop?.total_revenue || 0,
    brands: brandAccount?.total_spent || 0
  };

  const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);

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
            <p className="text-xs opacity-75 mt-2">Beta: Tracking & Accruing</p>
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

        {/* Beta Disclaimer */}
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>Beta Notice:</strong> Earnings shown during beta represent tracked and accruing revenue. Cash payouts activate once monetization streams go live.
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="inline-flex w-full min-w-max bg-white border-2 border-gray-200 p-1 rounded-xl shadow-md">
            <TabsTrigger value="overview" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="tips" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Tips
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Subscriptions
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
            <TabsTrigger value="brands" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Brands
            </TabsTrigger>
            <TabsTrigger value="circles" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Circles
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <AISuggestions
            title="Boost Your Earnings"
            suggestions={[
              {
                type: 'earning',
                title: 'Activate Affiliate Program',
                description: 'Earn 15% commission per sale',
                cta: 'Start',
                action: 'affiliate'
              },
              {
                type: 'trending',
                title: 'Create Premium Content',
                description: 'Top earners make $500+/mo',
                cta: 'Learn',
                action: 'premium'
              }
            ]}
            onAction={(suggestion) => {
              if (suggestion.action === 'affiliate') navigate(createPageUrl('PassiveIncome'));
              if (suggestion.action === 'premium') navigate(createPageUrl('Create'));
            }}
          />
          <MultiStreamDashboard 
            earnings={earnings} 
            onCashOut={() => toast({
              title: "Cash Out",
              description: totalEarnings >= 10 ? `Processing payout of $${totalEarnings.toFixed(2)}` : "Minimum payout is $10"
            })}
          />
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
                  <p className="text-gray-600">Earn $5 per verified signup + bonuses</p>
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
                  <div key={referral.id} className="bg-white rounded-xl p-4 border-2 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-blue-900">{referral.referred_name || 'New User'}</p>
                        <p className="text-xs text-gray-600">
                          Joined {new Date(referral.created_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-900">${(referral.commission_earned || 0).toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{referral.status}</p>
                      </div>
                    </div>
                  </div>
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
                      <p className="text-3xl font-bold text-blue-900">{shopProducts.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Sales</p>
                      <p className="text-3xl font-bold text-green-900">{shopProducts.reduce((sum, p) => sum + (p.sales_count || 0), 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                      <p className="text-sm text-gray-600 mb-1">Revenue</p>
                      <p className="text-3xl font-bold text-purple-900">${(creatorShop.total_revenue || 0).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Product List */}
                  {shopProducts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Your Products</h4>
                      {shopProducts.slice(0, 3).map((product) => (
                        <div key={product.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-sm text-blue-900">{product.product_name}</p>
                            <p className="text-xs text-gray-600">{product.sales_count || 0} sales</p>
                          </div>
                          <p className="font-bold text-green-900">${product.price}</p>
                        </div>
                      ))}
                    </div>
                  )}

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

        <TabsContent value="tips">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Tips & Donations</h3>
                  <p className="text-gray-600">Receive direct support from your fans</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-glow">
                  <DollarSign className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Total Tips</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${tipTransactions.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Tips Received</p>
                  <p className="text-3xl font-bold text-blue-900">{tipTransactions.length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Avg Tip</p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${tipTransactions.length > 0 
                      ? (tipTransactions.reduce((sum, t) => sum + (t.amount || 0), 0) / tipTransactions.length).toFixed(2)
                      : '0.00'
                    }
                  </p>
                </div>
              </div>

              {/* Recent Tips */}
              {tipTransactions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Recent Tips</h4>
                  <div className="space-y-2">
                    {tipTransactions.slice(0, 5).map((tip) => (
                      <div key={tip.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-sm text-blue-900">{tip.from_name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-600">{new Date(tip.created_date).toLocaleDateString()}</p>
                        </div>
                        <p className="font-bold text-green-900">${tip.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-3">How to Maximize Tips</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Create valuable, engaging content consistently
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Respond to comments and build community
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Share exclusive behind-the-scenes content
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Mention tip options in your posts
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="subscriptions">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Platform Subscriptions</h3>
                  <p className="text-gray-600">Your tier & subscription revenue share</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                  <Crown className="w-10 h-10 text-white" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Your Tier</p>
                  <p className="text-3xl font-bold text-purple-900 uppercase">
                    {subscriptions[0]?.tier || 'Free'}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                  <p className="text-sm text-gray-600 mb-1">Your Share (90%)</p>
                  <p className="text-3xl font-bold text-blue-900">
                    ${(subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90).toFixed(2)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Referral Earnings</p>
                  <p className="text-3xl font-bold text-green-900">
                    ${(referrals.filter(r => r.status === 'active').length * subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90).toFixed(2)}
                  </p>
                </div>
              </div>

              {subscriptions.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-blue-900 mb-3">Your Active Subscription</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-purple-900">{subscriptions[0]?.tier.toUpperCase()} Plan</p>
                      <p className="text-sm text-gray-600 mt-1">
                        ${subscriptions[0]?.price}/month • Next billing: {new Date(subscriptions[0]?.next_billing_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      onClick={() => navigate(createPageUrl('Subscription'))}
                      variant="outline"
                      className="border-2 border-purple-400"
                    >
                      Upgrade Tier
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
                <h4 className="font-bold text-blue-900 mb-3">Subscription Revenue Model</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    You keep 90% of subscription revenue from your referrals
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Earn passive income when referrals upgrade tiers
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Higher tiers unlock more earning potential
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    Revenue compounds with your referral network
                  </li>
                </ul>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={() => navigate(createPageUrl('Subscription'))}
                  className="flex-1 gradient-bg-primary text-white shadow-glow"
                >
                  View Subscription Plans
                </Button>
                <Button 
                  onClick={() => navigate(createPageUrl('Referrals'))}
                  variant="outline"
                  className="flex-1 border-2 border-purple-400"
                >
                  Invite More Users
                </Button>
              </div>
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="brands">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Brand Partnerships</h3>
                  <p className="text-gray-600">Monetize with PPC campaigns</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-glow">
                  <Zap className="w-10 h-10 text-white" />
                </div>
              </div>

              {brandAccount ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Active Campaigns</p>
                      <p className="text-3xl font-bold text-blue-900">{campaigns.filter(c => c.status === 'active').length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                      <p className="text-3xl font-bold text-green-900">${campaigns.reduce((sum, c) => sum + (c.spent || 0), 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                      <p className="text-sm text-gray-600 mb-1">Total Clicks</p>
                      <p className="text-3xl font-bold text-orange-900">{campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0)}</p>
                    </div>
                  </div>

                  {/* Campaign List */}
                  {campaigns.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-700">Active Campaigns</h4>
                      {campaigns.filter(c => c.status === 'active').slice(0, 3).map((campaign) => (
                        <div key={campaign.id} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm text-blue-900">{campaign.campaign_name}</p>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                              {campaign.campaign_type.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <span>{campaign.clicks || 0} clicks</span>
                            <span>{campaign.conversions || 0} conversions</span>
                            <span className="font-bold text-green-900">${(campaign.spent || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button className="w-full gradient-bg-primary text-white shadow-glow">
                    View All Campaigns
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    Join brand campaigns to earn money through clicks, leads, and sales
                  </p>
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-blue-900 mb-3">Campaign Types</h4>
                    <ul className="space-y-2 text-sm text-gray-700 text-left max-w-md mx-auto">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        CPC (Cost Per Click) - Earn per click
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        CPA (Cost Per Action) - Earn per lead/signup
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        CPS (Cost Per Sale) - Earn commission on sales
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                        CPM (Cost Per Mille) - Earn per 1000 views
                      </li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => toast({
                      title: "Coming Soon",
                      description: "Brand partnership program launching soon!"
                    })}
                    className="gradient-bg-primary text-white shadow-glow"
                  >
                    Join Brand Program
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="circles">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 realistic-shadow">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">Premium Circles</h3>
                  <p className="text-gray-600">Monetize exclusive communities</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-glow">
                  <Users className="w-10 h-10 text-white" />
                </div>
              </div>

              {circles.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border-2 border-indigo-200">
                      <p className="text-sm text-gray-600 mb-1">Your Circles</p>
                      <p className="text-3xl font-bold text-indigo-900">{circles.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <p className="text-sm text-gray-600 mb-1">Total Members</p>
                      <p className="text-3xl font-bold text-blue-900">
                        {circles.reduce((sum, c) => sum + (c.members_count || 0), 0)}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                      <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-green-900">
                        ${circles.reduce((sum, c) => sum + ((c.subscription_price || 0) * (c.members_count || 0)), 0).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Circle List */}
                  <div className="space-y-3">
                    {circles.map((circle) => (
                      <div key={circle.id} className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-blue-900">{circle.name}</h4>
                            <p className="text-sm text-gray-600">{circle.members_count || 0} members</p>
                          </div>
                          <div className="text-right">
                            {circle.is_premium && (
                              <p className="font-bold text-green-900">${circle.subscription_price}/mo</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={() => navigate(createPageUrl('MyCircle'))}
                    className="w-full gradient-bg-primary text-white shadow-glow"
                  >
                    Manage Circles
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-6">
                    Create premium circles and earn recurring revenue from your community
                  </p>
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl p-6 mb-6">
                    <h4 className="font-bold text-blue-900 mb-3">Circle Benefits</h4>
                    <ul className="space-y-2 text-sm text-gray-700 text-left max-w-md mx-auto">
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Charge monthly subscription fees
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Build exclusive communities
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Share premium content with members
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                        Keep 90% of subscription revenue
                      </li>
                    </ul>
                  </div>
                  <Button 
                    onClick={() => navigate(createPageUrl('MyCircle'))}
                    className="gradient-bg-primary text-white shadow-glow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Circle
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