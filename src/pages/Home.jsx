import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/feed/PostCard';
import StoryBar from '../components/feed/StoryBar';
import AdCard from '../components/monetization/AdCard';
import TikTokFeed from '../components/feed/TikTokFeed';
import TikTokVerticalFeed from '../components/feed/TikTokVerticalFeed';
import GrowAndEarnPrompt from '../components/onboarding/GrowAndEarnPrompt';
import SEO from '../components/SEO';
import SmartSuggestions from '../components/ai/SmartSuggestions';
import ReferralSuccessNotification from '../components/referrals/ReferralSuccessNotification';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import FilteredFeed from '../components/feed/FilteredFeed';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import NotificationDropdown from '../components/notifications/NotificationDropdown';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';
import HomeChatbot from '../components/chat/HomeChatbot';
import WelcomeBanner from '../components/onboarding/WelcomeBanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, User, Settings, LogOut } from 'lucide-react';

const mockAds = [
  { id: 'ad1', type: 'ppc', title: 'Premium Fitness App', description: 'Get fit in 30 days. Join 1M+ users today!', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Start Free Trial', value: 0.5 },
  { id: 'ad2', type: 'affiliate', title: 'Best Coffee Subscription', description: 'Fresh roasted beans delivered monthly', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=200&h=200&fit=crop', url: 'https://example.com', cta: 'Shop Now', value: 1.2 }
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [feedMode, setFeedMode] = useState('tiktok');
  const [showGrowPrompt, setShowGrowPrompt] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
          
          const lastPromptDate = localStorage.getItem('lastGrowPromptDate');
          const today = new Date().toDateString();
          
          if (!lastPromptDate || 
              (new Date(today) - new Date(lastPromptDate)) / (1000 * 60 * 60 * 24) >= 3) {
            setTimeout(() => {
              if (mounted) setShowGrowPrompt(true);
            }, 2000);
          }
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    };
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  const handleCloseGrowPrompt = () => {
    setShowGrowPrompt(false);
    localStorage.setItem('lastGrowPromptDate', new Date().toDateString());
  };

  const { data: allPosts, isLoading, refetch, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        return await base44.entities.Post.list('-created_date', 100);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
        throw err;
      }
    },
    initialData: [],
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 30000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: 60000,
    networkMode: 'offlineFirst'
  });

  // Filter out posts pending review or rejected
  const posts = allPosts.filter(post => 
    post.moderation_status !== 'pending_review' && 
    post.moderation_status !== 'rejected'
  );

  const { data: userSubscription } = useQuery({
    queryKey: ['user-subscription', user?.email],
    queryFn: async () => {
      try {
        const subs = await base44.entities.Subscription.filter({ 
          user_email: user?.email,
          status: 'active'
        });
        return subs[0] || null;
      } catch (err) {
        console.error('Failed to fetch subscription:', err);
        return null;
      }
    },
    enabled: !!user?.email,
    staleTime: 300000, // Cache for 5 minutes
    retry: 2
  });

  const userTier = userSubscription?.tier || 'free';

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-blue-900 font-medium">Loading your feed...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="text-center p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <h3 className="text-xl font-bold mb-2 text-blue-900">Connection Issue</h3>
          <p className="text-gray-600 mb-4">Unable to load your feed. Please check your connection.</p>
          <Button onClick={() => refetch()} className="gradient-bg-primary text-white shadow-glow">
            Try Again
          </Button>
        </div>
      </div>
    );
    }

    return (
    <div className="relative">
        <SEO 
          title="Encircle Net Feed - Viral Content & High Engagement Social Media"
          description="Discover trending posts, viral content, and connect with top creators on Encircle Net. The most engaging social media platform with real-time interactions."
          url="https://encirclenet.net"
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
                onClick={handleRefresh}
                className="text-zinc-400 hover:text-white"
              >
                <RefreshCw className="w-5 h-5" />
              </Button>
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                      <Menu className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = createPageUrl('Settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => base44.auth.logout()}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        <TikTokVerticalFeed 
          posts={posts}
          currentUser={user}
          onLike={() => queryClient.invalidateQueries(['posts'])}
          onTip={() => queryClient.invalidateQueries(['posts'])}
        />
        
        {/* Chatbot */}
        <HomeChatbot user={user} />
      </div>
    );
  }