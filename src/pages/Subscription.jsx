import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Crown, Zap, CheckCircle, Check, Sparkles, TrendingUp, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import TierBadge from '../components/monetization/TierBadge';

const tiers = [
  {
    id: 'free',
    name: 'Free',
    icon: CheckCircle,
    price: 0,
    color: 'from-zinc-700 to-zinc-800',
    features: [
      'Standard feed access',
      'Limited posting (5/day)',
      'Basic analytics',
      'Ads displayed',
      '1x participation earnings',
      'Referral tracking'
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    icon: Zap,
    price: 9.99,
    color: 'from-purple-600 to-purple-700',
    popular: true,
    features: [
      'Ad-light experience',
      'Unlimited posting',
      '3x participation earnings',
      'Passive income from engagement',
      'Content royalties',
      '2x referral bonuses',
      'Monetization dashboard'
    ]
  },
  {
    id: 'elite',
    name: 'Elite',
    icon: Crown,
    price: 29.99,
    color: 'from-yellow-500 to-orange-500',
    features: [
      'Zero ads',
      '10x participation earnings',
      'Maximum passive income',
      'Lifetime referral network',
      'Automated revenue streams',
      'Elite badge',
      '10% platform profit share',
      'Priority payouts'
    ]
  }
];

export default function Subscription() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ['my-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0] || null;
    },
    enabled: !!user?.email
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tier) => {
      const tierData = tiers.find(t => t.id === tier);
      // Add 1 month free: next billing is 60 days from now (30 days + 30 days free)
      const freeTrial = 60 * 24 * 60 * 60 * 1000;
      return base44.entities.Subscription.create({
        user_email: user.email,
        tier: tier,
        status: 'active',
        price: tierData.price,
        billing_cycle: 'monthly',
        next_billing_date: new Date(Date.now() + freeTrial).toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-subscription']);
      alert('🎉 Subscription activated! You get 1 month FREE!');
    }
  });

  const currentTier = subscription?.tier || 'free';

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 gradient-text">Build Your Passive Income</h1>
        <p className="text-zinc-300 text-lg mb-2">
          Get paid automatically for your participation & engagement
        </p>
        <p className="text-zinc-400">
          Higher tiers = Higher % from every like, comment, share & post you make
        </p>
      </div>

      {/* Current Plan */}
      {subscription && (
        <Card className="bg-zinc-900 border-zinc-800 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">{subscription.tier.toUpperCase()}</p>
                    <TierBadge tier={subscription.tier} />
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">${subscription.price}/mo</p>
                <p className="text-xs text-zinc-500">
                  Next billing: {new Date(subscription.next_billing_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {tiers.map((tier, index) => {
          const Icon = tier.icon;
          const isCurrentTier = currentTier === tier.id;
          
          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden border-2 transition-all hover:scale-105",
                isCurrentTier ? "border-purple-500" : "border-zinc-800",
                tier.popular && "ring-2 ring-purple-500"
              )}>
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    POPULAR
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className={cn(
                    "w-16 h-16 mx-auto rounded-full bg-gradient-to-br flex items-center justify-center mb-4",
                    tier.color
                  )}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${tier.price}</span>
                    <span className="text-zinc-500">/month</span>
                  </div>
                  {tier.price > 0 && (
                    <p className="text-xs text-green-400 font-semibold mt-2">
                      🎁 First month FREE
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-zinc-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => subscribeMutation.mutate(tier.id)}
                    disabled={isCurrentTier || subscribeMutation.isPending}
                    className={cn(
                      "w-full",
                      isCurrentTier 
                        ? "bg-zinc-700 cursor-not-allowed"
                        : `bg-gradient-to-r ${tier.color} hover:opacity-90`
                    )}
                  >
                    {isCurrentTier ? 'Current Plan' : 
                     subscribeMutation.isPending ? 'Processing...' :
                     tier.price === 0 ? 'Stay Free' : 'Upgrade Now'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Passive Income Explainer */}
      <Card className="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-2 border-purple-300 mt-12 shadow-glow">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold gradient-text">Automatic Passive Income</h3>
              <p className="text-sm text-gray-700">Earn money while you sleep from your participation</p>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border-2 border-gray-300 realistic-shadow">
              <p className="text-xs text-gray-600 mb-2">Free Tier</p>
              <p className="text-3xl font-bold text-blue-900 mb-1">1x</p>
              <p className="text-xs text-gray-700">$0.01 per engagement</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-2 border-purple-400 shadow-glow">
              <p className="text-xs text-purple-600 mb-2">Pro Tier</p>
              <p className="text-3xl font-bold text-purple-700 mb-1">3x</p>
              <p className="text-xs text-blue-900">$0.05 per engagement + royalties</p>
            </div>
            <div className="bg-white rounded-xl p-5 border-2 border-yellow-500 shadow-glow-gold">
              <p className="text-xs text-yellow-700 mb-2">Elite Tier</p>
              <p className="text-3xl font-bold text-yellow-600 mb-1">10x</p>
              <p className="text-xs text-blue-900">$0.10 per engagement + full passive income</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6 border-2 border-purple-300">
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              How It Works
            </h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Every like, comment, share, and post you make earns you money</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Your content continues earning views & engagement while you sleep</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Referrals earn you 10% of their earnings, forever</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <span>Elite members get 10% profit share from entire platform revenue</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}