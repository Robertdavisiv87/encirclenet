import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, DollarSign, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function PostCard({ post, currentUser, onLike, onTip }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(5);
  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      if (!currentUser) return;
      try {
        const likes = await base44.entities.Like.filter({
          post_id: post.id,
          user_email: currentUser.email
        });
        setIsLiked(likes.length > 0);
      } catch (e) {}
    };
    checkLike();
  }, [post.id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) return;
    
    if (isLiked) {
      const likes = await base44.entities.Like.filter({
        post_id: post.id,
        user_email: currentUser.email
      });
      if (likes.length > 0) {
        await base44.entities.Like.delete(likes[0].id);
      }
      setIsLiked(false);
      setLikesCount(prev => Math.max(0, prev - 1));
    } else {
      await base44.entities.Like.create({
        post_id: post.id,
        user_email: currentUser.email
      });
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
    }
    onLike && onLike(post.id, !isLiked);
  };

  const handleDoubleClick = () => {
    if (!isLiked) {
      handleLike();
    }
    setShowHeart(true);
    setTimeout(() => setShowHeart(false), 1000);
  };

  const handleTip = async () => {
    if (!currentUser) return;
    await base44.entities.Transaction.create({
      from_email: currentUser.email,
      from_name: currentUser.full_name,
      to_email: post.created_by,
      to_name: post.author_name,
      amount: tipAmount,
      type: 'tip',
      post_id: post.id
    });
    setShowTipModal(false);
    onTip && onTip(post.id, tipAmount);
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mb-4 card-depth-2 hover-lift">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-purple-500/50 shadow-glow">
            <AvatarImage src={post.author_avatar} />
            <AvatarFallback className="gradient-bg-primary">
              {post.author_name?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <div>
              <p className="font-semibold text-sm">{post.author_name}</p>
              {post.is_raw_mode && (
                <span className="text-xs text-purple-400 animate-pulse-glow">🔥 Raw Mode</span>
              )}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-zinc-400">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div 
        className="relative"
        onDoubleClick={handleDoubleClick}
      >
        {post.content_type === 'photo' && post.media_url && (
          <img 
            src={post.media_url} 
            alt="Post" 
            className="w-full aspect-square object-cover"
          />
        )}
        {post.content_type === 'video' && post.media_url && (
          <video 
            src={post.media_url} 
            className="w-full aspect-square object-cover"
            controls
          />
        )}
        {post.content_type === 'voice' && (
          <div className="w-full aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center">
            <div className="text-center">
              <Mic className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <p className="text-zinc-300">Voice Note</p>
              {post.media_url && (
                <audio src={post.media_url} controls className="mt-4" />
              )}
            </div>
          </div>
        )}
        {post.content_type === 'text' && (
          <div className="w-full min-h-[200px] bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-8 flex items-center justify-center">
            <p className="text-xl text-center font-medium">{post.caption}</p>
          </div>
        )}

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Heart className="w-24 h-24 text-red-500 fill-red-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="hover:opacity-70 transition-opacity">
              <Heart className={cn(
                "w-7 h-7 transition-colors",
                isLiked ? "text-red-500 fill-red-500" : "text-white"
              )} />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <MessageCircle className="w-7 h-7" />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <Send className="w-7 h-7" />
            </button>
            <button 
              onClick={() => setShowTipModal(true)}
              className="hover:opacity-70 transition-opacity ml-2"
            >
              <DollarSign className="w-7 h-7 text-yellow-500" />
            </button>
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <Bookmark className="w-7 h-7" />
          </button>
        </div>

        <p className="font-semibold text-sm mb-2">{likesCount} likes</p>
        
        {post.content_type !== 'text' && post.caption && (
          <p className="text-sm">
            <span className="font-semibold mr-2">{post.author_name}</span>
            {post.caption}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-purple-400 text-sm">#{tag}</span>
            ))}
          </div>
        )}

        {post.tips_received > 0 && (
          <p className="text-xs text-yellow-500 mt-2">
            💰 ${post.tips_received} earned from this post
          </p>
        )}
      </div>

      {/* Tip Modal */}
      <AnimatePresence>
        {showTipModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowTipModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm border border-zinc-800"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-center">Boost Value</h3>
              <p className="text-zinc-400 text-sm text-center mb-6">
                Send a tip to {post.author_name} for their awesome content!
              </p>
              
              <div className="flex justify-center gap-3 mb-6">
                {[5, 10, 25, 50].map(amount => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className={cn(
                      "px-4 py-2 rounded-full font-semibold transition-all",
                      tipAmount === amount 
                        ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleTip}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-90"
              >
                Send ${tipAmount} Tip
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}