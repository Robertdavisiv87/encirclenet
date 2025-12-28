import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import PostCard from '../feed/PostCard';
import { Loader2, Sparkles, TrendingUp, Heart } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export default function PersonalizedFeed({ user }) {
  const [activeTab, setActiveTab] = useState('for-you');

  // Fetch user preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  // Fetch user's engagement history
  const { data: userLikes } = useQuery({
    queryKey: ['user-likes', user?.email],
    queryFn: () => base44.entities.Like.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  // Fetch personalized posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ['personalized-posts', activeTab, preferences?.preferred_categories],
    queryFn: async () => {
      const allPosts = await base44.entities.Post.list('-created_date', 100);
      
      if (activeTab === 'for-you' && preferences?.preferred_categories?.length > 0) {
        // Filter by user preferences
        return allPosts.filter(post => 
          post.tags?.some(tag => preferences.preferred_categories.includes(tag)) ||
          preferences.preferred_categories.includes(post.category)
        );
      } else if (activeTab === 'trending') {
        // Sort by engagement
        return allPosts.sort((a, b) => 
          ((b.likes_count || 0) + (b.comments_count || 0)) - 
          ((a.likes_count || 0) + (a.comments_count || 0))
        );
      } else if (activeTab === 'following') {
        // Get posts from followed users
        const follows = await base44.entities.Follow.filter({ follower_email: user?.email });
        const followedEmails = follows.map(f => f.following_email);
        return allPosts.filter(post => followedEmails.includes(post.created_by));
      }
      
      return allPosts;
    },
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full bg-white border-2 border-gray-200">
          <TabsTrigger value="for-you" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            For You
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="following" className="flex-1 data-[state=active]:gradient-bg-primary data-[state=active]:text-white">
            <Heart className="w-4 h-4 mr-2" />
            Following
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-gray-200">
              <p className="text-gray-600">No posts found. Follow more users or explore new content!</p>
            </div>
          ) : (
            posts.map(post => (
              <PostCard 
                key={post.id}
                post={post}
                currentUser={user}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}