import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  Building2, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import SEO from '../components/SEO';

export default function PayoutSettings() {
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Auto-sync earnings
        try {
          await base44.functions.invoke('syncUserEarnings', {});
        } catch (e) {
          console.log('Earnings sync failed:', e);
        }
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
    
    // Auto-refresh every 60 seconds
    const interval = setInterval(() => {
      base44.functions.invoke('syncUserEarnings', {}).catch(() => {});
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Fetch earnings data
  const { data: referrals = [] } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    refetchInterval: 60000
  });

  const { data: tips = [] } = useQuery({
    queryKey: ['tips', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      to_email: user?.email,
      type: 'tip'
    }),
    enabled: !!user?.email,
    refetchInterval: 60000
  });

  const { data: payouts = [] } = useQuery({
    queryKey: ['payouts', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ 
      to_email: user?.email,
      type: 'payout'
    }),
    enabled: !!user?.email,
    refetchInterval: 60000
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ 
      user_email: user?.email,
      status: 'active'
    }),
    enabled: !!user?.email
  });

  // Calculate earnings
  const referralEarnings = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const tipEarnings = tips.filter(t => t.status === 'completed' || !t.status).reduce((sum, t) => sum + (t.amount || 0), 0);
  const subscriptionEarnings = subscriptions.reduce((sum, s) => sum + (s.price || 0), 0) * 0.90;
  
  const totalEarnings = referralEarnings + tipEarnings + subscriptionEarnings;
  const totalPayouts = payouts.reduce((sum, p) => sum + (p.amount || 0), 0);
  const availableBalance = totalEarnings - totalPayouts;

  const handleConnectBank = async () => {
    setConnectingBank(true);
    try {
      const response = await base44.functions.invoke('createStripeConnectAccount', {});
      
      if (response.data.onboarding_url) {
        window.location.href = response.data.onboarding_url;
      } else {
        toast({
          title: "Already Connected",
          description: "Your bank account is already linked"
        });
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Payouts & Bank Settings - EncircleNet"
        description="Manage your earnings and bank account. Cash out your earnings securely via Stripe Connect."
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Your Earnings & Payouts</h1>
        <p className="text-gray-600">Connect your bank and withdraw your earnings in 1–2 business days</p>
      </motion.div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
          <p className="text-xs opacity-75 mt-2">All-time revenue</p>
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
          <p className="text-xs opacity-75 mt-2">Ready for withdrawal</p>
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
      <Card className="mb-8 border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Building2 className="w-6 h-6 text-purple-600" />
            Bank Account
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.stripe_account_id ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-semibold text-blue-900">Bank Account Connected</p>
                  <p className="text-sm text-gray-600">Stripe Verified</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleConnectBank}
                disabled={connectingBank}
                className="border-2 border-purple-400"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Update Bank Account
              </Button>
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
      <Card className="mb-8 border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-green-600" />
            Cash Out
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableBalance >= 5 ? (
              <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                <p className="text-sm text-gray-700 mb-3">
                  You have <span className="font-bold text-green-900">${availableBalance.toFixed(2)}</span> available to withdraw
                </p>
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={!user.stripe_account_id || isProcessingPayout}
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
                  Minimum payout is <span className="font-bold">$5.00</span>. You currently have <span className="font-bold">${availableBalance.toFixed(2)}</span>.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Keep earning! You need <span className="font-bold text-blue-900">${(5 - availableBalance).toFixed(2)}</span> more to cash out.
                </p>
              </div>
            )}
            {!user.stripe_account_id && (
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
      <div className="mt-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl">
        <h3 className="font-bold text-blue-900 mb-3">How Payouts Work</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
            All payouts are processed securely via Stripe Connect
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
            Your earnings from referrals, tips, services, and subscriptions automatically appear here
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
    </div>
  );
}