import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WelcomeBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('welcomeBannerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('welcomeBannerDismissed', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-[#4B6CB7] to-[#182848] text-white p-4 mb-4 rounded-2xl shadow-lg relative border-2 border-white/20"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 text-sm">
              <h3 className="font-bold mb-2 text-lg">🚀 Start Making Money in 24 Hours</h3>
              <p className="text-white/90 mb-4">
                Watch real people succeed, start earning money today, and explore opportunities near you. Multiple income streams, local services, and creative content — all in one place.
              </p>
              
              <div className="bg-white/10 rounded-lg p-3 mb-3 border border-white/20">
                <p className="font-semibold mb-2">What You Can Do:</p>
                <ul className="space-y-1 text-xs">
                  <li>💰 <strong>Passive Income:</strong> Referrals, affiliate programs, network earnings</li>
                  <li>🎬 <strong>Creator Hub:</strong> Monetize content, tips, exclusive posts</li>
                  <li>🛠️ <strong>Local Services:</strong> Hire or offer services nearby with AI matching</li>
                  <li>📚 <strong>Learn & Replicate:</strong> Watch real success stories in your niche</li>
                  <li>🌐 <strong>Free to Start:</strong> No subscription, just opportunities</li>
                </ul>
              </div>
              
              <p className="text-white/90 text-xs italic">
                No scams, no heavy security, just freedom to express yourself and create real value in the real world.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}