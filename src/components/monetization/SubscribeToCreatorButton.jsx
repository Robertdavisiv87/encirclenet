import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Crown, Star, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function SubscribeToCreatorButton({ creatorEmail, creatorName, currentUser }) {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: creatorTiers } = useQuery({
    queryKey: ['creator-tiers', creatorEmail],
    queryFn: () => base44.entities.CreatorTier.filter({ 
      creator_email: creatorEmail,
      is_active: true 
    }),
    initialData: []
  });

  const { data: existingSubscription } = useQuery({
    queryKey: ['my-creator-subscription', creatorEmail, currentUser?.email],
    queryFn: () => base44.entities.CreatorSubscription.filter({ 
      creator_email: creatorEmail,
      subscriber_email: currentUser?.email,
      status: 'active'
    }),
    enabled: !!currentUser?.email,
    initialData: []
  });

  const subscribeMutation = useMutation({
    mutationFn: async (tier) => {
      const nextBillingDate = new Date();
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      
      return await base44.entities.CreatorSubscription.create({
        creator_email: creatorEmail,
        subscriber_email: currentUser.email,
        tier: tier.tier_name.toLowerCase(),
        monthly_amount: tier.tier_price,
        status: 'active',
        next_billing_date: nextBillingDate.toISOString().split('T')[0],
        perks: tier.perks
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-creator-subscription']);
      queryClient.invalidateQueries(['creator-tiers']);
      alert(`✅ Subscribed to ${creatorName}!`);
      setShowModal(false);
    }
  });

  const isSubscribed = existingSubscription.length > 0;

  const tierIcons = {
    basic: Star,
    premium: Crown,
    vip: Sparkles
  };

  const tierColors = {
    basic: 'from-gray-500 to-gray-600',
    premium: 'from-purple-500 to-purple-600',
    vip: 'from-yellow-500 to-orange-500'
  };

  if (creatorTiers.length === 0) return null;

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className={cn(
          "gap-2",
          isSubscribed 
            ? "bg-green-600 hover:bg-green-700" 
            : "gradient-bg-primary"
        )}
      >
        {isSubscribed ? (
          <>
            <Check className="w-4 h-4" />
            Subscribed
          </>
        ) : (
          <>
            <Crown className="w-4 h-4" />
            Subscribe
          </>
        )}
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              Subscribe to {creatorName}
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-4 mt-4">
            {creatorTiers.map((tier, index) => {
              const Icon = tierIcons[tier.tier_name.toLowerCase()] || Star;
              const gradient = tierColors[tier.tier_name.toLowerCase()] || tierColors.basic;

              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-2 border-gray-200 rounded-xl p-6 hover:border-purple-400 transition-all hover:shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-center mb-2">{tier.tier_name}</h3>
                  <p className="text-3xl font-bold text-center text-purple-600 mb-4">
                    ${tier.tier_price}
                    <span className="text-sm text-gray-500">/month</span>
                  </p>

                  <div className="space-y-2 mb-6">
                    {tier.perks?.map((perk, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{perk}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-gray-500 text-center mb-4">
                    {tier.subscriber_count || 0} subscribers
                  </p>

                  <Button
                    onClick={() => subscribeMutation.mutate(tier)}
                    disabled={isSubscribed || subscribeMutation.isPending}
                    className={`w-full bg-gradient-to-br ${gradient}`}
                  >
                    {subscribeMutation.isPending ? 'Processing...' : 'Subscribe'}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}