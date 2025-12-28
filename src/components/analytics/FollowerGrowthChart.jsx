import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users } from 'lucide-react';

export default function FollowerGrowthChart({ userEmail }) {
  const { data: chartData } = useQuery({
    queryKey: ['follower-growth', userEmail],
    queryFn: async () => {
      const followers = await base44.entities.Follow.filter({ following_email: userEmail });
      
      // Group by date (last 30 days)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return date.toISOString().split('T')[0];
      });

      let cumulativeCount = 0;
      return last30Days.map(date => {
        const newFollowers = followers.filter(f => f.created_date?.startsWith(date)).length;
        cumulativeCount += newFollowers;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          followers: cumulativeCount
        };
      });
    },
    enabled: !!userEmail,
    refetchInterval: 60000
  });

  if (!chartData) return null;

  return (
    <Card className="bg-white border-2 border-gray-200 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="w-5 h-5 text-purple-600" />
          Follower Growth (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="followers" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6' }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}