import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift, Target, TrendingUp, Zap, CheckCircle2, Lock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function BonusTracker({ userEmail, referralCount = 0 }) {
  const { data: bonusRules = [] } = useQuery({
    queryKey: ['bonus-rules'],
    queryFn: () => base44.entities.ReferralBonusRule.filter({ is_active: true }),
    initialData: []
  });

  const { data: bonusHistory = [] } = useQuery({
    queryKey: ['bonus-history', userEmail],
    queryFn: () => base44.entities.UserBonusHistory.filter({ user_email: userEmail }),
    enabled: !!userEmail,
    initialData: []
  });

  const earnedBonusIds = bonusHistory.map(b => b.bonus_rule_id);
  const totalBonusEarned = bonusHistory.reduce((sum, b) => sum + (b.bonus_amount || 0), 0);

  const getRuleIcon = (type) => {
    switch (type) {
      case 'milestone': return Target;
      case 'activity_based': return TrendingUp;
      case 'streak': return Zap;
      case 'percentage_boost': return Gift;
      default: return Gift;
    }
  };

  const getRuleStatus = (rule) => {
    const minReferrals = rule.trigger_condition?.min_referrals || 0;
    const maxReferrals = rule.trigger_condition?.max_referrals;
    
    // Check if already earned (and not recurring)
    if (earnedBonusIds.includes(rule.id) && !rule.is_recurring) {
      return { status: 'earned', progress: 100 };
    }
    
    // Check if eligible
    if (referralCount >= minReferrals && (!maxReferrals || referralCount <= maxReferrals)) {
      return { status: 'eligible', progress: 100 };
    }
    
    // Calculate progress
    if (minReferrals > 0) {
      const progress = Math.min((referralCount / minReferrals) * 100, 100);
      return { status: 'in_progress', progress };
    }
    
    return { status: 'locked', progress: 0 };
  };

  const sortedRules = [...bonusRules].sort((a, b) => {
    const aMin = a.trigger_condition?.min_referrals || 0;
    const bMin = b.trigger_condition?.min_referrals || 0;
    return aMin - bMin;
  });

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            Bonus Tracker
          </span>
          <span className="text-lg font-bold text-green-900">
            +${totalBonusEarned.toFixed(2)} earned
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedRules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No bonus programs available yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRules.map((rule, index) => {
              const { status, progress } = getRuleStatus(rule);
              const Icon = getRuleIcon(rule.rule_type);
              const minReferrals = rule.trigger_condition?.min_referrals || 0;
              
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    status === 'earned' ? 'bg-green-50 border-green-300' :
                    status === 'eligible' ? 'bg-purple-50 border-purple-300 animate-pulse' :
                    status === 'in_progress' ? 'bg-blue-50 border-blue-300' :
                    'bg-gray-50 border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-md ${
                      status === 'earned' ? 'bg-gradient-to-br from-green-500 to-emerald-500' :
                      status === 'eligible' ? 'bg-gradient-to-br from-purple-500 to-pink-500' :
                      'bg-gradient-to-br from-gray-400 to-gray-500'
                    }`}>
                      {status === 'earned' ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : status === 'locked' ? (
                        <Lock className="w-5 h-5 text-white" />
                      ) : (
                        <Icon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-blue-900">{rule.rule_name}</h4>
                        {status === 'eligible' && (
                          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full font-bold animate-bounce">
                            CLAIM NOW!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{rule.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">
                          {status === 'earned' ? '✅ Earned' :
                           status === 'eligible' ? '🎉 Eligible!' :
                           `${referralCount} / ${minReferrals} referrals`}
                        </span>
                        <span className="font-bold text-green-900">
                          {rule.bonus_amount > 0 && `+$${rule.bonus_amount}`}
                          {rule.bonus_percentage > 0 && ` +${(rule.bonus_percentage * 100).toFixed(0)}%`}
                        </span>
                      </div>
                      {status === 'in_progress' && (
                        <Progress value={progress} className="mt-2 h-2" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}