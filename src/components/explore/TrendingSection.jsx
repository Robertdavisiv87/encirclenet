import React from 'react';
import { motion } from 'framer-motion';
import { Flame, TrendingUp, Crown } from 'lucide-react';
import PostCard from '../feed/PostCard';

export default function TrendingSection({ title, icon: Icon, posts, currentUser, onLike, onTip }) {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 px-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-glow">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">{title}</h2>
      </div>
      
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={currentUser}
            onLike={onLike}
            onTip={onTip}
          />
        ))}
      </div>
    </div>
  );
}