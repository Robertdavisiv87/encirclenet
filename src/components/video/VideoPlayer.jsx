import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoPlayer({ src, className = '', aspectRatio = 'square' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('Video playback error:', e);
      console.error('Video URL:', src);
      setHasError(true);
      setIsLoading(false);
    };
    const handleLoadedData = () => {
      setIsLoading(false);
      setHasError(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);
    video.addEventListener('loadeddata', handleLoadedData);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
      video.removeEventListener('loadeddata', handleLoadedData);
    };
  }, [src]);

  const togglePlayPause = async (e) => {
    e?.stopPropagation();
    e?.preventDefault();
    const video = videoRef.current;
    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error('Failed to toggle playback:', err);
      setHasError(true);
    }
  };

  if (hasError) {
    return (
      <div className={`${className} ${aspectClasses[aspectRatio]} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center p-4">
          <div className="w-16 h-16 mx-auto mb-3 bg-red-500/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-white text-sm">Video unavailable</p>
          <p className="text-gray-400 text-xs mt-1">Unable to load video</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${className} ${aspectClasses[aspectRatio]} relative bg-black group overflow-hidden`}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        playsInline
        preload="metadata"
        webkit-playsinline="true"
        onClick={togglePlayPause}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {!isPlaying && !isLoading && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all pointer-events-none"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl pointer-events-none"
          >
            <Play className="w-10 h-10 text-purple-600 ml-1" fill="currentColor" />
          </motion.div>
        </motion.div>
      )}

      {isPlaying && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Pause className="w-5 h-5 text-white" />
        </motion.div>
      )}
    </div>
  );
}