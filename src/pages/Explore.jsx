import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, TrendingUp, Grid, Tv, Settings } from 'lucide-react';
import PersonalizedFeed from '../components/discovery/PersonalizedFeed';
import TrendingHashtags from '../components/discovery/TrendingHashtags';
import ChannelGrid from '../components/discovery/ChannelGrid';
import AIRecommendations from '../components/discovery/AIRecommendations';
import SEO from '../components/SEO';

export default function Explore() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const categories = [
    { id: 'all', label: 'All', icon: Grid },
    { id: 'lifestyle', label: 'Lifestyle', icon: Sparkles },
    { id: 'tech', label: 'Tech', icon: TrendingUp },
    { id: 'art', label: 'Art', icon: Sparkles },
    { id: 'music', label: 'Music', icon: Sparkles },
    { id: 'wellness', label: 'Wellness', icon: Sparkles },
    { id: 'business', label: 'Business', icon: TrendingUp },
    { id: 'education', label: 'Education', icon: Sparkles },
    { id: 'entertainment', label: 'Entertainment', icon: Tv },
    { id: 'sports', label: 'Sports', icon: TrendingUp },
    { id: 'food', label: 'Food', icon: Sparkles },
    { id: 'travel', label: 'Travel', icon: Sparkles },
    { id: 'fashion', label: 'Fashion', icon: Sparkles },
    { id: 'gaming', label: 'Gaming', icon: TrendingUp },
    { id: 'fitness', label: 'Fitness', icon: TrendingUp }
  ];

  const handleHashtagClick = (hashtag) => {
    setSearchQuery(`#${hashtag}`);
    setActiveTab('feed');
  };

  const handleChannelClick = (channel) => {
    // Navigate to channel detail page (can be created later)
    alert(`Opening channel: ${channel.name}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Explore - Discover Trending Content | EncircleNet"
        description="Discover trending creators, hashtags, and curated channels. AI-powered personalized recommendations for you."
        keywords="content discovery, trending content, hashtags, personalized feed, AI recommendations"
      />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold gradient-text mb-2">Explore</h1>
        <p className="text-gray-600">Discover trending content, channels & creators</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, creators, hashtags..."
            className="pl-10 bg-white border-2 border-gray-200"
          />
        </div>
        <Button className="gradient-bg-primary text-white shadow-glow">
          <Search className="w-4 h-4" />
        </Button>
      </div>

      {/* Category Pills */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              variant={activeCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              className={activeCategory === cat.id ? 'gradient-bg-primary text-white shadow-glow' : 'border-gray-300'}
            >
              <Icon className="w-4 h-4 mr-2" />
              {cat.label}
            </Button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Feed */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full bg-white border-2 border-gray-200 mb-6">
              <TabsTrigger value="feed" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                <Sparkles className="w-4 h-4 mr-2" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                <Tv className="w-4 h-4 mr-2" />
                Channels
              </TabsTrigger>
              <TabsTrigger value="trending" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed">
              <PersonalizedFeed user={user} />
            </TabsContent>

            <TabsContent value="channels">
              <ChannelGrid category={activeCategory} onChannelClick={handleChannelClick} />
            </TabsContent>

            <TabsContent value="trending">
              <div className="space-y-4">
                <TrendingHashtags onHashtagClick={handleHashtagClick} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations */}
          {user && <AIRecommendations user={user} />}

          {/* Trending Hashtags */}
          <TrendingHashtags onHashtagClick={handleHashtagClick} />

          {/* Preferences */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 realistic-shadow">
            <Button variant="outline" className="w-full border-gray-300">
              <Settings className="w-4 h-4 mr-2" />
              Customize Preferences
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}