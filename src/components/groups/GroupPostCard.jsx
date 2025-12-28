import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle } from 'lucide-react';
import moment from 'moment';

export default function GroupPostCard({ post, currentUser }) {
  return (
    <Card className="border-2 border-gray-200 hover:border-purple-300 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{post.author_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-blue-900">{post.author_name}</p>
              <span className="text-xs text-gray-500">{moment(post.created_date).fromNow()}</span>
            </div>
            <h3 className="font-bold text-lg text-blue-900 mb-2">{post.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            {post.media_url && (
              <img 
                src={post.media_url} 
                alt={post.title}
                className="mt-3 rounded-lg max-h-96 w-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-200">
          <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
            <Heart className="w-4 h-4" />
            {post.likes_count || 0}
          </button>
          <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
            <MessageCircle className="w-4 h-4" />
            {post.comments_count || 0}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}