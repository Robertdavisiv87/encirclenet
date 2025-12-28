import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

export default function VideoPlayer({ src, className = '', aspectRatio = 'square' }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    auto: ''
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize muted for mobile autoplay policy
    video.muted = true;
    video.playsInline = true;
    video.preload = 'metadata'; // Better performance
    
    console.log('🎥 Video initialized:', {
      src,
      readyState: video.readyState,
      networkState: video.networkState
    });

    const handlePlay = () => {
      console.log('✅ Video PLAYING');
      setIsPlaying(true);
    };
    const handlePause = () => {
      console.log('⏸️ Video PAUSED');
      setIsPlaying(false);
    };
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('❌ Video ERROR:', e);
      setHasError(true);
    };
    const handleLoadedData = () => {
      console.log('📦 Video loaded and ready');
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

  const handleVideoClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const video = videoRef.current;
    
    console.log('🎯 VIDEO CLICKED!', {
      video: !!video,
      hasError,
      paused: video?.paused,
      readyState: video?.readyState,
      src: video?.src
    });

    if (!video || hasError) {
      console.error('❌ Cannot play: video not ready or has error');
      return;
    }

    try {
      if (video.paused) {
        console.log('▶️ ATTEMPTING PLAY...');
        
        // Check if video is loaded enough
        if (video.readyState < 2) {
          console.log('⏳ Waiting for video to load...');
          await new Promise((resolve) => {
            video.addEventListener('loadeddata', resolve, { once: true });
            setTimeout(resolve, 5000); // Timeout after 5s
          });
        }
        
        // Unmute on first interaction
        if (isMuted) {
          video.muted = false;
          setIsMuted(false);
          console.log('🔊 Unmuted video');
        }
        
        await video.play();
        console.log('✅ VIDEO NOW PLAYING!');
        setIsPlaying(true);
      } else {
        console.log('⏸️ PAUSING VIDEO...');
        video.pause();
        setIsPlaying(false);
      }
    } catch (err) {
      console.error('❌ Playback error:', err.name, err.message);
      
      // Retry with muted playback
      try {
        console.log('🔄 Retrying with muted...');
        video.muted = true;
        await video.play();
        console.log('✅ Playing muted');
        setIsPlaying(true);
        setIsMuted(true);
      } catch (retryErr) {
        console.error('❌ Retry failed:', retryErr);
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
      {/* VIDEO ELEMENT - TOPMOST, FULLY INTERACTIVE */}
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain cursor-pointer"
        style={{ pointerEvents: 'auto', zIndex: 1 }}
        playsInline
        preload="auto"
        muted
        onClick={handleVideoClick}
        onTouchStart={handleVideoClick}
        crossOrigin="anonymous"
        controlsList="nodownload"
        disablePictureInPicture={false}
      >
        <source src={src} type="video/mp4" />
        <source src={src} type="video/webm" />
        Your browser does not support the video tag.
      </video>
      
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
    </div>
  );
}