import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function CommentsModal({ post, isOpen, onClose, currentUser }) {
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: async () => {
      const allComments = await base44.entities.Comment.filter({ post_id: post.id }, 'created_date');
      return allComments.filter(c => !c.parent_comment_id);
    },
    enabled: !!post?.id && isOpen
  });

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const newComment = await base44.entities.Comment.create({
        post_id: post.id,
        author_email: currentUser.email,
        author_name: currentUser.full_name,
        author_avatar: currentUser.avatar,
        content: commentText,
        likes_count: 0
      });

      // Update post comment count
      await base44.entities.Post.update(post.id, {
        comments_count: (post.comments_count || 0) + 1
      });

      // Send notification to post author
      if (post.created_by !== currentUser.email) {
        base44.functions.invoke('createNotification', {
          user_email: post.created_by,
          type: 'reply',
          title: 'New Comment',
          message: `${currentUser.full_name} commented on your post`,
          from_user: currentUser.email,
          from_user_name: currentUser.full_name,
          related_id: post.id,
          related_type: 'post'
        }).catch(() => {});
      }

      return newComment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', post.id]);
      queryClient.invalidateQueries(['posts']);
      setCommentText('');
    }
  });

  const likeCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const comment = comments.find(c => c.id === commentId);
      return await base44.entities.Comment.update(commentId, {
        likes_count: (comment.likes_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments', post?.id]);
    }
  });

  const handleSubmit = () => {
    if (commentText.trim()) {
      createCommentMutation.mutate();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            Comments ({post?.comments_count || 0})
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          <AnimatePresence>
            {comments.map((comment, index) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-3 p-3 rounded-lg hover:bg-gray-50"
              >
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={comment.author_avatar} />
                  <AvatarFallback className="gradient-bg-primary text-white">
                    {comment.author_name?.[0] || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-white rounded-lg border border-gray-200 p-3">
                    <p className="font-semibold text-sm text-blue-900 mb-1">{comment.author_name}</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{moment(comment.created_date).fromNow()}</span>
                    <button
                      onClick={() => likeCommentMutation.mutate(comment.id)}
                      className="flex items-center gap-1 hover:text-red-600 transition-colors"
                    >
                      <Heart className="w-3 h-3" />
                      <span>{comment.likes_count || 0}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600">No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={currentUser?.avatar} />
              <AvatarFallback className="gradient-bg-primary text-white">
                {currentUser?.full_name?.[0] || '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex gap-2">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Write a comment..."
                className="flex-1 resize-none"
                rows={2}
              />
              <Button
                onClick={handleSubmit}
                disabled={!commentText.trim() || createCommentMutation.isPending}
                className="gradient-bg-primary text-white"
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}