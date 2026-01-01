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
              <h3 className="font-bold mb-2 text-lg">💡 Welcome to Encircle Net!</h3>
              <p className="mb-2 font-semibold">Your world. Your voice. Your value.</p>
              
              <p className="mb-2">✨ Earn passive income in any niche online.</p>
              
              <p className="mb-2">💰 <strong>Referral Sign-Ups:</strong> Earn $5 per sign-up (user & platform commission).</p>
              
              <p className="mb-2">🎉 <strong>45 Days Free Service</strong> for all paid accounts.</p>
              
              <p className="mb-2 text-white/95 text-xs bg-white/10 rounded-lg p-2 border border-white/20">
                📅 <strong>Billing Reminder:</strong> After your 45-day free period, paid service accounts are actively billed on the 5th of every month.
              </p>
              
              <p className="mb-2">📈 Grow as a creator, freelancer, influencer, or niche business.</p>
              
              <p className="mb-2 text-white/90 text-xs">Success depends on your effort, creativity, consistency & ethics.</p>
              
              <p className="mb-2 text-white/90 text-xs">🛡️ We follow Ethics & Licensure, Governance, End User Rights, and #EthicalSource principles.</p>
              
              <p className="mb-2 text-white/90 text-xs">⚙️ App runs 100% smoothly with auto maintenance for optimal performance.</p>
              
              <p className="text-white/90 text-xs italic">No guaranteed income – realistic, ethical, and rewarding opportunities only.</p>
              
              <p className="mt-3 font-bold">Let's get started – create, engage, and grow! 🚀</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}