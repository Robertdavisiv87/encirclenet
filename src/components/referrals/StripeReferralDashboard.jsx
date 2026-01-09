import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  Share2, 
  DollarSign, 
  Users, 
  TrendingUp,
  CheckCircle,
  Clock,
  Gift,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StripeReferralDashboard() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState('');
  const [referralLink, setReferralLink] = useState('');
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        if (currentUser.referral_code) {
          setReferralCode(currentUser.referral_code);
          setReferralLink(`${window.location.origin}/signup?ref=${currentUser.referral_code}`);
        }
      } catch (e) {
        console.error('Load user error:', e);
      }
    };
    loadUser();
  }, []);

  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const result = await base44.functions.invoke('generateReferralCode', {});
      return result.data;
    },
    onSuccess: (data) => {
      setReferralCode(data.referral_code);
      setReferralLink(data.referral_link);
      queryClient.invalidateQueries(['user']);
      toast.success('Referral code generated!');
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const { data: myReferrals = [] } = useQuery({
    queryKey: ['stripe-referrals', user?.email],
    queryFn: () => base44.entities.StripeReferral.filter({ 
      referrer_email: user?.email 
    }),
    enabled: !!user?.email,
    refetchInterval: 30000
  });

  const totalEarnings = myReferrals
    .filter(r => r.reward_issued)
    .reduce((sum, r) => sum + (r.referrer_reward_amount || 0), 0);

  const pendingEarnings = myReferrals
    .filter(r => r.status === 'completed' && !r.reward_issued)
    .reduce((sum, r) => sum + (r.referrer_reward_amount || 0), 0);

  const completedReferrals = myReferrals.filter(r => r.status === 'rewarded').length;

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent('Join me and get a discount!');
    const body = encodeURIComponent(
      `I'm using this awesome platform and thought you'd love it too!\n\nUse my referral code: ${referralCode}\nOr click here: ${referralLink}\n\nYou'll get a discount on your first purchase!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <p className="text-sm opacity-90">Total Earned</p>
              </div>
              <p className="text-3xl font-bold">${totalEarnings.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">Via Stripe balance credits</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-8 h-8" />
                <p className="text-sm opacity-90">Successful Referrals</p>
              </div>
              <p className="text-3xl font-bold">{completedReferrals}</p>
              <p className="text-xs opacity-75 mt-1">Purchases completed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-8 h-8" />
                <p className="text-sm opacity-90">Pending Rewards</p>
              </div>
              <p className="text-3xl font-bold">${pendingEarnings.toFixed(2)}</p>
              <p className="text-xs opacity-75 mt-1">Processing</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Code Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Your Referral Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-300 rounded-xl">
                <p className="text-sm text-gray-600 mb-2">Your unique referral code:</p>
                <div className="flex items-center gap-3">
                  <code className="text-2xl font-bold text-purple-900 bg-white px-4 py-2 rounded-lg">
                    {referralCode}
                  </code>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Share your referral link:</p>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(referralLink, 'Referral link')}
                    variant="outline"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={shareViaEmail}
                    variant="outline"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>How it works:</strong> Share your code with friends. When they make their first purchase, 
                  they get a discount and you receive a reward automatically credited to your Stripe balance.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Gift className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <p className="text-gray-600 mb-4">Get your unique referral code and start earning!</p>
              <Button
                onClick={() => generateCodeMutation.mutate()}
                disabled={generateCodeMutation.isPending}
                className="gradient-bg-primary text-white"
              >
                {generateCodeMutation.isPending ? 'Generating...' : 'Generate Referral Code'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      {myReferrals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myReferrals.map((referral) => (
                <div 
                  key={referral.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{referral.referred_email}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(referral.created_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${referral.referrer_reward_amount?.toFixed(2)}
                    </p>
                    <Badge 
                      className={
                        referral.status === 'rewarded' ? 'bg-green-100 text-green-800' :
                        referral.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }
                    >
                      {referral.status === 'rewarded' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {referral.status === 'completed' && <Clock className="w-3 h-3 mr-1" />}
                      {referral.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Powered by Stripe
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
              Rewards are automatically credited to your Stripe customer balance
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
              Your referral balance can be used for future purchases on the platform
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
              No monthly fees - completely free referral system
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></span>
              Secure tracking via Stripe webhooks
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}