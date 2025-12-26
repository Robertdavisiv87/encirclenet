import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Video, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function GrowAndEarnPrompt({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleAction = (page) => {
    onClose();
    navigate(createPageUrl(page));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-white via-purple-50 to-pink-50 rounded-3xl shadow-2xl max-w-lg w-full border-2 border-purple-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md z-10"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>

            {/* Header with gradient background */}
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-8 text-white overflow-hidden">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full"
              />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative z-10"
              >
                <Sparkles className="w-12 h-12 mb-4 mx-auto" />
                <h2 className="text-3xl font-bold text-center mb-2">
                  Unlock Your Earnings Potential
                </h2>
                <p className="text-center text-purple-100 text-sm">
                  & Share the Fun!
                </p>
              </motion.div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              <p className="text-blue-900 text-center font-medium">
                Welcome to Encircle Net! 🚀 Did you know you can earn money while building your audience? With Encircle Net, every action creates opportunities for growth:
              </p>

              {/* Features */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex gap-4 p-4 bg-white border-2 border-blue-200 rounded-xl shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Invite Friends & Contacts</h3>
                    <p className="text-sm text-gray-600">
                      Share Encircle Net with friends. When they join, you both get rewarded!
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex gap-4 p-4 bg-white border-2 border-purple-200 rounded-xl shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Create High-Quality Content</h3>
                    <p className="text-sm text-gray-600">
                      Post videos, photos, or stories and earn from tips, subscriptions, affiliate sales, and more.
                    </p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex gap-4 p-4 bg-white border-2 border-green-200 rounded-xl shadow-md"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 mb-1">Engage & Share</h3>
                    <p className="text-sm text-gray-600">
                      Every click, like, or share helps your content travel further and increases your revenue streams.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleAction('Referrals')}
                  className="w-full gradient-bg-primary text-white shadow-glow hover:opacity-90 h-12"
                >
                  🎯 Invite Friends & Start Earning
                </Button>
                <Button
                  onClick={() => handleAction('Create')}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md hover:opacity-90 h-12"
                >
                  🎥 Create & Post Content
                </Button>
                <Button
                  onClick={() => handleAction('CreatorEconomy')}
                  variant="outline"
                  className="w-full border-2 border-purple-300 text-blue-900 hover:bg-purple-50 h-12"
                >
                  📊 View Your Dashboard & Growth
                </Button>
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-xl p-4">
                <p className="text-sm text-center text-blue-900 font-medium">
                  Every referral, share, and post is a step toward building your network, your audience, and your income — all while having fun! 🌟
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}