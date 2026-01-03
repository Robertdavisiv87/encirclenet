import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Sparkles, TrendingUp, MapPin, Filter, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SEO from '../components/SEO';
import GlobalAIAssistant from '../components/ai/GlobalAIAssistant';
import AutoMonitor from '../components/system/AutoMonitor';
import CategoryGrid from '../components/hub/CategoryGrid';
import ServiceCardsGrid from '../components/hub/ServiceCardsGrid';
import CreatorCardsGrid from '../components/hub/CreatorCardsGrid';
import AISuggestions from '../components/ai/AISuggestions';
import { createPageUrl } from '../utils';

export default function Hub() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [location, setLocation] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        console.log('User not authenticated');
      }
    };
    loadUser();
  }, []);

  // Fetch trending services
  const { data: trendingServices = [], isLoading: loadingServices } = useQuery({
    queryKey: ['trending-services', selectedCategory],
    queryFn: async () => {
      const verticals = await base44.entities.ServiceVertical.filter({ is_active: true });
      return selectedCategory === 'all' 
        ? verticals.slice(0, 20)
        : verticals.filter(v => v.slug === selectedCategory).slice(0, 20);
    },
    staleTime: 300000 // Cache for 5 minutes
  });

  // Fetch trending creators (using posts as proxy)
  const { data: trendingCreators = [], isLoading: loadingCreators } = useQuery({
    queryKey: ['trending-creators'],
    queryFn: async () => {
      const posts = await base44.entities.Post.list('-likes_count', 100);
      const uniqueCreators = [...new Map(posts.map(p => [p.created_by, p])).values()];
      return uniqueCreators.slice(0, 20);
    },
    staleTime: 300000,
    refetchInterval: 3600000 // Auto-refresh every hour
  });

  const filteredServices = trendingServices.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCreators = trendingCreators.filter(creator =>
    creator.author_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 p-4 md:p-6">
      <SEO 
        title="Hub - All Services & Creators | EncircleNet"
        description="Browse 35+ categories of local services and digital creators. Instant booking, real-time availability, AI-powered recommendations."
        keywords="local services, digital creators, marketplace, booking, hire creators, trending services"
      />

      <GlobalAIAssistant user={user} currentPage="Hub" />
      <AutoMonitor />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-3">
            What service or creator do you need today?
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Explore nearby services or trending digital creators across all niches
          </p>
          
          {/* Search & Location */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services or creators..."
                className="pl-10 h-12 border-2 border-purple-300 text-base"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter your location..."
                className="pl-10 h-12 border-2 border-purple-300 text-base"
              />
            </div>
          </div>
        </motion.div>

        {/* AI Suggestions */}
        <AISuggestions
          title="AI Recommendations for You"
          suggestions={[
            {
              type: 'trending',
              title: 'Mobile Mechanics Nearby',
              description: 'Top-rated, available today',
              cta: 'View',
              action: 'mechanic'
            },
            {
              type: 'earning',
              title: 'Social Media Managers',
              description: 'Hire expert creators',
              cta: 'Connect',
              action: 'social'
            },
            {
              type: 'community',
              title: 'Fitness Trainers',
              description: '4.9★ rated in your area',
              cta: 'Book',
              action: 'fitness'
            }
          ]}
          onAction={(suggestion) => setSelectedCategory(suggestion.action)}
        />

        {/* Category Filter */}
        <CategoryGrid 
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 bg-white border-2 border-gray-200 p-1 rounded-xl mb-6">
            <TabsTrigger value="all" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              All ({filteredServices.length + filteredCreators.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Services ({filteredServices.length})
            </TabsTrigger>
            <TabsTrigger value="creators" className="data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
              Creators ({filteredCreators.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            {/* Top 20 Services */}
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                Top 20 Services Near You
              </h2>
              {loadingServices ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <ServiceCardsGrid services={filteredServices.slice(0, 20)} />
              )}
            </div>

            {/* Top 20 Creators */}
            <div>
              <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-pink-600" />
                Top 20 Trending Creators
              </h2>
              {loadingCreators ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : (
                <CreatorCardsGrid creators={filteredCreators.slice(0, 20)} currentUser={user} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="services">
            <ServiceCardsGrid services={filteredServices.slice(0, 20)} />
          </TabsContent>

          <TabsContent value="creators">
            <CreatorCardsGrid creators={filteredCreators.slice(0, 20)} currentUser={user} />
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Start Earning Today</h2>
            <p className="text-purple-100 mb-6">
              Offer services, create content, or refer friends. Multiple income streams in one app.
            </p>
            <Button 
              onClick={() => window.location.href = createPageUrl('CreatorEconomy')}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100"
            >
              View Earnings Dashboard
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Become a Provider</h2>
            <p className="text-blue-100 mb-6">
              List your services and reach thousands of local customers instantly.
            </p>
            <Button 
              onClick={() => window.location.href = createPageUrl('Welcome')}
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100"
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}