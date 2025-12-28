import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, Package, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RevenueBreakdownCard({ creatorEmail }) {
  const { data: tips = [] } = useQuery({
    queryKey: ['tips-revenue', creatorEmail],
    queryFn: () => base44.entities.TipTransaction.filter({ to_email: creatorEmail })
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['subs-revenue', creatorEmail],
    queryFn: () => base44.entities.CreatorSubscription.filter({ 
      creator_email: creatorEmail,
      status: 'active' 
    })
  });

  const { data: productSales = [] } = useQuery({
    queryKey: ['product-sales', creatorEmail],
    queryFn: () => base44.entities.ProductOrder.filter({ seller_email: creatorEmail })
  });

  const { data: serviceSales = [] } = useQuery({
    queryKey: ['service-sales', creatorEmail],
    queryFn: () => base44.entities.ServiceOrder.filter({ seller_email: creatorEmail })
  });

  const totalTips = tips.reduce((sum, t) => sum + (t.amount || 0), 0);
  const monthlySubRevenue = subscriptions.reduce((sum, s) => sum + (s.monthly_amount || 0), 0);
  const totalProductRevenue = productSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalServiceRevenue = serviceSales.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalRevenue = totalTips + monthlySubRevenue + totalProductRevenue + totalServiceRevenue;

  const revenueStreams = [
    { 
      label: 'Tips', 
      amount: totalTips, 
      icon: DollarSign, 
      color: 'text-yellow-600',
      bg: 'bg-yellow-100'
    },
    { 
      label: 'Subscriptions', 
      amount: monthlySubRevenue, 
      icon: Users, 
      color: 'text-purple-600',
      bg: 'bg-purple-100'
    },
    { 
      label: 'Digital Products', 
      amount: totalProductRevenue, 
      icon: Package, 
      color: 'text-blue-600',
      bg: 'bg-blue-100'
    },
    { 
      label: 'Services', 
      amount: totalServiceRevenue, 
      icon: Briefcase, 
      color: 'text-green-600',
      bg: 'bg-green-100'
    }
  ];

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-4xl font-bold gradient-text">${totalRevenue.toFixed(2)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {revenueStreams.map((stream, index) => (
            <motion.div
              key={stream.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stream.bg} rounded-xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <stream.icon className={`w-5 h-5 ${stream.color}`} />
                <span className="text-sm font-medium text-gray-700">{stream.label}</span>
              </div>
              <p className={`text-2xl font-bold ${stream.color}`}>
                ${stream.amount.toFixed(2)}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}