import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign } from 'lucide-react';

export default function RevenueChart({ userEmail }) {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['revenue-chart', userEmail],
    queryFn: async () => {
      const [transactions, referrals, productOrders, serviceOrders] = await Promise.all([
        base44.entities.Transaction.filter({ to_email: userEmail }),
        base44.entities.Referral.filter({ referrer_email: userEmail }),
        base44.entities.ProductOrder.filter({ seller_email: userEmail }),
        base44.entities.ServiceOrder.filter({ seller_email: userEmail })
      ]);

      // Group by date (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      return last7Days.map(date => {
        const dayTransactions = transactions.filter(t => t.created_date?.startsWith(date));
        const dayReferrals = referrals.filter(r => r.created_date?.startsWith(date));
        const dayProducts = productOrders.filter(o => o.created_date?.startsWith(date));
        const dayServices = serviceOrders.filter(o => o.created_date?.startsWith(date));

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          tips: dayTransactions.filter(t => t.type === 'tip').reduce((sum, t) => sum + t.amount, 0),
          referrals: dayReferrals.reduce((sum, r) => sum + (r.commission_earned || 0), 0),
          products: dayProducts.reduce((sum, o) => sum + (o.total_amount || 0), 0),
          services: dayServices.reduce((sum, o) => sum + (o.amount || 0), 0)
        };
      });
    },
    enabled: !!userEmail,
    refetchInterval: 60000 // Update every minute
  });

  if (isLoading || !chartData) return null;

  return (
    <Card className="bg-white border-2 border-gray-200 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <DollarSign className="w-5 h-5 text-green-600" />
          Revenue Trend (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="tips" stackId="1" stroke="#10b981" fill="#10b981" name="Tips" />
            <Area type="monotone" dataKey="referrals" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Referrals" />
            <Area type="monotone" dataKey="products" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Products" />
            <Area type="monotone" dataKey="services" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Services" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}