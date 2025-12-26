import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, X, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function SmartSuggestions({ user }) {
  const [suggestions, setSuggestions] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadSuggestions = async () => {
      try {
        // Get user stats
        const stats = await base44.entities.UserStats.filter({ user_email: user.email });
        const userStat = stats[0] || { posts_count: 0, followers: 0, points: 0 };

        const userSubs = await base44.entities.Subscription.filter({ 
          user_email: user.email,
          status: 'active'
        });
        const userTier = userSubs[0]?.tier || 'free';

        // Generate smart suggestions
        const smartSuggestions = [];

        if (userStat.posts_count < 5) {
          smartSuggestions.push({
            id: 'post_more',
            icon: TrendingUp,
            title: 'Create Your First Posts',
            description: 'Share 5 posts to unlock engagement features and start earning',
            action: 'Create Post',
            link: '/create'
          });
        }

        if (userTier === 'free') {
          smartSuggestions.push({
            id: 'upgrade',
            icon: Sparkles,
            title: 'Upgrade to Pro',
            description: 'Unlock monetization, premium circles, and 2x earnings',
            action: 'View Plans',
            link: '/subscription'
          });
        }

        if (!userStat.referrals_count || userStat.referrals_count === 0) {
          smartSuggestions.push({
            id: 'referrals',
            icon: Users,
            title: 'Invite Friends & Earn',
            description: 'Get $5 for every friend who joins. Start earning passive income',
            action: 'Start Inviting',
            link: '/referrals'
          });
        }

        if (userStat.posts_count > 10 && userTier !== 'free') {
          smartSuggestions.push({
            id: 'monetize',
            icon: DollarSign,
            title: 'Boost Your Earnings',
            description: 'Enable tips and subscriptions on your popular posts',
            action: 'Learn How',
            link: '/creatoreconomy'
          });
        }

        setSuggestions(smartSuggestions.slice(0, 2));
      } catch (e) {
        console.error('Failed to load suggestions:', e);
      }
    };

    loadSuggestions();
  }, [user]);

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  const visibleSuggestions = suggestions.filter(s => !dismissed.includes(s.id));

  if (!isVisible || visibleSuggestions.length === 0) return null;

  return (
    <div className="mb-6 px-4">
      <AnimatePresence>
        {visibleSuggestions.map((suggestion) => (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-4 mb-3 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200 rounded-full blur-3xl opacity-20" />
            
            <button
              onClick={() => handleDismiss(suggestion.id)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4 relative">
              <div className="w-12 h-12 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow flex-shrink-0">
                <suggestion.icon className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h4 className="font-bold text-blue-900">{suggestion.title}</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">{suggestion.description}</p>
                
                <Button
                  onClick={() => window.location.href = suggestion.link}
                  size="sm"
                  className="gradient-bg-primary text-white shadow-glow hover-lift"
                >
                  {suggestion.action}
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}