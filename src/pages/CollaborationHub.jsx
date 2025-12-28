import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Users, Search, MessageCircle, TrendingUp, Target, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { createPageUrl } from '../utils';

export default function CollaborationHub() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterNiche, setFilterNiche] = useState('all');

  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: allCreators = [] } = useQuery({
    queryKey: ['all-creators'],
    queryFn: async () => {
      const users = await base44.entities.User.list();
      return users;
    }
  });

  const { data: userPreferences } = useQuery({
    queryKey: ['user-preferences-collab', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['posts-for-collab'],
    queryFn: () => base44.entities.Post.list('-created_date', 200)
  });

  // Calculate creator stats and match scores
  const creatorsWithStats = allCreators.map(creator => {
    const creatorPosts = allPosts.filter(p => p.created_by === creator.email);
    const totalLikes = creatorPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
    const totalTips = creatorPosts.reduce((sum, p) => sum + (p.tips_received || 0), 0);
    
    // Calculate niche overlap
    const creatorCategories = creator.preferred_categories || [];
    const myCategories = userPreferences?.preferred_categories || [];
    const overlap = creatorCategories.filter(cat => myCategories.includes(cat)).length;
    const matchScore = myCategories.length > 0 ? (overlap / myCategories.length) * 100 : 0;

    return {
      ...creator,
      postCount: creatorPosts.length,
      totalLikes,
      totalTips,
      avgEngagement: creatorPosts.length > 0 ? totalLikes / creatorPosts.length : 0,
      matchScore: Math.round(matchScore),
      niches: creatorCategories
    };
  });

  // Filter creators
  let filteredCreators = creatorsWithStats.filter(c => c.email !== user?.email);

  if (searchQuery) {
    filteredCreators = filteredCreators.filter(c =>
      c.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.bio?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  if (filterNiche !== 'all') {
    filteredCreators = filteredCreators.filter(c =>
      c.niches?.includes(filterNiche)
    );
  }

  // Sort by match score and engagement
  filteredCreators.sort((a, b) => {
    if (a.matchScore !== b.matchScore) return b.matchScore - a.matchScore;
    return b.avgEngagement - a.avgEngagement;
  });

  const niches = ['lifestyle', 'tech', 'art', 'music', 'wellness', 'business', 'education', 'entertainment'];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <SEO 
        title="Collaboration Hub - Find Creator Partners | Encircle Net"
        description="Discover and connect with creators for collaborations. Find partners based on niche, audience overlap, and engagement."
      />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">Collaboration Hub</h1>
        <p className="text-gray-600">Find creators to collaborate with based on niche and audience overlap</p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6 border-2 border-purple-200">
        <CardContent className="p-4 space-y-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search creators by name, email, or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={filterNiche === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterNiche('all')}
              className={filterNiche === 'all' ? 'gradient-bg-primary' : ''}
            >
              All Niches
            </Button>
            {niches.map(niche => (
              <Button
                key={niche}
                size="sm"
                variant={filterNiche === niche ? 'default' : 'outline'}
                onClick={() => setFilterNiche(niche)}
                className={filterNiche === niche ? 'gradient-bg-primary' : ''}
              >
                {niche}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Creators Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCreators.map((creator, index) => (
          <motion.div
            key={creator.email}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="border-2 border-gray-200 hover:border-purple-400 transition-all hover:shadow-glow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <Avatar className="w-16 h-16 ring-2 ring-purple-300">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xl">
                      {creator.full_name?.[0] || creator.email?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-blue-900 truncate">{creator.full_name || 'User'}</h3>
                    <p className="text-xs text-gray-500 truncate">{creator.email}</p>
                    {creator.matchScore > 0 && (
                      <Badge className="mt-1 bg-green-100 text-green-700">
                        <Target className="w-3 h-3 mr-1" />
                        {creator.matchScore}% Match
                      </Badge>
                    )}
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{creator.bio}</p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-purple-600">{creator.postCount}</p>
                    <p className="text-xs text-gray-500">Posts</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-pink-600">{creator.totalLikes}</p>
                    <p className="text-xs text-gray-500">Likes</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">${creator.totalTips}</p>
                    <p className="text-xs text-gray-500">Earned</p>
                  </div>
                </div>

                {/* Niches */}
                {creator.niches?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {creator.niches.slice(0, 3).map((niche, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {niche}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => window.location.href = createPageUrl('ViewProfile') + `?email=${creator.email}`}
                    className="flex-1 gradient-bg-primary text-white"
                  >
                    View Profile
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.location.href = createPageUrl('Messages')}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCreators.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No Creators Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
}