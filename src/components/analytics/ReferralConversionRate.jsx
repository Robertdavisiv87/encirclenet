import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Users, TrendingUp } from 'lucide-react';

export default function ReferralConversionRate({ userEmail }) {
  const { data: referralData } = useQuery({
    queryKey: ['referral-conversion', userEmail],
    queryFn: async () => {
      const referrals = await base44.entities.Referral.filter({ referrer_email: userEmail });
      
      const total = referrals.length;
      const completed = referrals.filter(r => r.status === 'completed' || r.status === 'active').length;
      const pending = referrals.filter(r => r.status === 'pending').length;
      const totalEarned = referrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0);
      
      return {
        total,
        completed,
        pending,
        conversionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0,
        totalEarned
      };
    },
    enabled: !!userEmail,
    refetchInterval: 30000
  });

  if (!referralData) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="w-5 h-5 text-purple-600" />
          Referral Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Total Referrals</p>
            <p className="text-2xl font-bold text-blue-900">{referralData.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-purple-200">
            <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-2xl font-bold text-green-900">{referralData.conversionRate}%</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Completed</span>
            <span className="font-bold text-green-900">{referralData.completed}</span>
          </div>
          <Progress value={(referralData.completed / referralData.total) * 100} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Pending</span>
            <span className="font-bold text-yellow-900">{referralData.pending}</span>
          </div>
          <Progress value={(referralData.pending / referralData.total) * 100} className="h-2 bg-gray-200" />
        </div>

        <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Earned</p>
              <p className="text-3xl font-bold text-green-900">${referralData.totalEarned.toFixed(2)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}