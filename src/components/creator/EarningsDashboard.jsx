import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Users, CreditCard, Clock } from 'lucide-react';

export default function EarningsDashboard({ creatorEmail }) {
  const { data: revenues = [] } = useQuery({
    queryKey: ['creator-revenues', creatorEmail],
    queryFn: () => base44.entities.Revenue.filter({ user_email: creatorEmail }, '-transaction_date'),
    enabled: !!creatorEmail
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['creator-subscriptions', creatorEmail],
    queryFn: () => base44.entities.CreatorSubscription.filter({ 
      creator_email: creatorEmail,
      status: 'active'
    }),
    enabled: !!creatorEmail
  });

  const totalEarnings = revenues.reduce((sum, r) => sum + (r.amount || 0), 0);
  const pendingPayouts = revenues.filter(r => r.status === 'pending')
    .reduce((sum, r) => sum + r.amount, 0);
  const paidOut = revenues.filter(r => r.status === 'paid')
    .reduce((sum, r) => sum + r.amount, 0);
  const monthlyRecurring = subscriptions.reduce((sum, s) => sum + (s.monthly_amount || 0), 0);

  const earningsBySource = revenues.reduce((acc, r) => {
    acc[r.source] = (acc[r.source] || 0) + r.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-green-600">${totalEarnings.toFixed(2)}</p>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Recurring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-blue-600">${monthlyRecurring.toFixed(2)}</p>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mt-1">{subscriptions.length} active subscribers</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-yellow-600">${pendingPayouts.toFixed(2)}</p>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Paid Out</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-3xl font-bold text-purple-600">${paidOut.toFixed(2)}</p>
              <CreditCard className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Earnings by Source</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(earningsBySource).map(([source, amount]) => (
              <div key={source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="capitalize font-medium text-gray-700">{source}</span>
                <span className="font-bold text-green-600">${amount.toFixed(2)}</span>
              </div>
            ))}
            {Object.keys(earningsBySource).length === 0 && (
              <p className="text-center text-gray-500 py-4">No earnings yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {revenues.slice(0, 10).map((rev) => (
              <div key={rev.id} className="flex items-center justify-between p-3 border-b last:border-0">
                <div>
                  <p className="font-medium capitalize">{rev.source}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(rev.transaction_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">${rev.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    rev.status === 'paid' ? 'bg-green-100 text-green-800' :
                    rev.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {rev.status}
                  </span>
                </div>
              </div>
            ))}
            {revenues.length === 0 && (
              <p className="text-center text-gray-500 py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}