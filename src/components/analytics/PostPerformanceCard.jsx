import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Heart, Share2, MessageCircle, DollarSign, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import moment from 'moment';

export default function PostPerformanceCard({ post }) {
  const metrics = [
    { icon: Eye, label: 'Views', value: post.views_count || 0, color: 'text-blue-600' },
    { icon: Heart, label: 'Likes', value: post.likes_count || 0, color: 'text-red-600' },
    { icon: MessageCircle, label: 'Comments', value: post.comments_count || 0, color: 'text-purple-600' },
    { icon: DollarSign, label: 'Tips', value: `$${post.tips_received || 0}`, color: 'text-green-600' }
  ];

  const engagementRate = post.views_count > 0 
    ? (((post.likes_count || 0) + (post.comments_count || 0)) / post.views_count * 100).toFixed(1)
    : 0;

  return (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-all">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-blue-900 line-clamp-1">
              {post.caption || 'Untitled Post'}
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">{moment(post.created_date).format('MMM D, YYYY')}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-900">{post.content_type}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <metric.icon className={`w-4 h-4 ${metric.color}`} />
              <div>
                <p className="text-xs text-gray-500">{metric.label}</p>
                <p className="text-sm font-bold text-gray-900">{metric.value}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-xs text-gray-600">Engagement Rate</span>
          </div>
          <span className="text-sm font-bold text-green-600">{engagementRate}%</span>
        </div>
      </CardContent>
    </Card>
  );
}