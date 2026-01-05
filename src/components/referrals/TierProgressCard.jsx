import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, TrendingUp, Target, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TierProgressCard({ userEmail }) {
  const { data: userTier, refetch } = useQuery({
    queryKey: ['user-tier', userEmail],
    queryFn: async () => {
      const records = await base44.entities.UserReferralTier.filter({ user_email: userEmail });
      return records[0];
    },
    enabled: !!userEmail
  });

  const { data: currentTierData } = useQuery({
    queryKey: ['current-tier', userTier?.current_tier_id],
    queryFn: async () => {
      if (!userTier?.current_tier_id) return null;
      const tiers = await base44.entities.ReferralTier.filter({ id: userTier.current_tier_id });
      return tiers[0];
    },
    enabled: !!userTier?.current_tier_id
  });

  const { data: nextTierData } = useQuery({
    queryKey: ['next-tier', userTier?.next_tier_id],
    queryFn: async () => {
      if (!userTier?.next_tier_id) return null;
      const tiers = await base44.entities.ReferralTier.filter({ id: userTier.next_tier_id });
      return tiers[0];
    },
    enabled: !!userTier?.next_tier_id
  });

  // Auto-calculate tier on mount and when referrals change
  useEffect(() => {
    if (userEmail) {
      base44.functions.invoke('calculateUserTier', { user_email: userEmail })
        .then(() => refetch());
    }
  }, [userEmail]);

  if (!userTier || !currentTierData) {
    return (
      <Card className="border-2 border-gray-200">
        <CardContent className="py-12 text-center">
          <Award className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading tier information...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                style={{ backgroundColor: currentTierData.badge_color }}
              >
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{currentTierData.tier_name} Tier</p>
                <Badge variant="outline">Level {currentTierData.tier_level}</Badge>
              </div>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-blue-900">{userTier.total_referrals}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
              <p className="text-sm text-gray-600 mb-1">Successful</p>
              <p className="text-2xl font-bold text-green-900">{userTier.successful_referrals}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Total Earned</p>
              <p className="text-2xl font-bold text-purple-900">${userTier.total_commission_earned.toFixed(2)}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
              <p className="text-sm text-gray-600 mb-1">Tier Bonuses</p>
              <p className="text-2xl font-bold text-orange-900">${userTier.tier_bonuses_earned.toFixed(2)}</p>
            </div>
          </div>

          {/* Current Tier Perks */}
          {currentTierData.perks && currentTierData.perks.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-4">
              <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Your Current Perks
              </p>
              <div className="space-y-2">
                {currentTierData.perks.map((perk, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    {perk}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Tier Progress */}
          {nextTierData && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-blue-900 flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Next: {nextTierData.tier_name}
                </p>
                <Badge variant="outline">{Math.round(userTier.progress_to_next_tier)}%</Badge>
              </div>
              <Progress value={userTier.progress_to_next_tier} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Referrals Needed</p>
                  <p className="font-bold text-blue-900">
                    {userTier.successful_referrals} / {nextTierData.min_referrals}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Commission Needed</p>
                  <p className="font-bold text-green-900">
                    ${userTier.total_commission_earned.toFixed(2)} / ${nextTierData.min_commission || 0}
                  </p>
                </div>
              </div>
              {nextTierData.tier_bonus > 0 && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-300 rounded-lg p-3">
                  <p className="text-sm text-gray-700">
                    🎁 Unlock <span className="font-bold text-orange-900">${nextTierData.tier_bonus}</span> bonus when you reach {nextTierData.tier_name}!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tier History */}
          {userTier.tier_history && userTier.tier_history.length > 1 && (
            <div>
              <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Achievement History
              </p>
              <div className="space-y-2">
                {userTier.tier_history.map((achievement, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
                    <div>
                      <p className="font-semibold text-blue-900">{achievement.tier_name}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(achievement.achieved_date).toLocaleDateString()}
                      </p>
                    </div>
                    {achievement.bonus_earned > 0 && (
                      <Badge className="bg-green-100 text-green-800">
                        +${achievement.bonus_earned}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}