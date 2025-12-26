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
import RemoteJobsSection from '../components/jobs/RemoteJobsSection';
import TechProductsSection from '../components/tech/TechProductsSection';
import CreatorsMarketplace from '../components/creators/CreatorsMarketplace';
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
  const [trendFilter, setTrendFilter] = useState('hot');

  const niches = [
    { id: 'fitness', name: 'Fitness & Health', description: 'Workouts, training tips, and fitness journeys', postCount: 2456 },
    { id: 'nutrition', name: 'Nutrition & Cooking', description: 'Healthy recipes, meal prep, and nutrition guides', postCount: 1832 },
    { id: 'professional', name: 'Professional Growth', description: 'Career tips, entrepreneurship, and business insights', postCount: 1623 },
    { id: 'remote', name: 'Work From Home Jobs', description: 'Live remote job listings from 20+ platforms', postCount: 1245, isJobs: true },
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
    let filtered = allPosts.filter(p => p.theme === theme);

    // Apply trend filter
    switch (trendFilter) {
      case 'hot':
        // Hot this hour - highest engagement in last hour (simulated by recent + high likes)
        filtered = filtered
          .filter(p => p.likes_count > 1500)
          .sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'trending':
        // Trending - growing engagement
        filtered = filtered
          .filter(p => p.likes_count > 1000 && p.likes_count <= 3000)
          .sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'value':
        // Top Value - high comments relative to likes (engagement quality)
        filtered = filtered
          .filter(p => p.comments_count > 50)
          .sort((a, b) => {
            const valueA = (a.comments_count + a.tips_received) / (a.likes_count || 1);
            const valueB = (b.comments_count + b.tips_received) / (b.likes_count || 1);
            return valueB - valueA;
          });
        break;
      case 'rising':
        // Rising Stars - new creators with good engagement
        filtered = filtered
          .filter(p => p.likes_count > 500 && p.likes_count < 1500)
          .sort((a, b) => b.likes_count - a.likes_count);
        break;
      case 'elite':
        // Elite Content - from elite tier users only
        filtered = filtered
          .filter(p => p.user_tier === 'elite')
          .sort((a, b) => b.likes_count - a.likes_count);
        break;
      default:
        break;
    }

    return filtered.slice(0, 20);
  }, [allPosts, activeTab, trendFilter]);

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
              className="pl-12 bg-white border-2 border-gray-300 h-12 rounded-xl text-blue-900 placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 transition-all realistic-shadow"
            />
          </div>
        </div>
        <TrendingRibbon onSelectTrend={(topic) => {
          setSelectedTrend(topic);
          const filterMap = {
            'Hot this hour': 'hot',
            'Trending': 'trending',
            'Top Value': 'value',
            'Rising Stars': 'rising',
            'Elite Content': 'elite'
          };
          const newFilter = filterMap[topic.label] || 'hot';
          setTrendFilter(newFilter);
          console.log('Trend selected:', topic.label, 'Filter:', newFilter);
        }} />
        <TrendingTabs activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab.id)} />
      </div>

      <div className="p-4">

      {/* Trending Filter Active Indicator */}
      {selectedTrend && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-glow">
                {selectedTrend.icon && <selectedTrend.icon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h3 className="font-bold text-blue-900">
                  Showing: {selectedTrend.label}
                </h3>
                <p className="text-xs text-gray-600">{selectedTrend.tag}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setSelectedTrend(null);
                setTrendFilter('hot');
              }}
            >
              Clear Filter
            </Button>
          </div>
          
          {/* Filtered Posts Display */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabPosts.length > 0 ? (
              tabPosts.slice(0, 9).map((post) => (
                <InteractivePost
                  key={post.id}
                  post={post}
                  userTier={userTier}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-600">
                <p>No posts match this filter</p>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <Tabs defaultValue="feed" className="w-full">
        <TabsList className="w-full bg-white border-2 border-gray-200 mb-6 overflow-x-auto realistic-shadow">
          <TabsTrigger value="feed" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="niches" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            Niches
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Crown className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="circles" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Circles
          </TabsTrigger>
          <TabsTrigger value="creators" className="flex-1 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
            <Briefcase className="w-4 h-4 mr-2" />
            Creators
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed">
          <div className="mb-6">
            <h2 className="text-xl font-bold gradient-text mb-4">Trending Feed</h2>
            <p className="text-sm text-gray-600 mb-6">
              Discover the most engaging content across all categories
            </p>
          </div>
          
          {activeTab === 'remote' ? (
            <RemoteJobsSection />
          ) : activeTab === 'tech' ? (
            <TechProductsSection />
          ) : (
            <>
              {tabPosts.length === 0 ? (
                <div className="text-center py-20">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No posts available in this category</p>
                  <Button 
                    className="mt-4 gradient-bg-primary text-white shadow-glow"
                    onClick={() => navigate(createPageUrl('Create'))}
                  >
                    Create First Post
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tabPosts.map((post) => (
                    <InteractivePost
                      key={post.id}
                      post={post}
                      userTier={userTier}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="niches">
          <div className="mb-6">
            <h2 className="text-xl font-bold gradient-text mb-4">Explore Niches</h2>
            <p className="text-sm text-gray-600 mb-6">
              Dive deep into specialized communities and trending topics
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {niches.map((niche) => (
              <NicheCard
                key={niche.id}
                niche={niche}
                trending={niche.postCount > 2000}
                activeUsers={Math.floor(niche.postCount * 0.3)}
                onClick={() => {
                  setSelectedNiche(niche);
                  if (!niche.isJobs) {
                    setActiveTab(niche.id);
                  }
                }}
              />
            ))}
          </div>

          {/* Show content based on selected niche */}
          {selectedNiche && (
            <div className="mt-8">
              {selectedNiche.isJobs ? (
                <RemoteJobsSection />
              ) : (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-blue-900">
                    Popular in {selectedNiche.name}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allPosts
                      .filter(p => {
                        const themeMap = {
                          fitness: 'workout',
                          nutrition: 'nutrition',
                          professional: 'professional',
                          lifestyle: 'wellness'
                        };
                        return p.theme === themeMap[selectedNiche.id];
                      })
                      .slice(0, 12)
                      .map((post) => (
                        <InteractivePost
                          key={post.id}
                          post={post}
                          userTier={userTier}
                        />
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
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
                    ) : post.content_type === 'video' && post.media_url ? (
                      <video 
                        src={post.media_url} 
                        className="w-full h-full object-cover"
                        controls
                        playsInline
                      />
                    ) : post.content_type === 'text' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                        <p className="text-sm text-center line-clamp-3 text-blue-900">{post.caption}</p>
                      </div>
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
          <div className="mb-6">
            <h2 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
              <Crown className="w-6 h-6" />
              Top Creators
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              See who's leading the platform in engagement and earnings
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900 mb-1">🏆 Weekly Competition</h3>
                  <p className="text-xs text-gray-600">Top creators win exclusive rewards</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(createPageUrl('Gamification'))}
                >
                  View All Rewards
                </Button>
              </div>
            </div>

            <CreatorLeaderboard 
              creators={topCreatorsByEngagement}
              type="engagement"
            />
            <CreatorLeaderboard 
              creators={topCreatorsByEarnings}
              type="earnings"
            />

            <div className="text-center py-8">
              <Button 
                className="gradient-bg-primary text-white shadow-glow"
                onClick={() => navigate(createPageUrl('Create'))}
              >
                Start Creating to Join the Leaderboard
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="circles">
          <div className="mb-6">
            <h2 className="text-xl font-bold gradient-text mb-4 flex items-center gap-2">
              <Users className="w-6 h-6" />
              Discover Circles
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Join exclusive communities and connect with like-minded creators
            </p>
          </div>

          {circles.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-blue-900">No Circles Yet</h3>
              <p className="text-gray-600 mb-6">
                Be the first to create a circle and build your community
              </p>
              <Button 
                className="gradient-bg-primary text-white shadow-glow"
                onClick={() => navigate(createPageUrl('MyCircle'))}
              >
                Create Your Circle
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {circles.map(circle => (
                  <motion.div 
                    key={circle.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-500/50 transition-all shadow-md hover:shadow-xl cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-16 h-16 shadow-md">
                        <AvatarImage src={circle.cover_image} />
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-xl font-bold text-white">
                          {circle.name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-blue-900">{circle.name}</h3>
                          {circle.is_premium && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-600 px-2 py-0.5 rounded-full font-semibold">
                              Premium
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{circle.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {circle.members_count || 0}
                          </span>
                          {circle.is_premium && (
                            <span className="text-yellow-600 font-semibold">
                              ${circle.subscription_price}/mo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button className="w-full mt-4 gradient-bg-primary text-white shadow-glow hover-lift">
                      Join Circle
                    </Button>
                  </motion.div>
                ))}
              </div>

              <div className="text-center py-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                <p className="text-sm text-gray-700 mb-3">Want to create your own circle?</p>
                <Button 
                  variant="outline"
                  onClick={() => navigate(createPageUrl('MyCircle'))}
                >
                  Create Circle
                </Button>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="creators">
          <CreatorsMarketplace />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}