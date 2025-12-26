import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Target, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ContactInvite from '../components/referrals/ContactInvite';
import SEO from '../components/SEO';

export default function Referrals() {
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

  const { data: referrals } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const totalEarned = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;
  const completedReferrals = referrals.filter(r => r.status === 'completed').length;

  const stats = [
    { label: 'Total Referred', value: referrals.length, icon: Users, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active', value: completedReferrals, icon: Target, color: 'from-green-500 to-emerald-500' },
    { label: 'Total Earned', value: `$${totalEarned.toFixed(2)}`, icon: DollarSign, color: 'from-purple-500 to-pink-500' },
    { label: 'Pending', value: pendingReferrals, icon: TrendingUp, color: 'from-orange-500 to-red-500' }
  ];

  const referralCode = user?.email ? `CREATOR${user.email.slice(0, 4).toUpperCase()}` : '';

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Referral Program - EncircleNet | Earn Rewards"
        description="Invite friends to EncircleNet and earn lifetime commissions. Get paid for every signup and creator you refer."
        keywords="referral program, earn rewards, invite friends, creator referrals, commission program"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Referral Program</h1>
        <p className="text-gray-600">Invite your circle. Earn together. Build your network.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
                <CardContent className="p-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-md`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-blue-900">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Contact Invite */}
        <ContactInvite userEmail={user?.email} referralCode={referralCode} />

        {/* Referral History */}
        <Card className="bg-white border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Award className="w-5 h-5 text-purple-600" />
              Recent Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-3">
                {referrals.slice(0, 5).map((ref) => (
                  <div key={ref.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                    <div>
                      <p className="font-medium text-sm text-blue-900">{ref.referred_email}</p>
                      <p className="text-xs text-gray-600">{ref.conversion_type} • {ref.status}</p>
                    </div>
                    <p className="font-bold text-green-600">${ref.commission_earned.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 mb-2">No referrals yet</p>
                <p className="text-sm text-gray-500">Start inviting to earn rewards!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}