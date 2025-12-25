import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function EngagementChart({ data, title = "Engagement Overview" }) {
  // Mock data if none provided
  const chartData = data || [
    { date: 'Mon', likes: 45, comments: 12, shares: 8 },
    { date: 'Tue', likes: 52, comments: 18, shares: 12 },
    { date: 'Wed', likes: 38, comments: 15, shares: 6 },
    { date: 'Thu', likes: 67, comments: 24, shares: 15 },
    { date: 'Fri', likes: 89, comments: 31, shares: 22 },
    { date: 'Sat', likes: 123, comments: 45, shares: 34 },
    { date: 'Sun', likes: 98, comments: 38, shares: 28 }
  ];

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis dataKey="date" stroke="#71717a" />
            <YAxis stroke="#71717a" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#18181b', 
                border: '1px solid #27272a',
                borderRadius: '8px'
              }}
            />
            <Area type="monotone" dataKey="likes" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
            <Area type="monotone" dataKey="comments" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
            <Area type="monotone" dataKey="shares" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}