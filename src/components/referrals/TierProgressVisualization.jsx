import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Zap, Target, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TierProgressVisualization({ referralCount = 0, totalEarnings = 0 }) {
  const tiers = [
    { name: 'Starter', min: 0, max: 4, icon: Target, color: 'from-gray-400 to-gray-500', bonus: 0 },
    { name: 'Bronze', min: 5, max: 9, icon: Star, color: 'from-amber-600 to-amber-700', bonus: 10 },
    { name: 'Silver', min: 10, max: 24, icon: Trophy, color: 'from-slate-400 to-slate-500', bonus: 25 },
    { name: 'Gold', min: 25, max: 49, icon: Crown, color: 'from-yellow-500 to-yellow-600', bonus: 50, boost: 10 },
    { name: 'Platinum', min: 50, max: 99, icon: Zap, color: 'from-purple-500 to-purple-600', bonus: 100, boost: 15 },
    { name: 'Legend', min: 100, max: 999, icon: Crown, color: 'from-pink-500 to-red-500', bonus: 250, boost: 20 }
  ];

  const currentTier = tiers.find(t => referralCount >= t.min && referralCount <= t.max) || tiers[0];
  const nextTier = tiers.find(t => t.min > referralCount);
  const currentTierIndex = tiers.indexOf(currentTier);

  // Calculate progress to next tier
  const progressToNext = nextTier 
    ? ((referralCount - currentTier.min) / (nextTier.min - currentTier.min)) * 100
    : 100;

  const referralsNeeded = nextTier ? nextTier.min - referralCount : 0;

  return (
    <Card className="border-2 border-purple-200 overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${currentTier.color} text-white`}>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <currentTier.icon className="w-6 h-6" />
            {currentTier.name} Tier
          </span>
          <span className="text-2xl font-bold">{referralCount} Referrals</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Current Tier Benefits */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
          <h4 className="font-bold text-blue-900 mb-2">Current Benefits</h4>
          <div className="space-y-1 text-sm">
            {currentTier.bonus > 0 && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>${currentTier.bonus} milestone bonus {referralCount >= currentTier.min ? '(claimed)' : ''}</span>
              </div>
            )}
            {currentTier.boost && (
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <span>{currentTier.boost}% earnings boost on all referrals</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              <span>Total earned: ${totalEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Progress to Next Tier */}
        {nextTier && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Progress to {nextTier.name}
              </span>
              <span className="text-sm text-gray-600">
                {referralsNeeded} more referral{referralsNeeded !== 1 ? 's' : ''}
              </span>
            </div>
            <Progress value={progressToNext} className="h-3 mb-2" />
            <p className="text-xs text-gray-600">
              {referralCount} / {nextTier.min} referrals
            </p>
          </div>
        )}

        {/* Next Tier Preview */}
        {nextTier && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <nextTier.icon className="w-5 h-5" />
              Next: {nextTier.name} Tier
            </h4>
            <div className="space-y-1 text-sm text-gray-700">
              {nextTier.bonus > 0 && (
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-600" />
                  <span>${nextTier.bonus} bonus when you reach {nextTier.min} referrals</span>
                </div>
              )}
              {nextTier.boost && (
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <span>{nextTier.boost}% permanent earnings boost</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Tiers Overview */}
        <div className="mt-6">
          <h4 className="font-bold text-blue-900 mb-3">All Tiers</h4>
          <div className="space-y-2">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              const isUnlocked = referralCount >= tier.min;
              const isCurrent = tier.name === currentTier.name;
              
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border-2 ${
                    isCurrent ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300' :
                    isUnlocked ? 'bg-green-50 border-green-300' :
                    'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br ${tier.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-blue-900">{tier.name}</p>
                      {isUnlocked && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                      {isCurrent && (
                        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                          CURRENT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">
                      {tier.min} referrals
                      {tier.bonus > 0 && ` • $${tier.bonus} bonus`}
                      {tier.boost && ` • ${tier.boost}% boost`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}