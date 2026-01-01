import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, DollarSign, Users, Eye, Settings, Lightbulb, TrendingUp, ShoppingBag, Briefcase, Share2, Zap } from 'lucide-react';
import { createPageUrl } from '../utils';
import SEO from '../components/SEO';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Welcome to Encircle Net - Your Platform for Growth & Income"
        description="Creator-first platform to build identity, community, and income without ads or gatekeeping."
      />

      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold gradient-text mb-4">Welcome to Encircle Net</h1>
          <p className="text-xl text-gray-700 mb-4">
            A creator-first platform designed to help you build identity, community, and income — without ads, without pressure, and without gatekeeping.
          </p>
          <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 px-6 py-3 rounded-full border-2 border-purple-300 shadow-soft">
            <p className="text-lg font-bold gradient-text">🎉 45 Days Free Service for All Paid Accounts</p>
          </div>
        </motion.div>

        {/* Your Profile */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-8 mb-6 shadow-soft border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Your Profile</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p>Every user can create and edit a personal bio, profile image, and links at any time.</p>
            <p>Your profile represents your digital identity across the Encircle ecosystem.</p>
            <p className="font-semibold">Profile updates save instantly and reflect across your content, referrals, and monetization tools.</p>
          </div>
        </motion.section>

        {/* Creator Economy */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 mb-6 shadow-soft border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-gold-black flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Creator Economy</h2>
          </div>
          <p className="text-gray-700 mb-4">Encircle Net supports multiple income streams, including:</p>
          <ul className="space-y-2 mb-4">
            {['Tips & donations', 'Subscriptions', 'Affiliate links', 'Referral rewards', 'Creator shops', 'Brand collaborations'].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-600 italic">
            Earnings displayed may include preview, estimated, or live data, clearly labeled for transparency as features roll out.
          </p>
        </motion.section>

        {/* Growth & Referrals */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-8 mb-6 shadow-soft border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Growth & Referrals</h2>
          </div>
          <p className="text-gray-700 mb-4">Encircle Net grows through ethical, user-driven discovery:</p>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-3 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Invite friends directly from your contacts (optional)
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Share your referral link across social platforms
            </li>
            <li className="flex items-center gap-3 text-gray-700">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              Earn rewards for meaningful engagement and quality content
            </li>
          </ul>
          <p className="font-semibold text-blue-900">
            No spam. No forced invites. You control your growth.
          </p>
        </motion.section>

        {/* Design & Experience */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-8 mb-6 shadow-soft border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Design & Experience</h2>
          </div>
          <p className="text-gray-700">
            Encircle Net maintains a clean, high-contrast, professional design across all pages for clarity, accessibility, and ease of use.
          </p>
        </motion.section>

        {/* Passive Income Tips */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-6 shadow-soft border-2 border-yellow-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-glow">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">💡 Fun Ways to Create Passive Income</h2>
          </div>
          <p className="text-gray-700 mb-6 font-medium">
            Discover creative ways to earn while you sleep using Encircle Net's powerful sectors:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Creator Economy */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('CreatorEconomy'))}
              className="bg-white rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-blue-900">Creator Economy</h3>
              </div>
              <p className="text-sm text-gray-700">
                💰 Post once, earn forever! Create viral content and receive tips, subscriptions, and recurring royalties from your top fans.
              </p>
            </motion.div>

            {/* Affiliate Marketing */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Explore'))}
              className="bg-white rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-blue-900">Affiliate Links</h3>
              </div>
              <p className="text-sm text-gray-700">
                🛍️ Share tech products, services & deals. Earn commissions on every sale — even while you're offline!
              </p>
            </motion.div>

            {/* Freelance Services */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Explore'))}
              className="bg-white rounded-xl p-4 border-2 border-green-200 hover:border-green-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <h3 className="font-bold text-blue-900">Creator Services</h3>
              </div>
              <p className="text-sm text-gray-700">
                💼 List your skills once, get hired repeatedly. Build a portfolio that attracts clients on autopilot.
              </p>
            </motion.div>

            {/* Referrals */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('Referrals'))}
              className="bg-white rounded-xl p-4 border-2 border-pink-200 hover:border-pink-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Share2 className="w-5 h-5 text-pink-600" />
                <h3 className="font-bold text-blue-900">Referral Network</h3>
              </div>
              <p className="text-sm text-gray-700">
                🚀 Share your unique link. Earn $5-$50 per referral who joins and stays active — passive income at its best!
              </p>
            </motion.div>

            {/* Brand Campaigns */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('CreatorEconomy'))}
              className="bg-white rounded-xl p-4 border-2 border-orange-200 hover:border-orange-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-blue-900">Brand Partnerships</h3>
              </div>
              <p className="text-sm text-gray-700">
                ⚡ Join PPC campaigns. Get paid per click, lead, or sale — your content works for you 24/7!
              </p>
            </motion.div>

            {/* Premium Circles */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(createPageUrl('MyCircle'))}
              className="bg-white rounded-xl p-4 border-2 border-indigo-200 hover:border-indigo-400 transition-all cursor-pointer hover:shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-blue-900">Premium Circles</h3>
              </div>
              <p className="text-sm text-gray-700">
                👑 Create exclusive communities. Charge monthly subscriptions and earn recurring revenue from your loyal members!
              </p>
            </motion.div>
          </div>

          <div className="mt-6 p-4 bg-white rounded-xl border-2 border-yellow-300">
            <p className="text-center text-gray-700 font-semibold">
              🌟 <span className="gradient-text">Pro Tip:</span> Combine multiple income streams for maximum passive earnings! 
            </p>
          </div>
        </motion.section>

        {/* Your Control */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-8 mb-6 shadow-soft border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-blue-900">Your Control</h2>
          </div>
          <ul className="space-y-2 mb-4">
            {['Edit your profile anytime', 'Manage visibility and settings', 'Choose how and when you monetize'].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-gray-700">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-gray-700 font-semibold">
            Encircle Net is built to scale with you — not extract from you.
          </p>
        </motion.section>

        {/* Platform Ethics & Commitment */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-6 shadow-soft border-2 border-blue-300"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">🛡️ Our Commitment to You</h2>
            <p className="text-gray-700 font-medium">Built on Ethics, Performance, Transparency & Empowerment</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">✅ What We Guarantee</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Income opportunities through platform tools</li>
                <li>• 100% optimal performance during normal use</li>
                <li>• Automatic maintenance & optimization</li>
                <li>• User ownership of content & services</li>
                <li>• Ethical, sustainable growth systems</li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl p-4 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2">❌ What We Don't Promise</h3>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>• Guaranteed earnings or results</li>
                <li>• Get-rich-quick schemes</li>
                <li>• False or misleading claims</li>
                <li>• Unrealistic income expectations</li>
                <li>• Success without effort</li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border-2 border-indigo-300">
            <p className="text-center text-gray-700 font-semibold">
              Success on Encircle Net depends on: <span className="gradient-text">User Effort • Creativity • Consistency • Ethical Participation</span>
            </p>
          </div>
        </motion.section>

        {/* Closing */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center mt-12 mb-8"
        >
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border-2 border-purple-300">
            <h3 className="text-3xl font-bold gradient-text mb-2">Welcome to Your Circle</h3>
            <p className="text-gray-700 text-lg mb-3">
              Your journey starts here. Build, grow, and earn on your terms.
            </p>
            <p className="text-sm text-gray-600 italic">
              No deception. No misleading claims. No unrealistic promises.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}