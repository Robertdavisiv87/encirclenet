import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp } from 'lucide-react';
import moment from 'moment';

export default function TipHistoryCard({ creatorEmail }) {
  const { data: tips = [] } = useQuery({
    queryKey: ['tip-history', creatorEmail],
    queryFn: () => base44.entities.TipTransaction.filter({ to_email: creatorEmail }, '-created_date', 50)
  });

  // Group by month
  const tipsByMonth = tips.reduce((acc, tip) => {
    const month = moment(tip.created_date).format('MMM YYYY');
    if (!acc[month]) acc[month] = [];
    acc[month].push(tip);
    return acc;
  }, {});

  return (
    <Card className="border-2 border-yellow-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-yellow-600" />
          Tip History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tips.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No tips received yet</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {Object.entries(tipsByMonth).map(([month, monthTips]) => (
              <div key={month}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-blue-900">{month}</h4>
                  <span className="text-sm font-semibold text-yellow-600">
                    ${monthTips.reduce((sum, t) => sum + (t.amount || 0), 0).toFixed(2)}
                  </span>
                </div>
                <div className="space-y-2">
                  {monthTips.slice(0, 5).map((tip) => (
                    <div key={tip.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{tip.from_email}</p>
                        {tip.message && (
                          <p className="text-xs text-gray-600 line-clamp-1">"{tip.message}"</p>
                        )}
                      </div>
                      <span className="text-lg font-bold text-yellow-600">${tip.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}