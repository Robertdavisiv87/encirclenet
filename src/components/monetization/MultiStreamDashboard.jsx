import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  Link as LinkIcon,
  Crown,
  Zap,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function MultiStreamDashboard({ earnings = {} }) {
  const streams = [
    {
      id: 'tips',
      name: 'Tips & Donations',
      icon: DollarSign,
      amount: earnings.tips || 0,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      description: 'Direct support from fans'
    },
    {
      id: 'subscriptions',
      name: 'Subscriptions',
      icon: Crown,
      amount: earnings.subscriptions || 0,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      description: 'Recurring monthly revenue'
    },
    {
      id: 'affiliate',
      name: 'Affiliate Sales',
      icon: LinkIcon,
      amount: earnings.affiliate || 0,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      description: 'Product commissions'
    },
    {
      id: 'referrals',
      name: 'Referrals',
      icon: Users,
      amount: earnings.referrals || 0,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      description: 'Invite earnings'
    },
    {
      id: 'shop',
      name: 'Shop Sales',
      icon: ShoppingBag,
      amount: earnings.shop || 0,
      color: 'from-pink-500 to-rose-500',
      bgColor: 'from-pink-50 to-rose-50',
      borderColor: 'border-pink-200',
      description: 'Product sales'
    },
    {
      id: 'brands',
      name: 'Brand Campaigns',
      icon: Zap,
      amount: earnings.brands || 0,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'from-yellow-50 to-orange-50',
      borderColor: 'border-yellow-200',
      description: 'PPC & sponsored content'
    }
  ];

  const totalEarnings = Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0);
  const activeStreams = streams.filter(s => s.amount > 0).length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 border-0 text-white shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-10 h-10" />
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-sm opacity-90 mb-1">Total Earnings (All Time)</p>
            <p className="text-4xl font-bold">${totalEarnings.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 border-0 text-white shadow-glow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-10 h-10" />
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold">
                {activeStreams}/6 Active
              </span>
            </div>
            <p className="text-sm opacity-90 mb-1">Active Revenue Streams</p>
            <p className="text-4xl font-bold">{activeStreams}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Streams Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {streams.map((stream, index) => {
          const Icon = stream.icon;
          const isActive = stream.amount > 0;

          return (
            <motion.div
              key={stream.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className={`bg-gradient-to-br ${stream.bgColor} border-2 ${stream.borderColor} hover:scale-105 transition-transform`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stream.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {isActive && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-blue-900 mb-1">{stream.name}</h3>
                  <p className="text-xs text-gray-600 mb-3">{stream.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-blue-900">
                      ${stream.amount.toFixed(2)}
                    </p>
                    {isActive && (
                      <span className="text-xs text-green-600 font-semibold">
                        +{((stream.amount / totalEarnings) * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Progress Bar */}
      <Card className="bg-white border-2 border-gray-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-blue-900">Revenue Distribution</h3>
            <p className="text-sm text-gray-600">{activeStreams} of 6 streams active</p>
          </div>
          
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
            {streams.filter(s => s.amount > 0).map((stream) => {
              const percentage = (stream.amount / totalEarnings) * 100;
              return (
                <div
                  key={stream.id}
                  className={`bg-gradient-to-r ${stream.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${stream.name}: ${percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4">
            {streams.filter(s => s.amount > 0).map((stream) => {
              const percentage = (stream.amount / totalEarnings) * 100;
              return (
                <div key={stream.id} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${stream.color}`} />
                  <span className="text-xs text-gray-600">
                    {stream.name}: {percentage.toFixed(1)}%
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Growth Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Unlock All Revenue Streams
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            {streams.filter(s => s.amount === 0).length > 0 ? (
              <>
                <p className="font-semibold mb-2">Inactive Streams - Tap to Activate:</p>
                <ul className="space-y-1">
                  {streams.filter(s => s.amount === 0).map(stream => (
                    <li key={stream.id} className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                      <span>{stream.name} - {stream.description}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-green-700 font-semibold">
                🎉 Congratulations! All revenue streams are active!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}