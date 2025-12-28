import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowBigUp, MessageSquare, Pin } from 'lucide-react';
import moment from 'moment';

export default function ForumPostCard({ post, onUpvote, onReply }) {
  return (
    <Card className="bg-white border-2 border-gray-200 hover:shadow-md transition-all">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="gradient-bg-primary text-white">
                {post.author_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-blue-900">{post.title}</h3>
                {post.is_pinned && <Pin className="w-4 h-4 text-yellow-500" />}
              </div>
              <p className="text-xs text-gray-500">
                by {post.author_name} • {moment(post.created_date).fromNow()}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700 mb-4">{post.content}</p>
        {post.tags?.length > 0 && (
          <div className="flex gap-2 mb-4">
            {post.tags.map((tag, i) => (
              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-4">
          <Button onClick={onUpvote} variant="ghost" size="sm" className="gap-1">
            <ArrowBigUp className="w-4 h-4" />
            {post.upvotes || 0}
          </Button>
          <Button onClick={onReply} variant="ghost" size="sm" className="gap-1">
            <MessageSquare className="w-4 h-4" />
            {post.replies_count || 0} replies
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}