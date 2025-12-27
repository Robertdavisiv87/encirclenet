import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, Users, Download, Lock, CreditCard, Building2, Coins } from 'lucide-react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import AdminProtection from '../components/auth/AdminProtection';

export default function AdminRevenue() {
  const [user, setUser] = useState(null);
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState(null);
  const [payoutDetails, setPayoutDetails] = useState('');
  const [showCashOutModal, setShowCashOutModal] = useState(false);

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

  const { data: allRevenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => base44.entities.Revenue.list('-created_date', 1000),
    initialData: [],
  });

  const { data: transactions } = useQuery({
    queryKey: ['admin-transactions'],
    queryFn: () => base44.entities.Transaction.list('-created_date', 500),
    initialData: [],
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.filter({ status: 'active' }),
    initialData: [],
  });

  // Calculate platform revenue shares (transparently applied)
  const tipsRevenue = transactions
    .filter(t => t.type === 'tip')
    .reduce((sum, t) => sum + ((t.amount || 0) * 0.25), 0); // 25% platform share

  const affiliateRevenue = allRevenue
    .filter(r => r.source === 'affiliate')
    .reduce((sum, r) => sum + ((r.amount || 0) * 0.4), 0); // 40% platform share

  const sponsoredRevenue = allRevenue
    .filter(r => r.source === 'ads')
    .reduce((sum, r) => sum + ((r.amount || 0) * 0.35), 0); // 35% platform share

  const subscriptionRevenue = subscriptions
    .reduce((sum, s) => sum + (s.price || 0), 0); // 100% platform

  const referralRevenue = allRevenue
    .filter(r => r.source === 'referrals')
    .reduce((sum, r) => sum + ((r.amount || 0) * 0.55), 0); // 55% platform share

  const totalPlatformRevenue = 
    tipsRevenue + 
    affiliateRevenue + 
    sponsoredRevenue + 
    subscriptionRevenue + 
    referralRevenue;

  const revenueBreakdown = [
    { source: 'Tips & Boosts', amount: tipsRevenue, share: '20-30%', color: 'from-green-500 to-emerald-500' },
    { source: 'Affiliate', amount: affiliateRevenue, share: '30-50%', color: 'from-blue-500 to-cyan-500' },
    { source: 'Sponsored Posts', amount: sponsoredRevenue, share: '30-40%', color: 'from-purple-500 to-pink-500' },
    { source: 'Subscriptions', amount: subscriptionRevenue, share: '70-100%', color: 'from-yellow-500 to-orange-500' },
    { source: 'Referrals', amount: referralRevenue, share: '50-60%', color: 'from-red-500 to-pink-500' },
  ];

  const handleCashOut = async () => {
    if (totalPlatformRevenue < 10) {
      alert('⚠️ Minimum cash-out amount is $10.00\n\nCurrent balance: $' + totalPlatformRevenue.toFixed(2) + '\n\nKeep earning to reach the minimum!');
      return;
    }
    
    if (!selectedPayoutMethod) {
      alert('⚠️ Please select a payout method first');
      return;
    }

    const methodNames = {
      paypal: 'PayPal',
      bank: 'Bank Transfer',
      crypto: 'Crypto (USDC)'
    };
    
    const confirmed = confirm(`Confirm withdrawal of $${totalPlatformRevenue.toFixed(2)}?\n\nMethod: ${methodNames[selectedPayoutMethod]}\nDestination: ${payoutDetails}\n\nFunds will be transferred within 1-3 business days.`);
    
    if (confirmed) {
      try {
        // Create withdrawal transaction
        await base44.entities.Transaction.create({
          from_email: 'platform@encirclenet.com',
          from_name: 'Encircle Net Platform',
          to_email: user?.email,
          to_name: user?.full_name,
          amount: totalPlatformRevenue,
          type: 'admin_withdrawal',
          status: 'processing',
          metadata: {
            payout_method: selectedPayoutMethod,
            payout_details: payoutDetails
          }
        });

        // Record revenue withdrawal
        await base44.entities.Revenue.create({
          user_email: user?.email,
          source: 'platform_withdrawal',
          amount: -totalPlatformRevenue,
          description: `Admin cash out via ${methodNames[selectedPayoutMethod]}: ${payoutDetails}`,
          status: 'processing'
        });

        alert(`🎉 Withdrawal Successful!\n\nAmount: $${totalPlatformRevenue.toFixed(2)}\nMethod: ${methodNames[selectedPayoutMethod]}\n\nYour funds are being processed and will arrive within 1-3 business days.`);
        setShowCashOutModal(false);
        window.location.reload();
      } catch (error) {
        console.error('Withdrawal error:', error);
        alert('❌ Withdrawal Failed\n\nThere was an error processing your withdrawal. Please try again or contact support.');
      }
    }
  };

  return (
    <AdminProtection>
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">💰 Your Earnings, Your Growth!</h1>
        <p className="text-blue-900 font-medium">Track your total revenue across multiple streams in real-time. Share, post, and engage to boost your earnings automatically!</p>
      </div>

      <div className="flex justify-end mb-6">
        <Button 
          onClick={() => setShowCashOutModal(true)}
          disabled={totalPlatformRevenue < 10}
          className="gradient-bg-primary text-white shadow-glow hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-5 h-5 mr-2" />
          {totalPlatformRevenue >= 10 ? `Cash Out ($${totalPlatformRevenue.toFixed(2)})` : 'Cash Out (Min $10)'}
        </Button>
      </div>

      {/* Cash Out Modal */}
      {showCashOutModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowCashOutModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900 to-emerald-900 rounded-2xl p-8 max-w-lg w-full border-2 border-green-500 shadow-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Download className="w-8 h-8" />
              Cash Out Available
            </h3>
            <p className="text-green-200 mb-6">Withdraw your earnings instantly</p>

            {/* Balance Display */}
            <div className="bg-black/30 rounded-xl p-6 mb-6 border border-green-700">
              <p className="text-sm text-green-300 mb-1">Available Balance</p>
              <p className="text-5xl font-bold text-white">${totalPlatformRevenue.toFixed(2)}</p>
            </div>

            {/* Payout Methods */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-semibold text-green-300 mb-3">Select Payout Method</p>
              
              <button 
                onClick={() => {
                  const email = prompt('Enter your PayPal email address:');
                  if (email && email.includes('@')) {
                    setSelectedPayoutMethod('paypal');
                    setPayoutDetails(email);
                    alert(`✓ PayPal selected: ${email}\n\nClick "Confirm Withdrawal" to complete.`);
                  }
                }}
                className={`w-full hover:bg-white/20 border rounded-lg p-4 text-left transition-all ${
                  selectedPayoutMethod === 'paypal' ? 'bg-green-600 border-green-400 shadow-glow' : 'bg-white/10 border-green-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-green-300" />
                    <div>
                      <p className="font-semibold text-white">PayPal</p>
                      <p className="text-xs text-gray-400">
                        {selectedPayoutMethod === 'paypal' ? payoutDetails : 'Instant transfer'}
                      </p>
                    </div>
                  </div>
                  {selectedPayoutMethod === 'paypal' ? (
                    <span className="text-white text-sm font-semibold">✓ Selected</span>
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
                    alert(`✓ Bank Transfer selected\n\nClick "Confirm Withdrawal" to complete.\n\nProcessing time: 1-3 business days`);
                  }
                }}
                className={`w-full hover:bg-white/20 border rounded-lg p-4 text-left transition-all ${
                  selectedPayoutMethod === 'bank' ? 'bg-green-600 border-green-400 shadow-glow' : 'bg-white/10 border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-green-300" />
                    <div>
                      <p className="font-semibold text-white">Bank Transfer</p>
                      <p className="text-xs text-gray-400">
                        {selectedPayoutMethod === 'bank' ? 'Bank details saved' : '1-3 business days'}
                      </p>
                    </div>
                  </div>
                  {selectedPayoutMethod === 'bank' && (
                    <span className="text-white text-sm font-semibold">✓ Selected</span>
                  )}
                </div>
              </button>

              <button 
                onClick={() => {
                  const address = prompt('Enter your USDC wallet address (Ethereum mainnet):');
                  if (address && address.startsWith('0x')) {
                    setSelectedPayoutMethod('crypto');
                    setPayoutDetails(address);
                    alert(`✓ Crypto selected: ${address}\n\nClick "Confirm Withdrawal" to complete.`);
                  } else if (address) {
                    alert('❌ Invalid wallet address. Must start with 0x');
                  }
                }}
                className={`w-full hover:bg-white/20 border rounded-lg p-4 text-left transition-all ${
                  selectedPayoutMethod === 'crypto' ? 'bg-green-600 border-green-400 shadow-glow' : 'bg-white/10 border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Coins className="w-5 h-5 text-green-300" />
                    <div>
                      <p className="font-semibold text-white">Crypto (USDC)</p>
                      <p className="text-xs text-gray-400">
                        {selectedPayoutMethod === 'crypto' ? `${payoutDetails.slice(0, 6)}...${payoutDetails.slice(-4)}` : 'Blockchain transfer'}
                      </p>
                    </div>
                  </div>
                  {selectedPayoutMethod === 'crypto' && (
                    <span className="text-white text-sm font-semibold">✓ Selected</span>
                  )}
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={() => setShowCashOutModal(false)}
                variant="outline"
                className="flex-1 bg-white/10 text-white border-gray-600 hover:bg-white/20"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCashOut}
                disabled={!selectedPayoutMethod}
                className={`flex-1 text-white shadow-glow transition-all ${
                  selectedPayoutMethod 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Download className="w-5 h-5 mr-2" />
                {selectedPayoutMethod ? 'Confirm Withdrawal' : 'Select Method First'}
              </Button>
            </div>

            <p className="text-xs text-center text-green-300 mt-4">
              Minimum withdrawal: $10.00 • No fees • 1-3 business days
            </p>
          </motion.div>
        </div>
      )}

      {/* Total Revenue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 realistic-shadow mb-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-900 font-semibold mb-2">Total Platform Revenue</p>
                <h2 className="text-5xl font-bold gradient-text">
                  ${totalPlatformRevenue.toFixed(2)}
                </h2>
              </div>
              <div className="w-20 h-20 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                <DollarSign className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {revenueBreakdown.map((item, index) => (
          <motion.div
            key={item.source}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-blue-900">
                  {item.source}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-blue-900">${item.amount.toFixed(2)}</h3>
                  <p className="text-xs text-gray-600 mt-1">Platform Share: {item.share}</p>
                </div>
                <div className={`h-3 rounded-full bg-gradient-to-r ${item.color} shadow-md`}></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card className="bg-white border-2 border-gray-200 realistic-shadow">
        <CardHeader>
          <CardTitle className="text-blue-900">Recent Platform Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allRevenue.slice(0, 10).map((rev) => (
              <div key={rev.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-xl hover-lift">
                <div className="flex-1">
                  <p className="font-semibold text-sm capitalize text-blue-900">{rev.source}</p>
                  <p className="text-xs text-gray-600">{rev.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${rev.amount.toFixed(2)}</p>
                  <p className={`text-xs font-medium ${rev.status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                    {rev.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </AdminProtection>
  );
}