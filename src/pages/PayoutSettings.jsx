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
  TrendingUp,
  Send
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SEO from '../components/SEO';

export default function PayoutSettings() {
  const [user, setUser] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showManualPayoutModal, setShowManualPayoutModal] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [connectingBank, setConnectingBank] = useState(false);
  const [manualPayoutMethod, setManualPayoutMethod] = useState('cashapp');
  const [manualPayoutDetails, setManualPayoutDetails] = useState('');
  const [manualPayoutAmount, setManualPayoutAmount] = useState('');
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

  const { data: payoutRequests = [] } = useQuery({
    queryKey: ['payout-requests', user?.email],
    queryFn: () => base44.entities.PayoutRequest.filter({ 
      user_email: user?.email
    }),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subscriptions', user?.email],
    queryFn: () => base44.entities.Subscription.filter({ 
      user_email: user?.email,
      status: 'active'
    }),
    enabled: !!user?.email
  });

  // Calculate earnings - use User entity's total_earnings and total_payouts for accurate tracking
  const totalEarnings = user?.total_earnings || 0;
  const totalPayouts = user?.total_payouts || 0;
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

  const handleManualPayoutRequest = async () => {
    if (!manualPayoutAmount || parseFloat(manualPayoutAmount) < 5) {
      toast({
        title: "Invalid Amount",
        description: "Minimum payout is $5",
        variant: "destructive"
      });
      return;
    }

    if (!manualPayoutDetails.trim()) {
      toast({
        title: "Missing Details",
        description: `Please provide your ${manualPayoutMethod} details`,
        variant: "destructive"
      });
      return;
    }

    setIsProcessingPayout(true);
    try {
      const response = await base44.functions.invoke('requestPayout', {
        amount: parseFloat(manualPayoutAmount),
        payout_method: manualPayoutMethod,
        payout_details: manualPayoutDetails
      });

      if (response.data.success) {
        toast({
          title: "✅ Request Submitted",
          description: "Admin will process your payout within 24-72 hours"
        });
        setShowManualPayoutModal(false);
        setManualPayoutAmount('');
        setManualPayoutDetails('');
        window.location.reload();
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      toast({
        title: "Request Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayout(false);
    }
  };

  const pendingRequest = payoutRequests.find(r => r.status === 'pending');

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
            {pendingRequest && (
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <p className="font-semibold text-yellow-900">Pending Payout Request</p>
                </div>
                <p className="text-sm text-gray-700">
                  Your ${pendingRequest.amount.toFixed(2)} payout via {pendingRequest.payout_method} is being processed. 
                  Admin will review within 24-72 hours.
                </p>
              </div>
            )}

            {availableBalance >= 5 ? (
              <div className="space-y-3">
                <div className="p-4 bg-green-50 border-2 border-green-300 rounded-xl">
                  <p className="text-sm text-gray-700 mb-3">
                    You have <span className="font-bold text-green-900">${availableBalance.toFixed(2)}</span> available to withdraw
                  </p>
                  <div className="grid gap-3">
                    {user.stripe_account_id && (
                      <Button
                        onClick={() => setShowConfirmModal(true)}
                        disabled={isProcessingPayout || !!pendingRequest}
                        className="w-full gradient-bg-primary text-white shadow-glow"
                      >
                        {isProcessingPayout ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Building2 className="w-4 h-4 mr-2" />
                            Cash Out via Bank (Instant)
                          </>
                        )}
                      </Button>
                    )}
                    <Button
                      onClick={() => setShowManualPayoutModal(true)}
                      disabled={isProcessingPayout || !!pendingRequest}
                      variant="outline"
                      className="w-full border-2 border-blue-400"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Request Manual Payout (CashApp, Zelle, etc.)
                    </Button>
                  </div>
                </div>
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
              <div className="p-3 bg-blue-50 border border-blue-300 rounded-lg text-sm text-blue-900">
                💡 Tip: Connect your bank for instant automated payouts, or request manual payouts via CashApp, Zelle, PayPal, or Venmo
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

      {/* Stripe Payout Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bank Payout</DialogTitle>
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

      {/* Manual Payout Request Modal */}
      <Dialog open={showManualPayoutModal} onOpenChange={setShowManualPayoutModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Manual Payout</DialogTitle>
            <DialogDescription>
              Choose your payout method and provide your account details. Admin will process within 24-72 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="amount">Amount ($5 minimum)</Label>
              <Input
                id="amount"
                type="number"
                min="5"
                max={availableBalance}
                step="0.01"
                placeholder="Enter amount"
                value={manualPayoutAmount}
                onChange={(e) => setManualPayoutAmount(e.target.value)}
              />
              <p className="text-xs text-gray-600 mt-1">Available: ${availableBalance.toFixed(2)}</p>
            </div>
            <div>
              <Label htmlFor="method">Payout Method</Label>
              <Select value={manualPayoutMethod} onValueChange={setManualPayoutMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cashapp">CashApp</SelectItem>
                  <SelectItem value="zelle">Zelle</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="venmo">Venmo</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="details">
                {manualPayoutMethod === 'cashapp' && 'CashApp Tag (e.g., $username)'}
                {manualPayoutMethod === 'zelle' && 'Zelle Email or Phone'}
                {manualPayoutMethod === 'paypal' && 'PayPal Email'}
                {manualPayoutMethod === 'venmo' && 'Venmo Username'}
                {manualPayoutMethod === 'bank_transfer' && 'Bank Account Details'}
              </Label>
              <Input
                id="details"
                placeholder={
                  manualPayoutMethod === 'cashapp' ? '$yourname' :
                  manualPayoutMethod === 'zelle' ? 'email@example.com' :
                  manualPayoutMethod === 'paypal' ? 'paypal@example.com' :
                  manualPayoutMethod === 'venmo' ? '@username' :
                  'Account details'
                }
                value={manualPayoutDetails}
                onChange={(e) => setManualPayoutDetails(e.target.value)}
              />
            </div>
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-900">
              ⏱️ Manual payouts are processed by admin within 24-72 hours. For instant payouts, connect your bank account.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualPayoutModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleManualPayoutRequest}
              disabled={isProcessingPayout}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isProcessingPayout ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}