import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MapPin, Clock, TrendingUp, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AudienceInsights({ 
  followers = [], 
  posts = [],
  engagement = {}
}) {
  // Calculate engagement patterns
  const postsByDay = posts.reduce((acc, post) => {
    const day = new Date(post.created_date).toLocaleDateString('en-US', { weekday: 'long' });
    acc[day] = (acc[day] || 0) + 1;
    return acc;
  }, {});

  const postsByHour = posts.reduce((acc, post) => {
    const hour = new Date(post.created_date).getHours();
    acc[hour] = (acc[hour] || 0) + 1;
    return acc;
  }, {});

  const bestDay = Object.entries(postsByDay).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
  const bestHour = Object.entries(postsByHour).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  const avgEngagement = posts.length > 0
    ? posts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0) / posts.length
    : 0;

  const insights = [
    {
      icon: Users,
      label: 'Total Followers',
      value: followers.length,
      sublabel: 'Growing audience',
      color: 'text-purple-600'
    },
    {
      icon: TrendingUp,
      label: 'Avg Engagement',
      value: avgEngagement.toFixed(1),
      sublabel: 'Per post',
      color: 'text-green-600'
    },
    {
      icon: Calendar,
      label: 'Best Day',
      value: bestDay,
      sublabel: 'Post on this day',
      color: 'text-blue-600'
    },
    {
      icon: Clock,
      label: 'Best Time',
      value: bestHour !== 'N/A' ? `${bestHour}:00` : 'N/A',
      sublabel: 'Peak engagement',
      color: 'text-orange-600'
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Users className="w-6 h-6 text-blue-600" />
          Audience Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {insights.map((insight, idx) => (
            <div key={idx} className="bg-white rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <insight.icon className={`w-5 h-5 ${insight.color}`} />
                <span className="text-xs text-gray-600">{insight.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{insight.value}</p>
              <p className="text-xs text-gray-500 mt-1">{insight.sublabel}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Engagement Patterns</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Most Active Day</span>
              <Badge className="bg-blue-100 text-blue-900">{bestDay}</Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Peak Hour</span>
              <Badge className="bg-purple-100 text-purple-900">
                {bestHour !== 'N/A' ? `${bestHour}:00` : 'N/A'}
              </Badge>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Posts</span>
              <Badge className="bg-green-100 text-green-900">{posts.length}</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}