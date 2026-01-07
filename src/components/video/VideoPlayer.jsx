import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Play, Pause } from 'lucide-react';

const VideoPlayer = forwardRef(({ src, className = '', aspectRatio = 'square', isVisible = false, onPlaybackChange }, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  // Expose pause method to parent
  useImperativeHandle(ref, () => ({
    pause: () => {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    },
    play: async () => {
      if (videoRef.current && videoRef.current.paused) {
        try {
          await videoRef.current.play();
        } catch (err) {
          console.error('Play error:', err);
        }
      }
    }
  }));

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize for mobile - NO autoplay
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.autoplay = false;
    
    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlaybackChange) onPlaybackChange(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      if (onPlaybackChange) onPlaybackChange(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlaybackChange) onPlaybackChange(false);
    };
    
    const handleError = (e) => {
      console.error('Video error:', e);
      setHasError(true);
    };

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
  }, [src, onPlaybackChange]);

  // Pause when not visible
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isVisible && !video.paused) {
      video.pause();
    }
  }, [isVisible]);

  const handleVideoClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;

    if (!video || hasError) return;

    try {
      if (video.paused) {
        // Wait for video to be ready
        if (video.readyState < 2) {
          await new Promise((resolve) => {
            video.addEventListener('loadeddata', resolve, { once: true });
            setTimeout(resolve, 3000);
          });
        }
        
        // Unmute on first play
        if (isMuted) {
          video.muted = false;
          setIsMuted(false);
        }
        
        await video.play();
      } else {
        video.pause();
      }
    } catch (err) {
      console.error('Playback error:', err);
      try {
        video.muted = true;
        setIsMuted(true);
        await video.play();
      } catch (retryErr) {
        setHasError(true);
      }
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
    <div className={`${className} ${aspectClasses[aspectRatio]} relative bg-black overflow-hidden`}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        style={{ 
          zIndex: 1
        }}
        playsInline
        preload="metadata"
        muted={isMuted}
        disablePictureInPicture={false}
        loop={false}
      />
      
      {/* Click overlay to control playback */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={handleVideoClick}
        onTouchStart={handleVideoClick}
      />
      
      {/* PLAY BUTTON OVERLAY - NON-INTERACTIVE */}
      {!isPlaying && (
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          <div className="w-20 h-20 rounded-full bg-white/95 flex items-center justify-center shadow-2xl">
            <Play className="w-10 h-10 text-purple-600 ml-1" fill="currentColor" />
          </div>
        </div>
      )}
      
      {/* PAUSE INDICATOR - NON-INTERACTIVE */}
      {isPlaying && (
        <div 
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          <Pause className="w-5 h-5 text-white" />
        </div>
      )}
      
      {/* MUTE INDICATOR */}
      {isMuted && isPlaying && (
        <div 
          className="absolute bottom-4 right-4 text-xs bg-black/70 text-white px-2 py-1 rounded"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          Tap to unmute
        </div>
      )}
      
      {/* QUALITY INDICATOR */}
      {isPlaying && (
        <div 
          className="absolute top-4 left-4 text-xs bg-black/70 text-white px-2 py-1 rounded font-bold"
          style={{ pointerEvents: 'none', zIndex: 2 }}
        >
          4K UHD
        </div>
      )}
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;