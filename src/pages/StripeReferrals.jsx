import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import StripeReferralDashboard from '../components/referrals/StripeReferralDashboard';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

export default function StripeReferrals() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = '/';
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Stripe Referrals - Earn Rewards"
        description="Share your referral code and earn rewards via Stripe. No monthly fees, automatic credits."
      />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold gradient-text mb-2">Stripe Referral Program</h1>
        <p className="text-gray-600">
          Share your code, earn rewards automatically via Stripe • Zero monthly fees • Secure tracking
        </p>
      </motion.div>

      <StripeReferralDashboard />
    </div>
  );
}