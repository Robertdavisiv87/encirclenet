import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DollarSign } from 'lucide-react';

const COLORS = ['#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4'];

export default function RevenueBreakdown({ data }) {
  const chartData = data || [
    { name: 'Tips', value: 450 },
    { name: 'Subscriptions', value: 300 },
    { name: 'Ads', value: 150 },
    { name: 'Affiliate', value: 200 },
    { name: 'Referrals', value: 100 }
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Revenue Sources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '1px solid #27272a',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 text-center">
          <p className="text-2xl font-bold text-green-400">${total.toFixed(2)}</p>
          <p className="text-sm text-zinc-500">Total Revenue</p>
        </div>
      </CardContent>
    </Card>
  );
}