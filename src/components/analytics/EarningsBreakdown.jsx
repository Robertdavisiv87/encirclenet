import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Gift, Users, TrendingUp, ShoppingBag, Megaphone } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function EarningsBreakdown({ 
  tipsEarned = 0, 
  subscriptionEarned = 0, 
  referralEarned = 0, 
  adsEarned = 0,
  affiliateEarned = 0,
  shopEarned = 0
}) {
  const totalEarnings = tipsEarned + subscriptionEarned + referralEarned + adsEarned + affiliateEarned + shopEarned;

  const streams = [
    { 
      icon: Gift, 
      label: 'Tips & Boosts', 
      amount: tipsEarned, 
      color: 'bg-purple-500',
      percentage: totalEarnings > 0 ? (tipsEarned / totalEarnings * 100) : 0
    },
    { 
      icon: Users, 
      label: 'Subscriptions', 
      amount: subscriptionEarned, 
      color: 'bg-blue-500',
      percentage: totalEarnings > 0 ? (subscriptionEarned / totalEarnings * 100) : 0
    },
    { 
      icon: TrendingUp, 
      label: 'Referrals', 
      amount: referralEarned, 
      color: 'bg-green-500',
      percentage: totalEarnings > 0 ? (referralEarned / totalEarnings * 100) : 0
    },
    { 
      icon: Megaphone, 
      label: 'Ad Revenue', 
      amount: adsEarned, 
      color: 'bg-orange-500',
      percentage: totalEarnings > 0 ? (adsEarned / totalEarnings * 100) : 0
    },
    { 
      icon: ShoppingBag, 
      label: 'Affiliate Sales', 
      amount: affiliateEarned, 
      color: 'bg-pink-500',
      percentage: totalEarnings > 0 ? (affiliateEarned / totalEarnings * 100) : 0
    },
    { 
      icon: ShoppingBag, 
      label: 'Shop Sales', 
      amount: shopEarned, 
      color: 'bg-indigo-500',
      percentage: totalEarnings > 0 ? (shopEarned / totalEarnings * 100) : 0
    }
  ];

  const activeStreams = streams.filter(s => s.amount > 0);

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <DollarSign className="w-6 h-6 text-green-600" />
          Earnings Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white rounded-xl p-4 border-2 border-purple-200">
          <p className="text-sm text-gray-600 mb-1">Total Earnings</p>
          <p className="text-4xl font-bold gradient-text">${totalEarnings.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-1">{activeStreams.length} active streams</p>
        </div>

        <div className="space-y-3">
          {streams.map((stream, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <stream.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-semibold text-gray-900">{stream.label}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">${stream.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={stream.percentage} className="flex-1 h-2" />
                <span className="text-xs text-gray-500 w-12 text-right">{stream.percentage.toFixed(0)}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}