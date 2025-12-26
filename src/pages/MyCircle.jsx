import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Users, UserPlus, Gift, TrendingUp, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import SEO from '../components/SEO';

export default function MyCircle() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const { data: referrals, isLoading: loadingReferrals } = useQuery({
    queryKey: ['my-referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['circle-followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: following } = useQuery({
    queryKey: ['circle-following', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  // Get mutual connections (people who follow you and you follow back)
  const mutualConnections = followers.filter(follower => 
    following.some(f => f.following_email === follower.follower_email)
  );

  const totalEarningsFromReferrals = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="My Circle - Encircle Net"
        description="View your connections, referred friends, and mutual followers on Encircle Net"
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">👥 My Circle</h1>
        <p className="text-blue-900">Your connections, referrals, and growing network</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-white border-2 border-purple-200 realistic-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{mutualConnections.length}</p>
                <p className="text-sm text-gray-600">Mutual Friends</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-blue-200 realistic-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-glow">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{referrals.length}</p>
                <p className="text-sm text-gray-600">Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-2 border-green-200 realistic-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-glow">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">${totalEarningsFromReferrals.toFixed(2)}</p>
                <p className="text-sm text-gray-600">From Referrals</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mutual Connections */}
      <Card className="bg-white border-2 border-gray-200 realistic-shadow mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Users className="w-5 h-5 text-purple-600" />
            Mutual Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mutualConnections.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No mutual connections yet</p>
              <p className="text-sm text-gray-400 mt-2">Follow people and they'll appear here when they follow you back</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mutualConnections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-gray-200 rounded-xl hover-lift">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-purple-500/50">
                      <AvatarImage src={connection.follower_avatar} />
                      <AvatarFallback className="gradient-bg-primary">
                        {connection.follower_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-blue-900">{connection.follower_name || 'User'}</p>
                      <p className="text-xs text-gray-600">{connection.follower_email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-purple-300"
                  >
                    View Profile
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referred Friends */}
      <Card className="bg-white border-2 border-gray-200 realistic-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Friends You Referred
          </CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No referrals yet</p>
              <p className="text-sm text-gray-400 mt-2">Invite friends to earn rewards</p>
              <Button
                onClick={() => window.location.href = createPageUrl('Referrals')}
                className="mt-4 gradient-bg-primary text-white shadow-glow"
              >
                Invite Friends
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-gray-200 rounded-xl hover-lift">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 ring-2 ring-blue-500/50">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500">
                        {referral.referred_email?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-blue-900">{referral.referred_email}</p>
                      <p className="text-xs text-gray-600">
                        Status: <span className={`font-medium ${
                          referral.status === 'completed' ? 'text-green-600' : 
                          referral.status === 'pending' ? 'text-yellow-600' : 
                          'text-gray-600'
                        }`}>
                          {referral.status}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">${referral.commission_earned?.toFixed(2) || '0.00'}</p>
                    <p className="text-xs text-gray-500">earned</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}