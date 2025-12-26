import React from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Link as LinkIcon, 
  Users, 
  ShoppingBag,
  Zap,
  Crown,
  ArrowUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function MultiStreamDashboard({ earnings }) {
  const streams = [
    {
      name: 'Tips & Donations',
      amount: earnings.tips || 0,
      icon: DollarSign,
      color: 'from-green-500 to-emerald-500',
      growth: '+12%'
    },
    {
      name: 'Subscriptions',
      amount: earnings.subscriptions || 0,
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      growth: '+28%'
    },
    {
      name: 'Affiliate Sales',
      amount: earnings.affiliate || 0,
      icon: LinkIcon,
      color: 'from-blue-500 to-cyan-500',
      growth: '+45%'
    },
    {
      name: 'Referrals',
      amount: earnings.referrals || 0,
      icon: Users,
      color: 'from-orange-500 to-red-500',
      growth: '+18%'
    },
    {
      name: 'Creator Shop',
      amount: earnings.shop || 0,
      icon: ShoppingBag,
      color: 'from-pink-500 to-rose-500',
      growth: '+22%'
    },
    {
      name: 'Brand Deals',
      amount: earnings.brands || 0,
      icon: Zap,
      color: 'from-yellow-500 to-orange-500',
      growth: '+35%'
    }
  ];

  const totalEarnings = streams.reduce((sum, stream) => sum + stream.amount, 0);

  return (
    <div className="space-y-6">
      {/* Total Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-purple-100 via-white to-pink-100 rounded-3xl p-8 border-2 border-purple-300 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-blue-900">Total Revenue</h3>
          <div className="flex items-center gap-2 text-green-600">
            <ArrowUp className="w-4 h-4" />
            <span className="text-sm font-bold">+24% this month</span>
          </div>
        </div>
        <motion.p 
          className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring" }}
        >
          ${totalEarnings.toFixed(2)}
        </motion.p>
        <p className="text-gray-600 text-sm mt-2">Across {streams.length} income streams</p>
      </motion.div>

      {/* Revenue Streams */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {streams.map((stream, index) => {
          const Icon = stream.icon;
          const percentage = totalEarnings > 0 ? (stream.amount / totalEarnings) * 100 : 0;
          
          return (
            <motion.div
              key={stream.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover-lift realistic-shadow overflow-hidden bg-white border-2 border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      {stream.name}
                    </CardTitle>
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                      className={`w-10 h-10 rounded-full bg-gradient-to-br ${stream.color} flex items-center justify-center shadow-md`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-end justify-between">
                      <p className="text-2xl font-bold text-blue-900">
                        ${stream.amount.toFixed(2)}
                      </p>
                      <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        {stream.growth}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>Revenue share</span>
                        <span className="font-semibold">{percentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}