import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, TrendingUp, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../../utils';
import moment from 'moment';

export default function TrendingDiscussions() {
  const { data: forumPosts = [] } = useQuery({
    queryKey: ['trending-forum-posts'],
    queryFn: async () => {
      const posts = await base44.entities.ForumPost.list('-upvotes', 10);
      return posts.filter(p => !p.is_locked);
    },
    initialData: []
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-bold text-blue-900">Trending Discussions</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => window.location.href = createPageUrl('Forums')}
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <div className="space-y-3">
        {forumPosts.slice(0, 5).map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-md transition-all hover:border-purple-300"
              onClick={() => window.location.href = `${createPageUrl('Forums')}?post=${post.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center text-white font-bold">
                    {post.author_name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-blue-900 mb-1 line-clamp-1">{post.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-orange-600" />
                        {post.upvotes} upvotes
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.replies_count} replies
                      </span>
                      <span>{moment(post.created_date).fromNow()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {forumPosts.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600">No discussions yet. Be the first to start one!</p>
            <Button 
              className="mt-4 gradient-bg-primary text-white"
              onClick={() => window.location.href = createPageUrl('Forums')}
            >
              Start Discussion
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}