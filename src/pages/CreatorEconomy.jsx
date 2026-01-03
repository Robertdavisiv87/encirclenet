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
  Plus,
  CreditCard,
  RefreshCw,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import MultiStreamDashboard from '../components/monetization/MultiStreamDashboard';
import AffiliateTracker from '../components/monetization/AffiliateTracker';
import ReferralCard from '../components/monetization/ReferralCard';
import AISuggestions from '../components/ai/AISuggestions';
import SEO from '../components/SEO';
import BankAccountSetup from '../components/monetization/BankAccountSetup';
import { createPageUrl } from '../utils';

export default function CreatorEconomy() {
  // Creator Economy Dashboard - Multi-Stream Monetization
  const [user, setUser] = useState(null);
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Auto-sync earnings and referrals on page load
        try {
          console.log('🔄 Syncing referrals and earnings...');
          const syncResponse = await base44.functions.invoke('syncReferrals', {});
          console.log('Sync result:', syncResponse.data);
          await base44.functions.invoke('syncUserEarnings', {});
        } catch (e) {
          console.log('Sync failed:', e);
        }

        // Check if returning from Stripe onboarding
        const urlParams = new URLSearchParams(window.location.search);
        const setupComplete = urlParams.get('setup') === 'complete';

        // Auto-migrate pending earnings if Stripe connected but not migrated yet
        const migrationChecked = sessionStorage.getItem('migration_checked');
        if (currentUser.stripe_account_id && !currentUser.earnings_migrated && !migrationChecked) {
          sessionStorage.setItem('migration_checked', 'true');
          setIsMigrating(true);

          if (setupComplete) {
            toast({
              title: "✅ Bank Account Connected!",
              description: "Detecting and migrating your earnings..."
            });
          }

          // Trigger migration after a brief delay
          setTimeout(async () => {
            try {
              const response = await base44.functions.invoke('migrateEarningsToStripe', {});
              if (response.data.success && response.data.migrated_amount > 0) {
                toast({
                  title: "🎉 Earnings Migrated!",
                  description: `$${response.data.migrated_amount.toFixed(2)} transferred to your Stripe account`,
                });

                // Clear URL params and reload
                window.history.replaceState({}, '', createPageUrl('CreatorEconomy'));
                setTimeout(() => window.location.reload(), 1500);
              } else {
                setIsMigrating(false);
              }
            } catch (error) {
              console.log('Migration check:', error);
              setIsMigrating(false);
            }
          }, setupComplete ? 1500 : 500);
        }
        
        // Clear any pending migration flag
        localStorage.removeItem('pending_stripe_migration');
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
    
    // Auto-refresh earnings and referrals every 60 seconds
    const interval = setInterval(async () => {
      try {
        await base44.functions.invoke('syncReferrals', {});
        await base44.functions.invoke('syncUserEarnings', {});
      } catch (e) {
        console.log('Auto-sync failed:', e);
      }
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const handlePayout = async () => {
    if (!user.stripe_account_id) {
      setShowBankSetup(true);
      return;
    }

    if (totalEarnings < 10) {
      toast({
        title: "Minimum Payout Not Met",
        description: `You need at least $10 to cash out. Current balance: $${totalEarnings.toFixed(2)}`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayout(true);
    try {
      const response = await base44.functions.invoke('processStripePayout', {
        amount: totalEarnings
      });

      if (response.data.success) {
        toast({
          title: "🎉 Payout Successful!",
          description: response.data.message
        });
        
        // Refresh the page data
        window.location.reload();
      } else {
        throw new Error(response.data.error || 'Payout failed');
      }
    } catch (error) {
      toast({
        title: "Payout Failed",
        description: error.message || "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  // Fetch referrals with real-time updates
  const { data: referrals = [], refetch: refetchReferrals } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: async () => {
      // Sync referrals first to catch any new ones
      try {
        await base44.functions.invoke('syncReferrals', {});
      } catch (e) {
        console.log('Sync during fetch:', e);
      }
      const allReferrals = await base44.entities.Referral.filter({ referrer_email: user?.email });
      console.log('Referrals loaded:', allReferrals);
      return allReferrals;
    },
    enabled: !!user?.email,
    refetchInterval: 15000, // Refresh every 15 seconds for real-time updates
    refetchOnMount: true,
    refetchOnWindowFocus: true
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

  // Fetch transactions for tips with real-time updates
  const { data: tipTransactions = [], refetch: refetchTips } = useQuery({
    queryKey: ['tip-transactions', user?.email],
    queryFn: async () => {
      const allTransactions = await base44.entities.Transaction.filter({ 
        to_email: user?.email,
        type: 'tip'
      });
      console.log('Tips loaded:', allTransactions);
      return allTransactions.filter(t => t.status === 'completed' || !t.status);
    },
    enabled: !!user?.email,
    refetchInterval: 10000,
    refetchOnMount: true,
    refetchOnWindowFocus: true
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

  // Fetch payout history
  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      to_email: user?.email,
      type: 'payout'
    }),
    enabled: !!user?.email,
    refetchInterval: 60000 // Auto-refresh every 60 seconds
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
  const referralsTotal = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0); // All referrals count
  const affiliateTotal = affiliateLinks.reduce((sum, a) => sum + (a.earnings || 0), 0);

  const earnings = {
    tips: tipsTotal,
    subscriptions: subscriptionsTotal,
    affiliate: affiliateTotal,
    referrals: referralsTotal,
    shop: creatorShop?.total_revenue || 0,
    brands: brandAccount?.total_spent || 0
  };

  // If migrated, use Stripe balance; otherwise use calculated platform earnings
  const stripeBalance = user?.stripe_balance || 0;
  const platformEarnings = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);

  // Total earnings = migrated Stripe balance OR unmigrated platform earnings (not both)
  const totalEarnings = user?.earnings_migrated ? stripeBalance : platformEarnings;
  const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const availableBalance = totalEarnings - totalPayouts;
  
  // Log for debugging
  console.log('Earnings Breakdown:', {
    tips: tipsTotal,
    subscriptions: subscriptionsTotal,
    affiliate: affiliateTotal,
    referrals: referralsTotal,
    shop: creatorShop?.total_revenue || 0,
    brands: brandAccount?.total_spent || 0,
    stripe_balance: stripeBalance,
    total: totalEarnings,
    payouts: totalPayouts,
    available: availableBalance,
    earnings_migrated: user?.earnings_migrated
  });
  
  const handleRefreshEarnings = async () => {
    toast({
      title: "Syncing Earnings...",
      description: "Detecting new referrals and updating balances"
    });

    try {
      const syncResult = await base44.functions.invoke('syncReferrals', {});
      console.log('Sync result:', syncResult.data);

      if (syncResult.data.new_referrals_found > 0) {
        toast({
          title: `✅ ${syncResult.data.new_referrals_found} New Referral${syncResult.data.new_referrals_found > 1 ? 's' : ''} Found!`,
          description: `+$${syncResult.data.new_earnings.toFixed(2)} added to your earnings`
        });
      }

      await base44.functions.invoke('syncUserEarnings', {});
    } catch (e) {
      console.log('Sync error:', e);
    }

    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  const handleConnectBank = async () => {
    setConnectingBank(true);
    try {
      const response = await base44.functions.invoke('createStripeConnectAccount', {});
      
      if (response.data.onboarding_url) {
        sessionStorage.removeItem('migration_checked');
        window.location.href = response.data.onboarding_url;
      } else {
        toast({
          title: "Opening Stripe Dashboard",
          description: "Redirecting to update your bank account..."
        });
        window.open('https://connect.stripe.com/express_login', '_blank');
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setConnectingBank(false);
    }
  };

  const handleResetStripeAccount = async () => {
    setShowResetConfirm(false);
    setIsResetting(true);
    
    try {
      const response = await base44.functions.invoke('resetStripeAccount', {});
      
      if (response.data.success) {
        toast({
          title: "✅ Account Reset",
          description: response.data.message
        });
        
        sessionStorage.removeItem('migration_checked');
        
        // Wait a moment then trigger reconnection
        setTimeout(() => {
          setIsResetting(false);
          handleConnectBank();
        }, 1500);
      }
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
      setIsResetting(false);
    }
  };

  const handleCashOut = async () => {
    setShowConfirmModal(false);
    setIsProcessingPayout(true);

    try {
      const response = await base44.functions.invoke('processStripePayout', {
        amount: availableBalance
      });

      if (response.data.success) {
        toast({
          title: "🎉 Payout Successful!",
          description: response.data.message
        });
        window.location.reload();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      toast({
        title: "Payout Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

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
          <div className="flex gap-3 items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefreshEarnings}
              className="border-2 border-purple-300 hover:bg-purple-50"
              title="Refresh all earnings data"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-glow cursor-pointer"
              onClick={() => {
                if (availableBalance >= 10 && user?.stripe_account_id) {
                  setShowConfirmModal(true);
                } else if (!user?.stripe_account_id) {
                  toast({
                    title: "Connect Bank Account",
                    description: "Link your bank account to cash out earnings"
                  });
                  setShowBankSetup(true);
                } else {
                  toast({
                    title: "Keep Earning!",
                    description: `You need $${(10 - availableBalance).toFixed(2)} more to cash out.`
                  });
                }
              }}
            >
              <p className="text-sm opacity-90 mb-1">Available to Cash Out</p>
              <p className="text-3xl font-bold">${availableBalance.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-2">
                {availableBalance >= 10 && user?.stripe_account_id ? '✅ Click to Cash Out' : availableBalance >= 10 ? '🔗 Connect Bank' : `Need $${(10 - availableBalance).toFixed(2)} more`}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Streams', value: Object.values(earnings).filter(e => e > 0).length.toString(), icon: Zap, color: 'from-purple-500 to-pink-500' },
            { label: 'Total Referrals', value: referrals.length.toString(), icon: Users, color: 'from-blue-500 to-cyan-500' },
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: 'Available Balance', value: `$${availableBalance.toFixed(2)}`, icon: TrendingUp, color: 'from-orange-500 to-red-500' }
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

        {/* Migration Status */}
        {isMigrating && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
              <div>
                <p className="text-sm text-blue-900 font-semibold">
                  Detecting Pending Earnings...
                </p>
                <p className="text-xs text-blue-700">
                  Checking for platform revenue to migrate
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Earnings Info */}
        {!isMigrating && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl">
            <p className="text-sm text-green-900">
              <strong>💰 Live Earnings:</strong> All earnings are tracked in real-time and automatically synced to your Stripe account. Cash out anytime once you reach the $10 minimum threshold.
            </p>
          </div>
        )}
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
            <TabsTrigger value="payouts" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Payouts / Bank
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
            onCashOut={handlePayout}
          />
          
          {!user?.stripe_account_id && totalEarnings >= 10 && (
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-3">
                <CreditCard className="w-6 h-6 text-orange-600 mt-1" />
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 mb-2">Link Your Bank Account</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    You have ${totalEarnings.toFixed(2)} ready to cash out! Link your bank account to receive payments.
                  </p>
                  <Button 
                    onClick={() => setShowBankSetup(true)}
                    className="gradient-bg-primary text-white shadow-glow"
                  >
                    Link Bank Account Now
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-3xl font-bold text-purple-900">
                    ${referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0).toFixed(2)}
                  </p>
                  {user?.earnings_migrated && (
                    <p className="text-xs text-green-600 mt-1">✅ Synced to Stripe</p>
                  )}
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

        <TabsContent value="payouts">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Balance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-8 h-8" />
                  <p className="text-sm opacity-90">Total Earnings</p>
                </div>
                <p className="text-4xl font-bold">${totalEarnings.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">
                  {user?.earnings_migrated ? 'Synced with Stripe' : 'All-time revenue'}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-8 h-8" />
                  <p className="text-sm opacity-90">Available to Cash Out</p>
                </div>
                <p className="text-4xl font-bold">${availableBalance.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">
                  {availableBalance >= 10 ? '✅ Ready for withdrawal' : `Need $${(10 - availableBalance).toFixed(2)} more`}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-glow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-8 h-8" />
                  <p className="text-sm opacity-90">Total Paid Out</p>
                </div>
                <p className="text-4xl font-bold">${totalPayouts.toFixed(2)}</p>
                <p className="text-xs opacity-75 mt-2">Withdrawn to bank</p>
              </motion.div>
            </div>

            {/* Bank Account Section */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-purple-600" />
                  Bank Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.stripe_account_id ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div className="flex-1">
                        <p className="font-semibold text-blue-900">Bank Account Connected</p>
                        <p className="text-sm text-gray-600">
                          {user?.earnings_migrated 
                            ? `✅ Earnings synced • Ready to cash out` 
                            : 'Stripe Verified'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleConnectBank}
                        disabled={connectingBank || isResetting}
                        className="border-2 border-purple-400 flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Update Bank
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowResetConfirm(true)}
                        disabled={connectingBank || isResetting}
                        className="border-2 border-orange-400 hover:bg-orange-50"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reconnect
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-orange-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-blue-900 mb-2">Connect Your Bank Account</p>
                          <p className="text-sm text-gray-700 mb-3">
                            Securely link your bank account to receive payouts. Powered by Stripe Connect.
                          </p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Bank-level security & encryption
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              Payouts arrive in 1-2 business days
                            </li>
                            <li className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              No fees for standard transfers
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <Button 
                      onClick={handleConnectBank}
                      disabled={connectingBank}
                      className="w-full gradient-bg-primary text-white shadow-glow"
                    >
                      {connectingBank ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Connect Bank Account
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cash Out Section */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="w-6 h-6 text-green-600" />
                  Cash Out
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableBalance >= 10 ? (
                    <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                      <p className="text-sm text-gray-700 mb-3">
                        You have <span className="font-bold text-green-900">${availableBalance.toFixed(2)}</span> available to withdraw
                      </p>
                      <Button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={!user?.stripe_account_id || isProcessingPayout}
                        className="w-full gradient-bg-primary text-white shadow-glow"
                      >
                        {isProcessingPayout ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Cash Out ${availableBalance.toFixed(2)}
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                      <p className="text-sm text-gray-700">
                        Minimum payout is <span className="font-bold">$10.00</span>. You currently have <span className="font-bold">${availableBalance.toFixed(2)}</span>.
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Keep earning! You need <span className="font-bold text-blue-900">${(10 - availableBalance).toFixed(2)}</span> more to cash out.
                      </p>
                    </div>
                  )}
                  {!user?.stripe_account_id && (
                    <div className="p-3 bg-orange-50 border border-orange-300 rounded-lg text-sm text-orange-900">
                      ⚠️ Connect your bank account to enable payouts
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="border-2 border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="space-y-2">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900">Payout</p>
                            <p className="text-xs text-gray-600">
                              {new Date(payout.created_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-900">${payout.amount.toFixed(2)}</p>
                          <div className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Completed</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No payout history yet</p>
                    <p className="text-sm mt-1">Your withdrawals will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Info Section */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl">
              <h3 className="font-bold text-blue-900 mb-3">How Payouts Work</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
                  All payouts are processed securely via Stripe Connect
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
                  Your earnings from referrals, tips, services, and subscriptions are automatically migrated to Stripe when you connect your bank
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
                  Funds typically arrive in your bank in 1-2 business days
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
                  For support, contact support@encirclenet.net
                </li>
              </ul>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payout</DialogTitle>
            <DialogDescription>
              You are about to withdraw <span className="font-bold text-green-900">${availableBalance.toFixed(2)}</span> to your bank account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                Funds will arrive in your bank account in <span className="font-bold">1-2 business days</span>.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCashOut}
              className="gradient-bg-primary text-white shadow-glow"
            >
              Confirm Payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BankAccountSetup
        isOpen={showBankSetup}
        onClose={() => setShowBankSetup(false)}
        user={user}
        onSuccess={() => {
          toast({
            title: "Bank Account Linked!",
            description: "You can now cash out your earnings"
          });
          window.location.reload();
        }}
      />

      {/* Reset Confirmation Modal */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reconnect Bank Account</DialogTitle>
            <DialogDescription>
              This will disconnect your current bank and allow you to connect a new one. Your earnings will be preserved and migrated to the new account.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>What happens:</strong>
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  Current Stripe account will be disconnected
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  You'll be redirected to Stripe to enter your real bank details
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  All earnings will be automatically migrated
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleResetStripeAccount}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              Reset & Reconnect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}