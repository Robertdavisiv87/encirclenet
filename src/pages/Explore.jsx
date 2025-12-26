import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid3X3, Users, Flame, TrendingUp, Crown, Dumbbell, Utensils, Briefcase, Home as HomeIcon, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TrendingSection from '../components/explore/TrendingSection';
import TrendingRibbon from '../components/feed/TrendingRibbon';
import NicheCard from '../components/explore/NicheCard';
import CreatorLeaderboard from '../components/leaderboard/CreatorLeaderboard';
import TrendingTabs from '../components/explore/TrendingTabs';
import InteractivePost from '../components/explore/InteractivePost';
import { mockPosts } from '../components/data/mockPosts';
import { mockUsers } from '../components/data/mockUsers';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [activeTab, setActiveTab] = useState('fitness');
  const [userSubscription, setUserSubscription] = useState(null);

  const niches = [
    { id: 'fitness', name: 'Fitness & Health', description: 'Workouts, training tips, and fitness journeys', postCount: 2456 },
    { id: 'nutrition', name: 'Nutrition & Cooking', description: 'Healthy recipes, meal prep, and nutrition guides', postCount: 1832 },
    { id: 'professional', name: 'Professional Growth', description: 'Career tips, entrepreneurship, and business insights', postCount: 1623 },
    { id: 'remote', name: 'Remote Work', description: 'Work-from-home tips, productivity, and digital nomad life', postCount: 1245 },
    { id: 'lifestyle', name: 'Lifestyle & Hobbies', description: 'Creative pursuits, self-care, and personal development', postCount: 2178 },
  ];

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        
        // Load subscription
        const subs = await base44.entities.Subscription.filter({
          user_email: currentUser.email,
          status: 'active'
        });
        setUserSubscription(subs[0]);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: realPosts } = useQuery({
    queryKey: ['explore-posts'],
    queryFn: () => base44.entities.Post.list('-likes_count', 50),
    initialData: []
  });

  // Combine real posts with mock posts
  const allPosts = useMemo(() => {
    return [...realPosts, ...mockPosts.slice(0, 100)];
  }, [realPosts]);

  const { data: circles } = useQuery({
    queryKey: ['circles'],
    queryFn: () => base44.entities.Circle.list('-members_count', 20),
    initialData: []
  });

  // Trending categories
  const hotPosts = useMemo(() => {
    return allPosts
      .filter(p => p.likes_count > 2000)
      .slice(0, 10);
  }, [allPosts]);

  const trendingPosts = useMemo(() => {
    return allPosts
      .filter(p => p.likes_count > 1000 && p.likes_count <= 2000)
      .slice(0, 10);
  }, [allPosts]);

  const elitePosts = useMemo(() => {
    return allPosts
      .filter(p => p.user_tier === 'elite')
      .slice(0, 10);
  }, [allPosts]);

  const filteredPosts = allPosts.filter(post => 
    post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Top creators for leaderboard
  const topCreatorsByEngagement = useMemo(() => {
    return mockUsers
      .sort((a, b) => (b.followers || 0) - (a.followers || 0))
      .slice(0, 10);
  }, []);

  const topCreatorsByEarnings = useMemo(() => {
    return mockUsers
      .filter(u => u.tier === 'pro' || u.tier === 'elite')
      .sort((a, b) => (b.total_earned || 0) - (a.total_earned || 0))
      .slice(0, 10);
  }, []);

  // Filter posts by active tab theme
  const tabPosts = useMemo(() => {
    const themeMap = {
      fitness: 'workout',
      nutrition: 'nutrition',
      professional: 'professional',
      lifestyle: 'wellness',
      tech: 'professional',
      viral: 'workout'
    };
    const theme = themeMap[activeTab];
    return allPosts.filter(p => p.theme === theme).slice(0, 20);
  }, [allPosts, activeTab]);

  const userTier = userSubscription?.tier || 'free';

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title="Explore Trending Content - EncircleNet | Discover Viral Posts & Top Creators"
        description="Explore trending niches, viral posts, and top creators on EncircleNet. Discover fitness, lifestyle, business content and more on the most engaging social platform."
        keywords="explore social media, trending content, viral posts, top creators, social media discovery, trending niches, influencer content, engaging posts"
      />
      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-40 border-b border-gray-200 shadow-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold gradient-text mb-4 animate-shimmer">Explore</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <Input
              placeholder="Search posts, people, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-white border-gray-300 h-12 rounded-xl text-gray-900 placeholder:text-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-200 transition-all"
            />
          </div>
        </div>
        <TrendingRibbon onSelectTrend={setSelectedTrend} />
        <TrendingTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab.id)} />
      </div>

      <div className="p-4">

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="w-full bg-gradient-to-r from-purple-50 to-blue-50 mb-6 overflow-x-auto shadow-md">
          <TabsTrigger value="feed" className="flex-1" onClick={() => navigate(createPageUrl('Home'))}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="niches" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            Niches
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex-1">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1" onClick={() => navigate(createPageUrl('Gamification'))}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="circles" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Circles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabPosts.map((post) => (
              <InteractivePost
                key={post.id}
                post={post}
                userTier={userTier}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="niches">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {niches.map((niche) => (
              <NicheCard
                key={niche.id}
                niche={niche}
                trending={niche.postCount > 2000}
                activeUsers={Math.floor(niche.postCount * 0.3)}
                onClick={() => setSelectedNiche(niche)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts">
          {searchQuery ? (
            // Search results
            filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-gray-600">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No posts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {filteredPosts.map(post => (
                  <motion.div 
                    key={post.id}
                    whileHover={{ scale: 1.05, rotate: 1 }}
                    whileTap={{ scale: 0.95 }}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-xl realistic-shadow realistic-shadow-hover"
                  >
                    {post.content_type === 'photo' && post.media_url ? (
                      <img 
                        src={post.media_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : post.content_type === 'text' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                        <p className="text-sm text-center line-clamp-3 text-blue-900">{post.caption}</p>
                      </div>
                    ) : post.content_type === 'video' && post.media_url ? (
                     <video 
                       src={post.media_url} 
                       className="w-full h-full object-cover"
                       autoPlay
                       muted
                       loop
                       playsInline
                     />
                    ) : (
                     <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                       <span className="text-2xl">
                         {post.content_type === 'video' ? '🎬' : '🎤'}
                       </span>
                     </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                      <span className="text-white font-bold text-lg drop-shadow-lg animate-bounce-in">❤️ {post.likes_count || 0}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            // Trending sections
            <div className="space-y-8">
              <TrendingSection 
                title="🔥 Hot This Hour"
                icon={Flame}
                posts={hotPosts}
                currentUser={user}
              />
              <TrendingSection 
                title="📈 Trending Now"
                icon={TrendingUp}
                posts={trendingPosts}
                currentUser={user}
              />
              <TrendingSection 
                title="👑 Elite Picks"
                icon={Crown}
                posts={elitePosts}
                currentUser={user}
              />
            </div>
          )}
        </TabsContent>

        <TabsContent value="leaderboard">
          <div className="space-y-6">
            <CreatorLeaderboard 
              creators={topCreatorsByEngagement}
              type="engagement"
            />
            <CreatorLeaderboard 
              creators={topCreatorsByEarnings}
              type="earnings"
            />
          </div>
        </TabsContent>

        <TabsContent value="circles">
          {circles.length === 0 ? (
            <div className="text-center py-20 text-gray-600">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No circles yet</p>
              <Button className="mt-4 gradient-bg-primary text-white shadow-glow">
                Create a Circle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {circles.map(circle => (
                <div 
                  key={circle.id}
                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-500/50 transition-colors shadow-md"
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={circle.cover_image} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-xl">
                        {circle.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-blue-900">{circle.name}</h3>
                        {circle.is_premium && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{circle.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{circle.members_count || 0} members</span>
                        {circle.is_premium && (
                          <span className="text-yellow-600">${circle.subscription_price}/mo</span>
                        )}
                        </div>
                        </div>
                        </div>
                        <Button className="w-full mt-4 gradient-bg-primary text-white shadow-glow">
                        Join Circle
                        </Button>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}