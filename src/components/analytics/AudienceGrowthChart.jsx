import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import moment from 'moment';

export default function AudienceGrowthChart({ creatorEmail }) {
  const { data: followers = [] } = useQuery({
    queryKey: ['followers-growth', creatorEmail],
    queryFn: () => base44.entities.Follow.filter({ following_email: creatorEmail })
  });

  // Group followers by date
  const followersByDate = followers.reduce((acc, follow) => {
    const date = moment(follow.created_date).format('MMM DD');
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date]++;
    return acc;
  }, {});

  // Create cumulative data for last 30 days
  const last30Days = [];
  let cumulative = 0;
  for (let i = 29; i >= 0; i--) {
    const date = moment().subtract(i, 'days').format('MMM DD');
    cumulative += followersByDate[date] || 0;
    last30Days.push({
      date,
      followers: cumulative
    });
  }

  const growthRate = last30Days.length > 1 
    ? ((last30Days[last30Days.length - 1].followers - last30Days[0].followers) / Math.max(last30Days[0].followers, 1) * 100).toFixed(1)
    : 0;

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Audience Growth (30 Days)
          </CardTitle>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-bold">+{growthRate}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={last30Days}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval={Math.floor(last30Days.length / 6)}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="followers" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}