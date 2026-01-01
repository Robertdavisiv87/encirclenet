import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign, Target, Award, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import ContactInvite from '../components/referrals/ContactInvite';
import SEO from '../components/SEO';

export default function Referrals() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');

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

  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: async () => {
      try {
        return await base44.entities.Referral.filter({ referrer_email: user?.email });
      } catch (err) {
        console.error('Failed to fetch referrals:', err);
        return [];
      }
    },
    enabled: !!user?.email,
    initialData: [],
    retry: 2,
    staleTime: 60000 // Cache for 1 minute
  });

  const totalEarned = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const activeReferrals = referrals.filter(r => r.status === 'active' || r.status === 'completed');
  const allReferrals = referrals;

  const stats = [
    { 
      label: 'Total Referred', 
      value: referrals.length, 
      icon: Users, 
      color: 'from-blue-500 to-cyan-500',
      onClick: () => setActiveTab('total')
    },
    { 
      label: 'Active', 
      value: activeReferrals.length, 
      icon: Target, 
      color: 'from-green-500 to-emerald-500',
      onClick: () => setActiveTab('recent')
    },
    { 
      label: 'Total Earned', 
      value: `$${totalEarned.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'from-purple-500 to-pink-500',
      onClick: () => setActiveTab('earned')
    },
    { 
      label: 'Pending', 
      value: pendingReferrals.length, 
      icon: Clock, 
      color: 'from-orange-500 to-red-500',
      onClick: () => setActiveTab('pending')
    }
  ];

  const referralCode = user?.email ? `CREATOR${user.email.slice(0, 4).toUpperCase()}` : '';

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Referral Program - Encircle Net | Earn Rewards"
        description="Invite friends to Encircle Net and earn lifetime commissions. Get paid for every signup and creator you refer."
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
              <Card 
                className="bg-white border-2 border-gray-200 realistic-shadow hover-lift cursor-pointer transition-all"
                onClick={stat.onClick}
              >
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

        {/* Referral History with Tabs */}
        <Card className="bg-white border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Award className="w-5 h-5 text-purple-600" />
              Referral Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full bg-gray-100 mb-4">
                <TabsTrigger value="recent" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                  Recent
                </TabsTrigger>
                <TabsTrigger value="total" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                  All
                </TabsTrigger>
                <TabsTrigger value="earned" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                  Earned
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                  Pending
                </TabsTrigger>
              </TabsList>

              {/* Recent Tab */}
              <TabsContent value="recent">
                {activeReferrals.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activeReferrals.slice(0, 10).map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-blue-900">{ref.referred_email || ref.referred_name || 'New User'}</p>
                          <p className="text-xs text-gray-600">{ref.conversion_type || 'signup'} • {ref.status}</p>
                        </div>
                        <p className="font-bold text-green-600">${(ref.commission_earned || 0).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto mb-3 text-green-400" />
                    <p className="text-gray-600 mb-2">No active referrals</p>
                    <p className="text-sm text-gray-500">Your active referrals will appear here</p>
                  </div>
                )}
              </TabsContent>

              {/* Total Referred Tab */}
              <TabsContent value="total">
                {allReferrals.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {allReferrals.map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-blue-900">{ref.referred_email || ref.referred_name || 'New User'}</p>
                          <p className="text-xs text-gray-600">
                            {ref.conversion_type || 'signup'} • {ref.status} • {new Date(ref.created_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-600">${(ref.commission_earned || 0).toFixed(2)}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ref.status === 'active' ? 'bg-green-100 text-green-800' :
                            ref.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {ref.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 mx-auto mb-3 text-blue-400" />
                    <p className="text-gray-600 mb-2">No referrals yet</p>
                    <p className="text-sm text-gray-500">Start inviting to earn rewards!</p>
                  </div>
                )}
              </TabsContent>

              {/* Total Earned Tab */}
              <TabsContent value="earned">
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 text-center">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
                    <p className="text-4xl font-bold text-green-900">${totalEarned.toFixed(2)}</p>
                    <p className="text-xs text-gray-600 mt-2">90% revenue share from referrals</p>
                  </div>
                  
                  {allReferrals.filter(r => r.commission_earned > 0).length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Earnings Breakdown</p>
                      {allReferrals
                        .filter(r => r.commission_earned > 0)
                        .sort((a, b) => b.commission_earned - a.commission_earned)
                        .map((ref) => (
                          <div key={ref.id} className="flex items-center justify-between p-3 bg-purple-50 border border-purple-200 rounded-xl">
                            <div>
                              <p className="font-medium text-sm text-blue-900">{ref.referred_email || ref.referred_name || 'User'}</p>
                              <p className="text-xs text-gray-600">{ref.conversion_type || 'subscription'}</p>
                            </div>
                            <p className="font-bold text-green-600">${ref.commission_earned.toFixed(2)}</p>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 text-sm">No earnings yet. Keep inviting!</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Pending Tab */}
              <TabsContent value="pending">
                {pendingReferrals.length > 0 ? (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {pendingReferrals.map((ref) => (
                      <div key={ref.id} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-blue-900">{ref.referred_email || ref.referred_name || 'New User'}</p>
                          <p className="text-xs text-gray-600">
                            Invited {new Date(ref.created_date).toLocaleDateString()} • Waiting for signup
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-semibold">
                          Pending
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 mx-auto mb-3 text-orange-400" />
                    <p className="text-gray-600 mb-2">No pending referrals</p>
                    <p className="text-sm text-gray-500">All invites have been completed or are active</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}