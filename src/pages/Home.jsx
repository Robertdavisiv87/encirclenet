import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/feed/PostCard';
import StoryBar from '../components/feed/StoryBar';
import AdCard from '../components/monetization/AdCard';
import TikTokFeed from '../components/feed/TikTokFeed';
import GrowAndEarnPrompt from '../components/onboarding/GrowAndEarnPrompt';
import SEO from '../components/SEO';
import { Loader2, RefreshCw, Grid3X3, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockAds = [
  { id: 'ad1', type: 'ppc', title: 'Premium Fitness App', description: 'Get fit in 30 days. Join 1M+ users today!', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Start Free Trial', value: 0.5 },
  { id: 'ad2', type: 'affiliate', title: 'Best Coffee Subscription', description: 'Fresh roasted beans delivered monthly', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Shop Now', value: 1.2 }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [feedMode, setFeedMode] = useState('classic'); // classic or tiktok
  const [showGrowPrompt, setShowGrowPrompt] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Check if onboarding is complete - skip this check for now
        // if (!currentUser.onboarding_completed && currentUser.email) {
        //   window.location.href = '/onboarding';
        //   return;
        // }

        // Show grow prompt on first login or every 3 days
        const lastPromptDate = localStorage.getItem('lastGrowPromptDate');
        const today = new Date().toDateString();
        
        if (!lastPromptDate || 
            (new Date(today) - new Date(lastPromptDate)) / (1000 * 60 * 60 * 24) >= 3) {
          setTimeout(() => setShowGrowPrompt(true), 2000);
        }
      } catch (e) {}
    };
    loadUser();
  }, []);

  const handleCloseGrowPrompt = () => {
    setShowGrowPrompt(false);
    localStorage.setItem('lastGrowPromptDate', new Date().toDateString());
  };

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    initialData: []
  });

  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const userTier = userSubscription?.tier || 'free';

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (feedMode === 'tiktok') {
    return (
      <div className="relative">
        <SEO 
          title="Encircle Net Feed - Viral Content & High Engagement Social Media"
          description="Discover trending posts, viral content, and connect with top creators on Encircle Net. The most engaging social media platform with real-time interactions."
        />
        <GrowAndEarnPrompt isOpen={showGrowPrompt} onClose={handleCloseGrowPrompt} />
        {/* Floating Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694d8134627c7c1962086e4b/90c7b04a9_logo.jpg" 
                alt="Encircle Net" 
                className="w-8 h-8 rounded-full shadow-glow"
              />
              Encircle Net
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setFeedMode('classic')}
                className="text-zinc-400 hover:text-white"
              >
                <Grid3X3 className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleRefresh}
                className="text-zinc-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <TikTokFeed 
          posts={posts}
          currentUser={user}
          onLike={() => queryClient.invalidateQueries(['posts'])}
          onTip={() => queryClient.invalidateQueries(['posts'])}
        />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <SEO 
        title="Encircle Net - #1 High Engagement Social Media Platform | Earn While You Share"
        description="Join 1M+ creators on Encircle Net, the highest engagement social media platform. Share content, earn money through tips & subscriptions, and build your circle. Start monetizing today!"
        keywords="high engagement social media, best social media platform 2025, earn money online, content creator platform, social media with highest engagement, monetize content, influencer platform, creator economy"
      />
      <GrowAndEarnPrompt isOpen={showGrowPrompt} onClose={handleCloseGrowPrompt} />
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-40 border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold gradient-text animate-shimmer flex items-center gap-2">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/694d8134627c7c1962086e4b/90c7b04a9_logo.jpg" 
              alt="Encircle Net" 
              className="w-8 h-8 rounded-full shadow-glow"
            />
            Encircle Net
          </h1>
          <div className="flex gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setFeedMode('tiktok')}
              className="text-gray-600 hover:text-gray-900 hover-scale"
              title="TikTok Mode"
            >
              <LayoutGrid className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleRefresh}
              className="text-gray-600 hover:text-gray-900 hover-scale"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="border-b border-gray-200 bg-white">
        <StoryBar currentUser={user} />
      </div>

      {/* Feed */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
              <span className="text-4xl">🌟</span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-900">Welcome to Encircle Net!</h3>
            <p className="text-gray-600 mb-6">
              Your feed is empty. Start creating content or follow others to see posts.
            </p>
            <Button className="gradient-bg-primary text-white shadow-glow hover-glow">
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id}
              post={post} 
              currentUser={user}
              onLike={() => queryClient.invalidateQueries(['posts'])}
              onTip={() => queryClient.invalidateQueries(['posts'])}
            />
          ))
          )}
      </div>
    </div>
  );
}