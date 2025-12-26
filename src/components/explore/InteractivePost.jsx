import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Bookmark, DollarSign, Info, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import VIPBadge from '../profile/VIPBadge';
import InfoCard from './InfoCard';
import { cn } from '@/lib/utils';

export default function InteractivePost({ post, userTier, onLike, onTip }) {
  const [liked, setLiked] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [points, setPoints] = useState(0);

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      setPoints(points + 10);
      onLike && onLike(post);
    }
  };

  const handleShare = () => {
    setPoints(points + 15);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative group"
      >
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-300 hover:border-purple-500 transition-all hover-lift realistic-shadow">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 ring-2 ring-purple-500/50">
                <AvatarImage src={post.author_avatar} />
                <AvatarFallback className="gradient-bg-primary">
                  {post.author_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm text-blue-900">{post.author_name}</p>
                  <VIPBadge tier={post.user_tier} size="sm" showLabel={false} />
                </div>
                <p className="text-xs text-gray-600">{post.theme}</p>
              </div>
            </div>
            {points > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full border border-yellow-300"
              >
                <Trophy className="w-3 h-3 text-yellow-600" />
                <span className="text-xs font-bold text-yellow-700">+{points}</span>
              </motion.div>
            )}
          </div>

          {/* Content */}
          <div className="relative">
            {post.media_url && post.content_type === 'photo' && (
              <img
                src={post.media_url}
                alt={post.caption || 'Post image'}
                className="w-full aspect-square object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            )}
            {post.media_url && post.content_type === 'video' && (
              <video
                src={post.media_url}
                className="w-full aspect-square object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            )}
            {!post.media_url && post.content_type === 'text' && (
              <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-6">
                <p className="text-center text-blue-900 font-medium">{post.caption}</p>
              </div>
            )}
            
            {/* Overlay Actions */}
            <div className="absolute bottom-4 right-4 flex flex-col gap-3">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl shadow-lg",
                  liked ? "bg-red-500" : "bg-white/90 border-2 border-gray-300"
                )}
              >
                <Heart className={cn("w-6 h-6", liked ? "fill-white text-white" : "text-red-500")} />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center border-2 border-gray-300 shadow-lg"
              >
                <MessageCircle className="w-6 h-6 text-blue-600" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleShare}
                className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center border-2 border-gray-300 shadow-lg"
              >
                <Share2 className="w-6 h-6 text-green-600" />
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInfo(true)}
                className="w-12 h-12 rounded-full gradient-bg-primary backdrop-blur-xl flex items-center justify-center shadow-glow"
              >
                <Info className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4">
            <p className="text-sm mb-2 text-blue-900">{post.caption}</p>
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span>{post.likes_count} likes</span>
              <span>{post.comments_count} comments</span>
              {post.tips_received > 0 && (
                <span className="text-yellow-600 font-semibold">${post.tips_received} earned</span>
              )}
            </div>
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-3">
                {post.tags.map((tag, i) => (
                  <span key={i} className="text-xs text-purple-600 font-medium">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {showInfo && (
        <InfoCard
          post={post}
          userTier={userTier}
          onClose={() => setShowInfo(false)}
        />
      )}
    </>
  );
}