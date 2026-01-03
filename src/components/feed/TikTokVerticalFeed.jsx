import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, DollarSign, MoreVertical, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import VideoPlayer from '../video/VideoPlayer';

export default function TikTokVerticalFeed({ posts, currentUser, onLike, onTip }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [likedPosts, setLikedPosts] = useState({});

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;
      const windowHeight = window.innerHeight;
      const newIndex = Math.round(scrollPosition / windowHeight);
      
      if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
        setCurrentIndex(newIndex);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex, posts.length]);

  const handleLike = async (postId, isLiked) => {
    if (!currentUser) {
      alert('Please login to like posts');
      return;
    }

    setLikedPosts(prev => ({ ...prev, [postId]: !isLiked }));

    try {
      if (isLiked) {
        const likes = await base44.entities.Like.filter({ post_id: postId, user_email: currentUser.email });
        if (likes.length > 0) await base44.entities.Like.delete(likes[0].id);
      } else {
        await base44.entities.Like.create({ post_id: postId, user_email: currentUser.email });
      }
      onLike && onLike();
    } catch (error) {
      setLikedPosts(prev => ({ ...prev, [postId]: isLiked }));
      console.error('Like failed:', error);
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-bold text-[#4B6CB7]">No Content Yet</h3>
          <p className="text-gray-600">Be the first to share!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        div::-webkit-scrollbar { display: none; }
      `}</style>
      
      {posts.map((post, index) => {
        const isLiked = likedPosts[post.id] ?? false;
        
        return (
          <div
            key={post.id}
            className="h-screen snap-start relative flex items-center justify-center bg-gradient-to-b from-[#F4F6FA] to-white"
          >
            {/* Content Area */}
            <div className="relative w-full h-full flex items-center justify-center">
              {post.content_type === 'video' && post.media_url ? (
                <div className="w-full h-full">
                  <VideoPlayer 
                    src={post.media_url} 
                    className="w-full h-full object-cover"
                    autoPlay={index === currentIndex}
                  />
                </div>
              ) : post.content_type === 'photo' && post.media_url ? (
                <img 
                  src={post.media_url} 
                  alt={post.caption || 'Post'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-8 bg-gradient-to-br from-blue-100 to-purple-100">
                  <p className="text-2xl font-medium text-center text-[#182848]">{post.caption}</p>
                </div>
              )}

              {/* Gradient Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
            </div>

            {/* Right Action Bar */}
            <div className="absolute right-4 bottom-24 flex flex-col gap-6 items-center z-10">
              {/* Profile */}
              <button 
                onClick={() => window.location.href = `/viewprofile?email=${post.created_by}`}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B6CB7] to-[#182848] flex items-center justify-center shadow-lg">
                  {post.author_avatar ? (
                    <img src={post.author_avatar} alt={post.author_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>
              </button>

              {/* Like */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => handleLike(post.id, isLiked)}
                className="flex flex-col items-center gap-1"
              >
                <Heart 
                  className={`w-8 h-8 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'} drop-shadow-lg`}
                />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {post.likes_count || 0}
                </span>
              </motion.button>

              {/* Comment */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => window.location.href = `/messages?user=${post.created_by}`}
                className="flex flex-col items-center gap-1"
              >
                <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
                <span className="text-white text-xs font-semibold drop-shadow-lg">
                  {post.comments_count || 0}
                </span>
              </motion.button>

              {/* Share */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => {
                  const postUrl = `${window.location.origin}?post=${post.id}`;
                  navigator.clipboard.writeText(postUrl);
                  alert('Link copied to clipboard!');
                }}
                className="flex flex-col items-center gap-1"
              >
                <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
              </motion.button>

              {/* Tip */}
              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => onTip && onTip(post.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-8 h-8 rounded-full bg-[#F5A623] flex items-center justify-center shadow-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
              </motion.button>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-20 text-white z-10">
              <div className="flex items-center gap-2 mb-2">
                <p className="font-bold text-sm drop-shadow-lg">@{post.author_name}</p>
              </div>
              {post.caption && post.content_type !== 'text' && (
                <p className="text-sm leading-relaxed drop-shadow-lg line-clamp-2">
                  {post.caption}
                </p>
              )}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {post.tags.slice(0, 3).map((tag, i) => (
                    <span key={i} className="text-xs font-medium text-[#F5A623]">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Dots */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {posts.slice(Math.max(0, index - 2), Math.min(posts.length, index + 3)).map((_, i) => {
                const actualIndex = Math.max(0, index - 2) + i;
                return (
                  <div
                    key={actualIndex}
                    className={`h-1 rounded-full transition-all ${
                      actualIndex === index
                        ? 'w-6 bg-white'
                        : 'w-1.5 bg-white/40'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}