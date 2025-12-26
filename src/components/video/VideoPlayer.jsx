import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VideoPlayer({ src, className = '', aspectRatio = 'square' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
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
    const handleError = () => setHasError(true);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('error', handleError);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('error', handleError);
    };
  }, [src]);

  const handleClick = (e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video || hasError) return;

    if (video.paused) {
      video.play().catch(err => {
        console.error('Play error:', err);
        setHasError(true);
      });
    } else {
      video.pause();
    }
  };

  if (hasError) {
    return (
      <div className={`${className} ${aspectClasses[aspectRatio]} bg-gray-900 flex items-center justify-center`}>
        <div className="text-center p-4">
          <p className="text-white text-sm">Video unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${className} ${aspectClasses[aspectRatio]} relative bg-black cursor-pointer overflow-hidden`}
      onClick={handleClick}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        playsInline
        preload="metadata"
      />
      
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
          <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl">
            <Play className="w-10 h-10 text-purple-600 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {isPlaying && (
        <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
          <Pause className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}