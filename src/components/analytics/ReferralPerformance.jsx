import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function ReferralPerformance({ referrals = [] }) {
  const totalReferred = referrals.length;
  const activeReferrals = referrals.filter(r => r.status === 'active_creator').length;
  const signedUpReferrals = referrals.filter(r => r.status === 'signed_up' || r.status === 'active_creator').length;
  const pendingReferrals = referrals.filter(r => r.status === 'pending').length;

  const totalEarned = referrals.reduce((sum, r) => sum + (r.bonus_earned || 0), 0);
  const conversionRate = totalReferred > 0 ? (signedUpReferrals / totalReferred * 100) : 0;

  const stats = [
    {
      icon: Users,
      label: 'Total Invited',
      value: totalReferred,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      icon: CheckCircle,
      label: 'Signed Up',
      value: signedUpReferrals,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      icon: TrendingUp,
      label: 'Active Creators',
      value: activeReferrals,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      icon: DollarSign,
      label: 'Total Earned',
      value: `$${totalEarned.toFixed(2)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="w-6 h-6 text-green-600" />
          Referral Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${stat.bgColor} rounded-lg p-4 border border-gray-200`}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-xs text-gray-700 font-semibold">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-900">Conversion Rate</span>
            <span className="text-lg font-bold text-green-600">{conversionRate.toFixed(1)}%</span>
          </div>
          <Progress value={conversionRate} className="h-3 mb-2" />
          <p className="text-xs text-gray-500">{signedUpReferrals} of {totalReferred} invited users signed up</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-green-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Referral Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pending Invites</span>
              <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                {pendingReferrals}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Signed Up</span>
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                {signedUpReferrals}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Active Creators</span>
              <Badge variant="outline" className="border-green-500 text-green-700">
                {activeReferrals}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}