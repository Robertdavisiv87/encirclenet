import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Heart, MessageCircle, Eye } from 'lucide-react';

export default function TopPerformingPosts({ userEmail }) {
  const { data: posts } = useQuery({
    queryKey: ['top-posts', userEmail],
    queryFn: async () => {
      const allPosts = await base44.entities.Post.filter({ created_by: userEmail });
      return allPosts
        .sort((a, b) => ((b.likes_count || 0) + (b.comments_count || 0)) - ((a.likes_count || 0) + (a.comments_count || 0)))
        .slice(0, 5);
    },
    enabled: !!userEmail,
    refetchInterval: 60000
  });

  if (!posts || posts.length === 0) return null;

  return (
    <Card className="bg-white border-2 border-gray-200 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          Top Performing Posts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {posts.map((post, index) => (
          <div key={post.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold shadow-md">
              {index + 1}
            </div>
            {post.media_url && (
              <img src={post.media_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-blue-900 truncate">
                {post.caption || 'Untitled Post'}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {post.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {post.comments_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {post.views_count || 0}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">
                ${(post.tips_received || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">earned</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}