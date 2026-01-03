import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, DollarSign, Mic, Lock, Trash2, Link2, Flag, EyeOff, Share2 } from 'lucide-react';
import MonetizationEligibility from '../monetization/MonetizationEligibility';
import ReportButton from '../moderation/ReportButton';
import CommentsModal from './CommentsModal';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import ViralIndicator from '../discovery/ViralIndicator';
import ImageLightbox from '../ui/ImageLightbox';
import VideoPlayer from '../video/VideoPlayer';
import ShoppablePostTag from '../commerce/ShoppablePostTag';

export default function PostCard({ post, currentUser, onLike, onTip }) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [tipAmount, setTipAmount] = useState(5);
  const [showHeart, setShowHeart] = useState(false);
  const [userSubscription, setUserSubscription] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const checkLike = async () => {
      if (!currentUser) return;
      try {
        const likes = await base44.entities.Like.filter({
          post_id: post.id,
          user_email: currentUser.email
        });
        
        if (mounted) {
          setIsLiked(likes.length > 0);
        }

        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
          status: 'active'
        });
        
        if (mounted) {
          setUserSubscription(subs[0] || null);
        }
      } catch (e) {
        console.error('Error checking like status:', e);
      }
    };
    
    checkLike();
    
    return () => {
      mounted = false;
    };
  }, [post.id, currentUser?.email]);

  const handleLike = async () => {
    if (!currentUser) {
      alert('Please login to like posts');
      return;
    }
    
    // Optimistic update
    const wasLiked = isLiked;
    setIsLiked(!isLiked);
    setLikesCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      if (wasLiked) {
        const likes = await base44.entities.Like.filter({
          post_id: post.id,
          user_email: currentUser.email
        });
        if (likes.length > 0) {
          await base44.entities.Like.delete(likes[0].id);
        }
      } else {
        await base44.entities.Like.create({
          post_id: post.id,
          user_email: currentUser.email
        });
        // Award points for liking
        base44.functions.invoke('awardPoints', {
          activity_type: 'post_liked',
          related_id: post.id
        }).catch(err => console.log('Points award failed:', err));
      }
      onLike && onLike(post.id, !wasLiked);
    } catch (error) {
      console.error('Failed to update like:', error);
      // Revert optimistic update on failure
      setIsLiked(wasLiked);
      setLikesCount(prev => wasLiked ? prev + 1 : Math.max(0, prev - 1));
      alert('Failed to update like. Please try again.');
    }
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
    if (!currentUser) {
      alert('Please login to send tips');
      return;
    }

    const userTier = userSubscription?.tier || 'free';
    const trialEndDate = new Date('2026-01-31');
    const isInTrialPeriod = new Date() <= trialEndDate;
    const isAdmin = currentUser?.email === 'robertdavisiv87@gmail.com';
    
    if (!isAdmin && !isInTrialPeriod && userTier === 'free') {
      alert('Upgrade to Pro or Elite to send tips');
      return;
    }

    try {
      const response = await base44.functions.invoke('processTip', {
        to_email: post.created_by,
        amount: tipAmount,
        post_id: post.id
      });
      
      if (response.data.success) {
        setShowTipModal(false);
        alert(`✅ Sent $${tipAmount} tip to ${post.author_name}!`);
        onTip && onTip(post.id, tipAmount);
      } else {
        throw new Error(response.data.error || 'Tip processing failed');
      }
    } catch (error) {
      console.error('Failed to send tip:', error);
      alert('Failed to send tip. Please try again.');
    }
  };

  const userTier = userSubscription?.tier || 'free';
  // Trial period ends 01/31/2026 - unlock all features during trial
  const trialEndDate = new Date('2026-01-31');
  const isInTrialPeriod = new Date() <= trialEndDate;
  const isAdmin = currentUser?.email === 'robertdavisiv87@gmail.com';
  const canMonetize = isAdmin || isInTrialPeriod || userTier === 'pro' || userTier === 'elite';
  const isOwnPost = currentUser && post.created_by === currentUser.email;

  const handleDeletePost = async () => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      await base44.entities.Post.delete(post.id);
      alert('✅ Post deleted successfully!');
      // Use callback for better performance than reload
      if (onLike) {
        onLike(); // Trigger parent refresh
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  const handleCopyLink = () => {
    const postUrl = `${window.location.origin}?post=${post.id}`;
    navigator.clipboard.writeText(postUrl);
    alert('Link copied to clipboard!');
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}?post=${post.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out this post by ${post.author_name}`,
          text: post.caption || 'Amazing content on Encircle Net!',
          url: postUrl
        });
      } catch (err) {
        handleCopyLink(); // Fallback to copy
      }
    } else {
      handleCopyLink();
    }
  };

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-gradient-to-b from-purple-50 to-pink-50 border-purple-200">
            {isOwnPost ? (
              <>
                <DropdownMenuItem onClick={handleDeletePost} disabled={isDeleting} className="text-red-600 focus:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share Post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <Link2 className="w-4 h-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div 
        className="relative"
        onDoubleClick={(e) => {
          if (post.content_type !== 'video') {
            handleDoubleClick();
          }
        }}
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

        {/* Shoppable Post Tag */}
        {post.linked_products && post.linked_products.length > 0 && (
          <ShoppablePostTag postId={post.id} products={post.linked_products} />
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
            loading="lazy"
            decoding="async"
            fetchpriority="high"
            style={{
              imageRendering: 'high-quality',
              maxWidth: '3840px',
              maxHeight: '2160px'
            }}
          />
        )}
        {post.content_type === 'video' && post.media_url && (
          <div className="w-full" style={{ pointerEvents: 'auto' }}>
            <VideoPlayer src={post.media_url} className="w-full" aspectRatio="square" />
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
            <button 
              onClick={() => setShowCommentsModal(true)}
              className="hover:opacity-70 transition-opacity"
            >
              <MessageCircle className="w-7 h-7 text-gray-700" />
            </button>
            <button 
              onClick={handleShare}
              className="hover:opacity-70 transition-opacity"
            >
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
        
        {post.comments_count > 0 && (
          <button 
            onClick={() => setShowCommentsModal(true)}
            className="text-sm text-gray-600 hover:text-gray-800 mb-2 block"
          >
            View all {post.comments_count} comments
          </button>
        )}
        
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

        {!isOwnPost && currentUser && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <ReportButton 
              contentType="post"
              contentId={post.id}
              reportedUserEmail={post.created_by}
              currentUser={currentUser}
            />
          </div>
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

      {/* Comments Modal */}
      <CommentsModal
        post={post}
        isOpen={showCommentsModal}
        onClose={() => setShowCommentsModal(false)}
        currentUser={currentUser}
      />
    </div>
  );
}