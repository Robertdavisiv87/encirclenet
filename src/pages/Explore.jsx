import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, Grid3X3, Users, Flame, TrendingUp, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import TrendingSection from '../components/explore/TrendingSection';
import TrendingRibbon from '../components/feed/TrendingRibbon';
import { mockPosts } from '../components/data/mockPosts';

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [selectedTrend, setSelectedTrend] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
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

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg z-40 border-b border-zinc-800">
        <div className="p-4">
          <h1 className="text-2xl font-bold gradient-text mb-4">Explore</h1>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <Input
              placeholder="Search posts, people, tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-zinc-900 border-zinc-800 h-12 rounded-xl text-white placeholder:text-zinc-500"
            />
          </div>
        </div>
        <TrendingRibbon onSelectTrend={setSelectedTrend} />
      </div>

      <div className="p-4">

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-zinc-900 mb-6">
          <TabsTrigger value="posts" className="flex-1">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger value="circles" className="flex-1">
            <Users className="w-4 h-4 mr-2" />
            Circles
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {searchQuery ? (
            // Search results
            filteredPosts.length === 0 ? (
              <div className="text-center py-20 text-zinc-500">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No posts found</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {filteredPosts.map(post => (
                  <div 
                    key={post.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg hover-lift"
                  >
                    {post.content_type === 'photo' && post.media_url ? (
                      <img 
                        src={post.media_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : post.content_type === 'text' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center p-4">
                        <p className="text-sm text-center line-clamp-3">{post.caption}</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                        <span className="text-2xl">
                          {post.content_type === 'video' ? '🎬' : '🎤'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <span className="text-white font-semibold">❤️ {post.likes_count || 0}</span>
                    </div>
                  </div>
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

        <TabsContent value="circles">
          {circles.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No circles yet</p>
              <Button className="mt-4 bg-gradient-to-r from-purple-600 to-pink-500">
                Create a Circle
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {circles.map(circle => (
                <div 
                  key={circle.id}
                  className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-purple-500/50 transition-colors"
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
                        <h3 className="font-bold">{circle.name}</h3>
                        {circle.is_premium && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                            Premium
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-400 line-clamp-2 mt-1">{circle.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                        <span>{circle.members_count || 0} members</span>
                        {circle.is_premium && (
                          <span className="text-yellow-500">${circle.subscription_price}/mo</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700">
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