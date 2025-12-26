import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageLightbox({ isOpen, imageUrl, onClose, caption }) {
  const [zoom, setZoom] = React.useState(1);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'image.jpg';
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
          onClick={onClose}
        >
          {/* Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(Math.min(zoom + 0.5, 3));
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setZoom(Math.max(zoom - 0.5, 0.5));
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <Download className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Image */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-[90vw] max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={imageUrl}
              alt={caption || 'Image'}
              className="w-auto h-auto max-w-full max-h-[90vh] object-contain"
              style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
            />
          </motion.div>

          {/* Caption */}
          {caption && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-6 py-3 rounded-full max-w-md text-center">
              <p className="text-sm">{caption}</p>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}