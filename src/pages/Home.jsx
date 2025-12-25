import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/feed/PostCard';
import StoryBar from '../components/feed/StoryBar';
import AdCard from '../components/monetization/AdCard';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mockAds = [
  { id: 'ad1', type: 'ppc', title: 'Premium Fitness App', description: 'Get fit in 30 days. Join 1M+ users today!', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Start Free Trial', value: 0.5 },
  { id: 'ad2', type: 'affiliate', title: 'Best Coffee Subscription', description: 'Fresh roasted beans delivered monthly', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Shop Now', value: 1.2 }
];

export default function Home() {
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

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold gradient-text">EncircleNet</h1>
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

      {/* Stories */}
      <div className="border-b border-zinc-800">
        <StoryBar currentUser={user} />
      </div>

      {/* Feed */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <span className="text-4xl">🌟</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to EncircleNet!</h3>
            <p className="text-zinc-500 mb-6">
              Your feed is empty. Start creating content or follow others to see posts.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map((post, index) => (
            <React.Fragment key={post.id}>
              <PostCard 
                post={post} 
                currentUser={user}
                onLike={() => queryClient.invalidateQueries(['posts'])}
                onTip={() => queryClient.invalidateQueries(['posts'])}
              />
              {/* Show ad every 3 posts for free users, every 6 for pro */}
              {((userTier === 'free' && (index + 1) % 3 === 0) || 
                (userTier === 'pro' && (index + 1) % 6 === 0)) && 
                mockAds[Math.floor(Math.random() * mockAds.length)] && (
                <AdCard 
                  ad={mockAds[Math.floor(Math.random() * mockAds.length)]}
                  userTier={userTier}
                />
              )}
            </React.Fragment>
          ))
        )}
      </div>
    </div>
  );
}