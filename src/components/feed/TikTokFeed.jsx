import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from './PostCard';
import { ChevronDown } from 'lucide-react';

export default function TikTokFeed({ posts, currentUser, onLike, onTip }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
        const scrollPosition = container.scrollTop;
        const windowHeight = window.innerHeight;
        const newIndex = Math.round(scrollPosition / windowHeight);
        
        if (newIndex !== currentIndex && newIndex >= 0 && newIndex < posts.length) {
          setCurrentIndex(newIndex);
          container.scrollTo({
            top: newIndex * windowHeight,
            behavior: 'smooth'
          });
        }
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [currentIndex, posts.length]);

  const scrollToNext = () => {
    if (currentIndex < posts.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      containerRef.current?.scrollTo({
        top: newIndex * window.innerHeight,
        behavior: 'smooth'
      });
    }
  };

  if (!posts || posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-6xl mb-4">📱</div>
          <h3 className="text-xl font-bold mb-2">No Posts Yet</h3>
          <p className="text-zinc-500">Start creating content to see posts here!</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <style>{`
        .h-screen::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="h-screen snap-start flex items-center justify-center relative"
        >
          <div className="max-w-lg w-full px-4">
            <PostCard
              post={post}
              currentUser={currentUser}
              onLike={onLike}
              onTip={onTip}
            />
          </div>

          {/* Scroll Indicator */}
          {index === currentIndex && index < posts.length - 1 && !isScrolling && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              onClick={scrollToNext}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white transition-colors"
            >
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                <ChevronDown className="w-8 h-8" />
              </motion.div>
            </motion.button>
          )}

          {/* Progress Indicator */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1">
            {posts.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-8 bg-white'
                    : i < currentIndex
                    ? 'w-4 bg-white/50'
                    : 'w-4 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}