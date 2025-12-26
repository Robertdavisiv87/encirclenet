import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, Crown, DollarSign, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MonetizationEligibility({ userTier, feature }) {
  if (userTier === 'pro' || userTier === 'elite') {
    return null; // User has access, show nothing
  }

  const features = {
    tips: {
      icon: DollarSign,
      title: 'Unlock Tips & Boosts',
      description: 'Receive CircleValue tips from your followers and supporters.',
      benefit: 'Earn 70-80% of all tips received',
    },
    affiliate: {
      icon: TrendingUp,
      title: 'Unlock Affiliate Revenue',
      description: 'Share product links and earn commissions on every sale.',
      benefit: 'Keep 50-70% of affiliate earnings',
    },
    sponsored: {
      icon: Crown,
      title: 'Unlock Sponsored Posts',
      description: 'Partner with brands and create sponsored content.',
      benefit: 'Earn 60-70% from brand deals',
    },
  };

  const config = features[feature] || features.tips;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-4"
    >
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 overflow-hidden realistic-shadow">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center shadow-glow flex-shrink-0">
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-lg text-blue-900">{config.title}</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">{config.description}</p>
              <div className="bg-green-50 rounded-lg p-3 mb-4 border border-green-200">
                <p className="text-xs text-green-700 font-semibold">✓ {config.benefit}</p>
              </div>
              <Link to={createPageUrl('Subscription')}>
                <Button className="w-full gradient-bg-primary text-white shadow-glow hover-lift">
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}