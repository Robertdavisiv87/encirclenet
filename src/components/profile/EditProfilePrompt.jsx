import React from 'react';
import { motion } from 'framer-motion';
import { Edit, User, Image, Link as LinkIcon, Bell, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EditProfilePrompt({ onEditClick }) {
  const features = [
    { icon: User, text: "Add or edit your bio" },
    { icon: Image, text: "Change your profile photo" },
    { icon: LinkIcon, text: "Link social media accounts" },
    { icon: Bell, text: "Update privacy and notification settings" },
    { icon: DollarSign, text: "Set up payment info for tips, subscriptions, and affiliate earnings" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 mb-6 realistic-shadow"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
          <Edit className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-2xl font-bold gradient-text">Update Your Profile Anytime</h2>
      </div>

      <p className="text-blue-900 mb-4 leading-relaxed font-medium">
        Your profile is your personal brand on Encircle Net! Keep it up-to-date to grow your audience, increase engagement, and maximize earnings. You can:
      </p>

      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-3 text-blue-900"
          >
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md">
              <feature.icon className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium">{feature.text}</span>
          </motion.li>
        ))}
      </ul>

      <Button
        onClick={onEditClick}
        className="w-full gradient-bg-primary text-white font-semibold py-6 rounded-xl hover-lift shadow-glow"
      >
        ✅ Edit My Profile
      </Button>
    </motion.div>
  );
}