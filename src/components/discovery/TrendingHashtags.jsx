import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, Hash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function TrendingHashtags({ onHashtagClick }) {
  const { data: hashtags = [], isLoading } = useQuery({
    queryKey: ['trending-hashtags'],
    queryFn: async () => {
      const tags = await base44.entities.Hashtag.list('-trending_score', 10);
      return tags;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) return null;

  return (
    <Card className="bg-white border-2 border-gray-200 realistic-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Trending Hashtags
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {hashtags.map((tag, index) => (
          <motion.div
            key={tag.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onHashtagClick?.(tag.tag)}
            className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-blue-900 flex items-center gap-1">
                  <Hash className="w-4 h-4 text-purple-600" />
                  {tag.tag}
                </p>
                <p className="text-xs text-gray-600">{tag.post_count} posts</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-green-600">
                +{tag.engagement_rate.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}