import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, DollarSign, Mic, Lock } from 'lucide-react';
import MonetizationEligibility from '../monetization/MonetizationEligibility';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ViralIndicator from '../discovery/ViralIndicator';
import ImageLightbox from '../ui/ImageLightbox';

export default function PostCard({ post, currentUser, onLike, onTip }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(5);
  const [showHeart, setShowHeart] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  useEffect(() => {
    const checkLike = async () => {
      if (!currentUser) return;
      try {
        const likes = await base44.entities.Like.filter({
          post_id: post.id,
          user_email: currentUser.email
        });
        setIsLiked(likes.length > 0);

        // Check user subscription tier
        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
          status: 'active'
        });
        setUserSubscription(subs[0]);
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

  // Determine if post is viral
  const isViral = likesCount > 100;
  const isTrending = likesCount > 50 && likesCount <= 100;
  const isHot = likesCount > 20 && likesCount <= 50;

  const handleTip = async () => {
    if (!currentUser) return;

    const userTier = userSubscription?.tier || 'free';
    if (userTier === 'free') {
      return; // Blocked by MonetizationEligibility component
    }

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

  const userTier = userSubscription?.tier || 'free';
  const canMonetize = userTier === 'pro' || userTier === 'elite';

  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl overflow-hidden mb-4 realistic-shadow realistic-shadow-hover tap-feedback">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => window.location.href = `/viewprofile?email=${post.created_by}`}
          >
            <Avatar className="w-10 h-10 ring-2 ring-purple-500/50 shadow-glow">
              <AvatarImage src={post.author_avatar} />
              <AvatarFallback className="gradient-bg-primary">
                {post.author_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div>
                <p className="font-semibold text-sm text-blue-900">{post.author_name}</p>
                {post.is_raw_mode && (
                  <span className="text-xs text-purple-600 animate-pulse-glow">🔥 Raw Mode</span>
                )}
              </div>
            </div>
          </div>
        <Button variant="ghost" size="icon" className="text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div 
        className="relative"
        onDoubleClick={handleDoubleClick}
      >
        {/* Viral Indicator */}
        {(isViral || isTrending || isHot) && (
          <div className="absolute top-3 left-3 z-10">
            <ViralIndicator 
              type={isViral ? 'viral' : isTrending ? 'trending' : 'hot'}
              count={likesCount}
            />
          </div>
        )}
        {post.content_type === 'photo' && post.media_url && (
          <img 
            src={post.media_url} 
            alt="Post" 
            className="w-full aspect-square object-cover cursor-pointer hover:opacity-95 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              setShowImageLightbox(true);
            }}
          />
        )}
        {post.content_type === 'video' && post.media_url && (
          <div className="relative w-full aspect-square bg-black">
            <video 
              src={post.media_url} 
              className="w-full h-full object-contain"
              controls
              playsInline
              preload="metadata"
              onError={(e) => {
                console.error('Video load error:', e);
                console.error('Video URL:', post.media_url);
              }}
            >
              Your browser does not support video playback.
            </video>
          </div>
        )}
        {post.content_type === 'voice' && (
          <div className="w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
            <div className="text-center">
              <Mic className="w-16 h-16 text-purple-600 mx-auto mb-4" />
              <p className="text-blue-900">Voice Note</p>
              {post.media_url && (
                <audio src={post.media_url} controls className="mt-4" />
              )}
            </div>
          </div>
        )}
        {post.content_type === 'text' && (
          <div className="w-full min-h-[200px] bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex items-center justify-center">
            <p className="text-xl text-center font-medium text-blue-900">{post.caption}</p>
          </div>
        )}

        <AnimatePresence>
          {showHeart && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 45 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl animate-pulse-glow" />
              {/* Sparkle effects */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0], rotate: 360 }}
                transition={{ duration: 1 }}
                className="absolute top-10 left-10 w-6 h-6 text-yellow-400"
              >
                ✨
              </motion.div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1, 0], rotate: -360 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="absolute bottom-10 right-10 w-6 h-6 text-yellow-400"
              >
                ✨
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button onClick={handleLike} className="hover:opacity-70 transition-all hover-scale tap-feedback">
              <Heart className={cn(
                "w-7 h-7 transition-all animate-grow",
                isLiked ? "text-red-500 fill-red-500 animate-bounce-in" : "text-gray-700"
              )} />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <MessageCircle className="w-7 h-7 text-gray-700" />
            </button>
            <button className="hover:opacity-70 transition-opacity">
              <Send className="w-7 h-7 text-gray-700" />
            </button>
            {canMonetize ? (
              <button 
                onClick={() => setShowTipModal(true)}
                className="hover:opacity-70 transition-all ml-2 hover-scale tap-feedback relative"
              >
                <DollarSign className="w-7 h-7 text-yellow-500 animate-coin-flip" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
              </button>
            ) : (
              <button className="hover:opacity-70 transition-opacity ml-2 opacity-50">
                <Lock className="w-6 h-6 text-zinc-500" />
              </button>
            )}
          </div>
          <button className="hover:opacity-70 transition-opacity">
            <Bookmark className="w-7 h-7 text-gray-700" />
          </button>
        </div>

        <p className="font-semibold text-sm mb-2 text-blue-900">{likesCount} likes</p>
        
        {post.content_type !== 'text' && post.caption && (
          <p className="text-sm text-blue-800">
            <span className="font-semibold mr-2 text-blue-900">{post.author_name}</span>
            {post.caption}
          </p>
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post.tags.map((tag, i) => (
              <span key={i} className="text-purple-600 text-sm font-medium">#{tag}</span>
            ))}
          </div>
        )}

        {post.tips_received > 0 && (
          <p className="text-xs text-yellow-500 mt-2">
            💰 ${post.tips_received} earned from this post
          </p>
        )}
        </div>

        {/* Monetization Eligibility Notice */}
        {!canMonetize && (
        <MonetizationEligibility userTier={userTier} feature="tips" />
        )}

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
              className="bg-white rounded-2xl p-6 w-full max-w-sm border border-gray-200 shadow-lg"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold mb-4 text-center text-blue-900">Boost Value</h3>
              <p className="text-blue-700 text-sm text-center mb-6">
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
                        ? "gradient-bg-primary text-white shadow-glow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    ${amount}
                  </button>
                ))}
              </div>

              <Button 
                onClick={handleTip}
                className="w-full gradient-bg-primary text-white hover:opacity-90 shadow-glow"
              >
                Send ${tipAmount} Tip
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={showImageLightbox}
        imageUrl={post.media_url}
        caption={post.caption}
        onClose={() => setShowImageLightbox(false)}
      />
    </div>
  );
}