import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Gift } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorEarningsCard({ creatorEmail }) {
  const { data: tips } = useQuery({
    queryKey: ['creator-tips', creatorEmail],
    queryFn: () => base44.entities.TipTransaction.filter({ to_email: creatorEmail }),
    initialData: []
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['creator-subscriptions', creatorEmail],
    queryFn: () => base44.entities.CreatorSubscription.filter({ 
      creator_email: creatorEmail,
      status: 'active'
    }),
    initialData: []
  });

  const { data: transactions } = useQuery({
    queryKey: ['creator-transactions', creatorEmail],
    queryFn: () => base44.entities.Transaction.filter({ to_email: creatorEmail }),
    initialData: []
  });

  const totalTips = tips.reduce((sum, t) => sum + (t.amount || 0), 0);
  const monthlySubscriptionRevenue = subscriptions.reduce((sum, s) => sum + (s.monthly_amount || 0), 0);
  const totalTransactions = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  const totalEarnings = totalTips + totalTransactions;

  const stats = [
    { 
      label: 'Total Earnings', 
      value: `$${totalEarnings.toFixed(2)}`, 
      icon: DollarSign, 
      color: 'text-green-600',
      bg: 'bg-green-100'
    },
    { 
      label: 'Tips Received', 
      value: `$${totalTips.toFixed(2)}`, 
      icon: Gift, 
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      count: tips.length
    },
    { 
      label: 'Monthly Subs', 
      value: `$${monthlySubscriptionRevenue.toFixed(2)}/mo`, 
      icon: Users, 
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      count: subscriptions.length
    },
    { 
      label: 'Growth', 
      value: '+12%', 
      icon: TrendingUp, 
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Creator Earnings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
              <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              {stat.count !== undefined && (
                <p className="text-xs text-gray-500 mt-1">{stat.count} total</p>
              )}
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}