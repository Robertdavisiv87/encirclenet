import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Send, ThumbsUp, Pin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function GroupDiscussionBoard({ groupId, currentUser }) {
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTitle, setNewPostTitle] = useState('');
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId
  });

  const createPostMutation = useMutation({
    mutationFn: async () => {
      return await base44.entities.GroupPost.create({
        group_id: groupId,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        title: newPostTitle,
        content: newPostContent,
        likes_count: 0,
        comments_count: 0,
        is_pinned: false
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-posts', groupId]);
      setNewPostTitle('');
      setNewPostContent('');
    }
  });

  const likePostMutation = useMutation({
    mutationFn: async (postId) => {
      const post = posts.find(p => p.id === postId);
      return await base44.entities.GroupPost.update(postId, {
        likes_count: (post.likes_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['group-posts', groupId]);
    }
  });

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Start a Discussion
          </h3>
          <input
            type="text"
            placeholder="Discussion title..."
            value={newPostTitle}
            onChange={(e) => setNewPostTitle(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <Textarea
            placeholder="What's on your mind? Share with the group..."
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            className="mb-3 min-h-24"
          />
          <Button
            onClick={() => createPostMutation.mutate()}
            disabled={!newPostTitle.trim() || !newPostContent.trim() || createPostMutation.isPending}
            className="gradient-bg-primary text-white"
          >
            <Send className="w-4 h-4 mr-2" />
            {createPostMutation.isPending ? 'Posting...' : 'Post Discussion'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-blue-900">Recent Discussions</h3>
        <AnimatePresence>
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-bg-primary flex items-center justify-center text-white font-bold">
                      {post.author_name?.[0] || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-blue-900">{post.title}</h4>
                        {post.is_pinned && (
                          <Pin className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{post.content}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="font-semibold">{post.author_name}</span>
                        <span>{moment(post.created_date).fromNow()}</span>
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => likePostMutation.mutate(post.id)}
                          className="flex items-center gap-2"
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.likes_count || 0}</span>
                        </Button>
                        <Button size="sm" variant="ghost" className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          <span>{post.comments_count || 0} comments</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {posts.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No discussions yet. Start the conversation!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}