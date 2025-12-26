import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit, Globe, Video, TrendingUp, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../../utils';

export default function ProfileGrowthPrompt({ isOpen, onClose }) {
  const features = [
    {
      icon: Edit,
      title: "Create & Edit Your Profile",
      description: "Add a bio, profile photo, and social links. Keep it updated to reflect your personality and style. Even free accounts enjoy zero ads and full profile customization.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Globe,
      title: "Link Contacts & Social Accounts",
      description: "Invite friends from your phone or connected social media accounts. Every referral helps you and your friends earn automatically!",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Video,
      title: "Create High-Quality Content",
      description: "Post videos, photos, or stories and start earning from tips, subscriptions, affiliate sales, or brand deals. AI tools are here to help your content look professional and reach further.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: TrendingUp,
      title: "Track Your Earnings & Growth",
      description: "Your dashboard shows revenue from all streams, clicks, referrals, and conversions in real time — no guesswork, only growth.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Trophy,
      title: "Daily Challenges & Achievements",
      description: "Complete challenges, earn rewards, and level up your profile. Every action feeds your growth loop automatically.",
      color: "from-red-500 to-pink-500"
    }
  ];

  const ctaButtons = [
    { label: "✏️ Edit My Profile", page: "Profile", gradient: "from-purple-500 to-pink-500" },
    { label: "🌐 Link Accounts / Invite Friends", page: "Referrals", gradient: "from-blue-500 to-cyan-500" },
    { label: "🎥 Create Content / Post", page: "Create", gradient: "from-green-500 to-emerald-500" },
    { label: "📊 View Dashboard & Earnings", page: "Analytics", gradient: "from-yellow-500 to-orange-500" },
    { label: "🏆 Daily Challenges & Rewards", page: "Gamification", gradient: "from-red-500 to-pink-500" }
  ];

  const handleNavigate = (page) => {
    window.location.href = createPageUrl(page);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-gradient-to-b from-purple-50 via-white to-pink-50 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-300 realistic-shadow custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-100 to-pink-100 p-6 border-b border-purple-200 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold gradient-text">Make Your Profile Work for You</h2>
                  <p className="text-sm text-blue-900 font-medium">Your Profile, Your Growth, Your Earnings</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-600 hover:text-gray-900"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <div className="bg-white/80 backdrop-blur-sm border border-purple-200 rounded-2xl p-6">
                <p className="text-blue-900 leading-relaxed">
                  Welcome to Encircle Net! Your profile is more than just a page — it's your personal brand, your audience, and your earning potential. Here's how to maximize it:
                </p>
              </div>

              {/* Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover-lift realistic-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 shadow-glow`}>
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900 mb-2">{feature.title}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                {ctaButtons.map((button, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                  >
                    <Button
                      onClick={() => handleNavigate(button.page)}
                      className={`w-full bg-gradient-to-r ${button.gradient} text-white font-semibold py-6 rounded-xl hover-lift shadow-glow`}
                    >
                      {button.label}
                    </Button>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 text-center">
                <p className="text-blue-900 leading-relaxed font-medium">
                  Every profile update, post, share, and referral fuels your growth automatically. Encircle Net is designed to help you connect, create, and earn ethically while keeping your experience clean, bright, and ad-free for free accounts. Start building your network, content, and income today! 🚀
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}