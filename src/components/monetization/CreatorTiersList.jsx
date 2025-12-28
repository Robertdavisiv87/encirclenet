import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CreatorTiersList({ creatorEmail, creatorName, currentUser }) {
  const queryClient = useQueryClient();

  const { data: tiers = [] } = useQuery({
    queryKey: ['creator-tiers', creatorEmail],
    queryFn: () => base44.entities.CreatorTier.filter({ 
      creator_email: creatorEmail,
      is_active: true 
    }),
    enabled: !!creatorEmail
  });

  const { data: userSubscription } = useQuery({
    queryKey: ['user-creator-subscription', currentUser?.email, creatorEmail],
    queryFn: async () => {
      const subs = await base44.entities.CreatorSubscription.filter({
        creator_email: creatorEmail,
        subscriber_email: currentUser?.email,
        status: 'active'
      });
      return subs[0] || null;
    },
    enabled: !!currentUser?.email && !!creatorEmail
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tierData) => {
      await base44.entities.CreatorSubscription.create({
        creator_email: creatorEmail,
        subscriber_email: currentUser.email,
        tier: tierData.tier_name,
        monthly_amount: tierData.tier_price,
        status: 'active',
        next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        perks: tierData.perks
      });

      // Update tier subscriber count
      await base44.entities.CreatorTier.update(tierData.id, {
        subscriber_count: (tierData.subscriber_count || 0) + 1
      });

      // Create notification
      base44.functions.invoke('createNotification', {
        user_email: creatorEmail,
        type: 'subscription',
        title: 'New Subscriber!',
        message: `${currentUser.full_name || currentUser.email} subscribed to your ${tierData.tier_name} tier`,
        from_user: currentUser.email,
        from_user_name: currentUser.full_name
      }).catch(err => console.log('Notification failed:', err));
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user-creator-subscription']);
      queryClient.invalidateQueries(['creator-tiers']);
      alert('✅ Subscription successful!');
    }
  });

  const handleSubscribe = (tier) => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }

    if (userSubscription) {
      alert('You are already subscribed to this creator');
      return;
    }

    const confirmed = confirm(
      `Subscribe to ${creatorName}'s ${tier.tier_name} tier for $${tier.tier_price}/month?`
    );
    
    if (confirmed) {
      subscribeMutation.mutate(tier);
    }
  };

  if (tiers.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-purple-600" />
          Subscription Tiers
        </CardTitle>
        <p className="text-sm text-gray-600">Support {creatorName} and unlock exclusive perks</p>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-lg"
            >
              <div className="text-center mb-4">
                <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="text-xl font-bold text-blue-900">{tier.tier_name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-purple-600">${tier.tier_price}</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {tier.subscriber_count || 0} subscribers
                </p>
              </div>

              <div className="space-y-2 mb-6">
                {tier.perks?.map((perk, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{perk}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleSubscribe(tier)}
                disabled={subscribeMutation.isPending || userSubscription?.tier === tier.tier_name}
                className="w-full gradient-bg-primary text-white shadow-glow"
              >
                {userSubscription?.tier === tier.tier_name ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Subscribed
                  </>
                ) : (
                  'Subscribe Now'
                )}
              </Button>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}