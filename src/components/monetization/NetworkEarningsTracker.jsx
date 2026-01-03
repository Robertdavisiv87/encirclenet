import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingUp, Award } from 'lucide-react';

export default function NetworkEarningsTracker({ user }) {
  const { data: earnings } = useQuery({
    queryKey: ['network-earnings', user?.email],
    queryFn: () => base44.entities.NetworkEarnings.filter({ user_email: user?.email }),
    initialData: [],
    enabled: !!user
  });

  const totalEarned = earnings.reduce((sum, e) => sum + e.amount, 0);
  const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
  const activeReferrals = [...new Set(earnings.map(e => e.referral_email))].length;

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-900">
          <Users className="w-6 h-6" />
          Network Earnings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{activeReferrals}</p>
            <p className="text-sm text-gray-600">Active Referrals</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">${totalEarned.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Total Earned</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">${pendingEarnings.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>

        <div className="bg-green-100 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-green-900 mb-2">How Network Earnings Work</h4>
          <ul className="space-y-1 text-sm text-gray-700">
            <li>✓ Earn when your referrals complete services</li>
            <li>✓ Get bonuses when they hit milestones</li>
            <li>✓ No limits on how much you can earn</li>
            <li>✓ Payments processed weekly</li>
          </ul>
        </div>

        {earnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Recent Earnings</h4>
            {earnings.slice(0, 5).map((earning) => (
              <div key={earning.id} className="flex justify-between items-center p-2 bg-white rounded-lg border">
                <div>
                  <p className="text-sm font-medium text-gray-900">{earning.trigger_event}</p>
                  <p className="text-xs text-gray-600">{earning.earning_type.replace('_', ' ')}</p>
                </div>
                <span className="text-green-600 font-bold">+${earning.amount}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}