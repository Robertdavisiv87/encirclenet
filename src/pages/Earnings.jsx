import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Zap, 
  ArrowUpRight,
  Gift,
  Star,
  Clock,
  Heart,
  MousePointerClick,
  Crown,
  Link
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ReferralCard from '../components/monetization/ReferralCard';
import TierBadge from '../components/monetization/TierBadge';
import PassiveIncomeCard from '../components/monetization/PassiveIncomeCard';

export default function Earnings() {
  const [user, setUser] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // all, month, week
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: transactions } = useQuery({
    queryKey: ['my-transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ to_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: allRevenue } = useQuery({
    queryKey: ['my-revenue', user?.email],
    queryFn: () => base44.entities.Revenue.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: referrals } = useQuery({
    queryKey: ['my-referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: subscription } = useQuery({
    queryKey: ['my-sub-earnings', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const adRevenue = allRevenue.filter(r => r.source === 'ads').reduce((sum, r) => sum + (r.amount || 0), 0);
  const affiliateRevenue = allRevenue.filter(r => r.source === 'affiliate').reduce((sum, r) => sum + (r.amount || 0), 0);
  const tipsEarnings = transactions.filter(t => t.type === 'tip').reduce((sum, t) => sum + (t.amount || 0), 0);
  const subscriptionRevenue = allRevenue.filter(r => r.source === 'subscriptions').reduce((sum, r) => sum + (r.amount || 0), 0);

  const totalEarnings = tipsEarnings + referralEarnings + adRevenue + affiliateRevenue + subscriptionRevenue;
  const tipsCount = transactions.filter(t => t.type === 'tip').length;
  const boostsCount = transactions.filter(t => t.type === 'boost').length;

  // Calculate trend (mock data - in real app, compare with previous period)
  const earningsTrend = 12.5;

  const stats = [
    { label: 'Total Earned', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: 'from-green-500 to-emerald-500' },
    { label: 'Tips & Boosts', value: `$${tipsEarnings.toFixed(2)}`, icon: Gift, color: 'from-pink-500 to-rose-500' },
    { label: 'Referrals', value: `$${referralEarnings.toFixed(2)}`, icon: Users, color: 'from-purple-500 to-indigo-500' },
    { label: 'Ads & Affiliate', value: `$${(adRevenue + affiliateRevenue).toFixed(2)}`, icon: TrendingUp, color: 'from-yellow-500 to-orange-500' },
  ];

  const userTier = subscription?.tier || 'free';

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 gradient-text">Passive Income Dashboard</h1>
          <p className="text-zinc-300">Earn automatically from your participation & engagement</p>
        </div>
        <TierBadge tier={userTier} size="md" />
      </div>

      {/* Passive Income Explainer */}
      <div className="mb-6">
        <PassiveIncomeCard userTier={userTier} />
      </div>

      {/* Top Section - Total Earnings with Trend */}
      <Card className="bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-green-500/20 border-purple-400/40 mb-6 shadow-glow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-zinc-400 mb-1">Total Earnings</p>
              <div className="flex items-baseline gap-3">
                <h2 className="text-5xl font-bold text-green-400">
                  ${totalEarnings.toFixed(2)}
                </h2>
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <TrendingUp className="w-4 h-4" />
                  <span>+{earningsTrend}%</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={() => window.location.href = '/subscription'}
              className="bg-gradient-to-r from-purple-600 to-pink-500"
            >
              Upgrade Tier
            </Button>
          </div>
          
          {/* Mini Chart Preview */}
          <div className="flex items-end gap-1 h-16">
            {[40, 55, 45, 70, 60, 85, 75, 90, 80, 95, 85, 100].map((height, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-purple-600 to-pink-500 rounded-t"
                style={{ height: `${height}%` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monetization Streams Overview */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Monetization Streams
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-pink-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-pink-400" />
                <p className="text-2xl font-bold">${tipsEarnings.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Tips & Boosts</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-purple-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                <p className="text-2xl font-bold">${referralEarnings.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Referrals</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-blue-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <MousePointerClick className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold">${adRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Ad Revenue</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-green-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Link className="w-8 h-8 mx-auto mb-2 text-green-400" />
                <p className="text-2xl font-bold">${affiliateRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Affiliate</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Card className="bg-zinc-900 border-zinc-800 cursor-pointer hover:border-yellow-500/50 transition-colors">
              <CardContent className="p-4 text-center">
                <Crown className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold">${subscriptionRevenue.toFixed(2)}</p>
                <p className="text-xs text-zinc-500">Subscriptions</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Activity Feed & Referral */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Activity Feed */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {transactions.slice(0, 8).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      transaction.type === 'tip' ? "bg-pink-500/20" : "bg-purple-500/20"
                    )}>
                      {transaction.type === 'tip' ? '💝' : '⭐'}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{transaction.from_name || 'Anonymous'}</p>
                      <p className="text-xs text-zinc-500">
                        {transaction.type} • {new Date(transaction.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-green-400">+${transaction.amount}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Referral Card */}
        <ReferralCard 
          referralCount={referrals.length}
          totalEarnings={referralEarnings}
        />
      </div>



      {/* Cash Out Section */}
      <Card className="bg-gradient-to-br from-green-900 to-emerald-900 border-green-700 mt-6 shadow-glow">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-8 h-8" />
                Cash Out
              </h3>
              <p className="text-green-200">Withdraw your earnings instantly</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-300 mb-1">Available Balance</p>
              <p className="text-4xl font-bold text-white">${totalEarnings.toFixed(2)}</p>
            </div>
          </div>

          {totalEarnings >= 10 ? (
            <div className="space-y-6">
              {/* Earnings Breakdown */}
              <div className="bg-black/30 rounded-xl p-4 border border-green-700">
                <p className="text-sm text-green-300 mb-3 font-semibold">Earnings Breakdown</p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Tips & Boosts</span>
                    <span className="text-white font-semibold">${tipsEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Referrals (90% share)</span>
                    <span className="text-white font-semibold">${referralEarnings.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Affiliates</span>
                    <span className="text-white font-semibold">${affiliateRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Subscriptions</span>
                    <span className="text-white font-semibold">${subscriptionRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Ad Revenue</span>
                    <span className="text-white font-semibold">${adRevenue.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-green-700 pt-2 mt-2 flex justify-between font-bold">
                    <span className="text-green-300">Total Earnings</span>
                    <span className="text-white">${totalEarnings.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payout Methods */}
              <div className="bg-black/30 rounded-xl p-4 border border-green-700">
                <p className="text-sm text-green-300 mb-3 font-semibold">Select Payout Method</p>
                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      const email = prompt('Enter your PayPal email address:');
                      if (email && email.includes('@')) {
                        setSelectedPayoutMethod('paypal');
                        setPayoutDetails(email);
                        alert(`✓ PayPal selected: ${email}\n\nClick "Withdraw" to complete your cash out.`);
                      }
                    }}
                    className={cn(
                      "w-full hover:bg-white/20 border rounded-lg p-3 text-left transition-colors",
                      selectedPayoutMethod === 'paypal' ? "bg-green-600 border-green-400" : "bg-white/10 border-green-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">PayPal</p>
                        <p className="text-xs text-gray-400">
                          {selectedPayoutMethod === 'paypal' ? payoutDetails : 'Instant transfer'}
                        </p>
                      </div>
                      {selectedPayoutMethod === 'paypal' ? (
                        <span className="text-white text-sm">✓ Selected</span>
                      ) : (
                        <span className="text-green-400 text-sm">Recommended</span>
                      )}
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      const details = prompt('Enter your bank account details:\n\nFormat: Bank Name | Account Number | Routing Number');
                      if (details) {
                        setSelectedPayoutMethod('bank');
                        setPayoutDetails(details);
                        alert(`✓ Bank Transfer selected\n\nClick "Withdraw" to complete your cash out.\n\nProcessing time: 1-3 business days`);
                      }
                    }}
                    className={cn(
                      "w-full hover:bg-white/20 border rounded-lg p-3 text-left transition-colors",
                      selectedPayoutMethod === 'bank' ? "bg-green-600 border-green-400" : "bg-white/10 border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Bank Transfer</p>
                        <p className="text-xs text-gray-400">
                          {selectedPayoutMethod === 'bank' ? 'Bank details saved' : '1-3 business days'}
                        </p>
                      </div>
                      {selectedPayoutMethod === 'bank' && (
                        <span className="text-white text-sm">✓ Selected</span>
                      )}
                    </div>
                  </button>
                  <button 
                    onClick={() => {
                      const address = prompt('Enter your USDC wallet address (Ethereum mainnet):');
                      if (address && address.startsWith('0x')) {
                        setSelectedPayoutMethod('crypto');
                        setPayoutDetails(address);
                        alert(`✓ Crypto selected: ${address}\n\nClick "Withdraw" to complete your cash out.`);
                      } else if (address) {
                        alert('❌ Invalid wallet address. Must start with 0x');
                      }
                    }}
                    className={cn(
                      "w-full hover:bg-white/20 border rounded-lg p-3 text-left transition-colors",
                      selectedPayoutMethod === 'crypto' ? "bg-green-600 border-green-400" : "bg-white/10 border-gray-600"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-white">Crypto (USDC)</p>
                        <p className="text-xs text-gray-400">
                          {selectedPayoutMethod === 'crypto' ? `${payoutDetails.slice(0, 6)}...${payoutDetails.slice(-4)}` : 'Blockchain transfer'}
                        </p>
                      </div>
                      {selectedPayoutMethod === 'crypto' && (
                        <span className="text-white text-sm">✓ Selected</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Withdraw Button */}
              <Button 
                disabled={!selectedPayoutMethod}
                onClick={async () => {
                  if (!selectedPayoutMethod) {
                    alert('⚠️ Please select a payout method first');
                    return;
                  }

                  const methodNames = {
                    paypal: 'PayPal',
                    bank: 'Bank Transfer',
                    crypto: 'Crypto (USDC)'
                  };
                  
                  if (!confirm(`Confirm withdrawal of $${totalEarnings.toFixed(2)}?\n\nMethod: ${methodNames[selectedPayoutMethod]}\nDestination: ${payoutDetails}\n\nFunds will be transferred within 1-3 business days.`)) {
                    return;
                  }
                  
                  try {
                    // Create withdrawal transaction
                    await base44.entities.Transaction.create({
                      from_email: 'platform@encirclenet.com',
                      from_name: 'Encircle Net',
                      to_email: user?.email,
                      to_name: user?.full_name,
                      amount: totalEarnings,
                      type: 'withdrawal',
                      status: 'processing',
                      metadata: {
                        payout_method: selectedPayoutMethod,
                        payout_details: payoutDetails
                      }
                    });

                    // Create revenue record for tracking
                    await base44.entities.Revenue.create({
                      user_email: user?.email,
                      source: 'withdrawal',
                      amount: -totalEarnings,
                      description: `Cash out via ${methodNames[selectedPayoutMethod]}: ${payoutDetails}`
                    });

                    alert(`🎉 Withdrawal Successful!\n\nAmount: $${totalEarnings.toFixed(2)}\nMethod: ${methodNames[selectedPayoutMethod]}\n\nYour funds are being processed and will arrive within 1-3 business days.\n\nTrack status in your transaction history.`);
                    
                    // Refresh the page to show updated balance
                    window.location.reload();
                  } catch (error) {
                    console.error('Withdrawal error:', error);
                    alert('❌ Withdrawal Failed\n\nThere was an error processing your withdrawal. Please try again or contact support.');
                  }
                }}
                className={cn(
                  "w-full h-14 text-lg font-bold text-white shadow-glow transition-all",
                  selectedPayoutMethod 
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600" 
                    : "bg-gray-600 cursor-not-allowed"
                )}
              >
                <DollarSign className="w-6 h-6 mr-2" />
                {selectedPayoutMethod ? `Withdraw $${totalEarnings.toFixed(2)}` : 'Select Payout Method First'}
              </Button>

              <p className="text-xs text-center text-green-300">
                Minimum withdrawal: $10.00 • No fees • Instant processing
              </p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Almost There!</h3>
              <p className="text-green-200 mb-4">
                Earn ${(10 - totalEarnings).toFixed(2)} more to unlock withdrawals
              </p>
              <div className="bg-black/30 rounded-xl p-4 border border-green-700 max-w-md mx-auto">
                <p className="text-sm font-semibold text-green-300 mb-2">Quick earning tips:</p>
                <ul className="space-y-2 text-sm text-gray-300 text-left">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Post quality content to receive tips
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Share your referral code (90% revenue share!)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Join affiliate programs for commission
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Create premium circles for subscriptions
                  </li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}