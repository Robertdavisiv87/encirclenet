import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, Sparkles } from 'lucide-react';
import PostCard from '../components/feed/PostCard';
import GroupPostCard from '../components/groups/GroupPostCard';
import AISuggestions from '../components/ai/AISuggestions';
import SEO from '../components/SEO';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Discover() {
  const [user, setUser] = useState(null);
  const [contentType, setContentType] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: userGroups = [] } = useQuery({
    queryKey: ['user-groups', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const memberships = await base44.entities.GroupMembership.filter({
        user_email: user.email
      });
      const groupIds = memberships.map(m => m.group_id);
      if (groupIds.length === 0) return [];
      const groups = await base44.entities.CreatorGroup.list();
      return groups.filter(g => groupIds.includes(g.id));
    },
    enabled: !!user?.email
  });

  const { data: following = [] } = useQuery({
    queryKey: ['user-following', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Follow.filter({
        follower_email: user.email
      });
    },
    enabled: !!user?.email
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['discover-posts', following],
    queryFn: async () => {
      const followedEmails = following.map(f => f.following_email);
      if (followedEmails.length === 0) return [];
      const allPosts = await base44.entities.Post.list('-created_date', 100);
      return allPosts.filter(p => followedEmails.includes(p.created_by));
    },
    enabled: following.length > 0
  });

  const { data: groupPosts = [], isLoading: groupPostsLoading } = useQuery({
    queryKey: ['discover-group-posts', userGroups, selectedGroup],
    queryFn: async () => {
      const groupIds = selectedGroup === 'all' 
        ? userGroups.map(g => g.id)
        : [selectedGroup];
      
      if (groupIds.length === 0) return [];
      
      const allGroupPosts = await base44.entities.GroupPost.list('-created_date', 100);
      return allGroupPosts.filter(p => groupIds.includes(p.group_id));
    },
    enabled: userGroups.length > 0
  });

  const { data: trendingPosts = [], isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-posts'],
    queryFn: async () => {
      const allPosts = await base44.entities.Post.list('-created_date', 100);
      return allPosts
        .sort((a, b) => {
          const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
          const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
          return scoreB - scoreA;
        })
        .slice(0, 20);
    }
  });

  const getFilteredContent = () => {
    let content = [];

    if (contentType === 'all' || contentType === 'posts') {
      content = [...content, ...posts.map(p => ({ ...p, type: 'post' }))];
    }

    if (contentType === 'all' || contentType === 'group-posts') {
      content = [...content, ...groupPosts.map(p => ({ ...p, type: 'group-post' }))];
    }

    if (contentType === 'all' || contentType === 'trending') {
      content = [...content, ...trendingPosts.map(p => ({ ...p, type: 'trending' }))];
    }

    // Remove duplicates and sort by date
    const uniqueContent = Array.from(new Map(content.map(item => [item.id, item])).values());
    return uniqueContent.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  };

  const filteredContent = getFilteredContent();
  const isLoading = postsLoading || groupPostsLoading || trendingLoading;

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-blue-900 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <SEO 
        title="Discover - Personalized Feed | Encircle Net"
        description="Discover content from your groups, creators you follow, and trending posts"
      />

      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-40 border-b border-gray-200 shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Discover
          </h1>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={contentType} onValueChange={setContentType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Content Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Content</SelectItem>
              <SelectItem value="posts">Following</SelectItem>
              <SelectItem value="group-posts">My Groups</SelectItem>
              <SelectItem value="trending">Trending</SelectItem>
            </SelectContent>
          </Select>

          {userGroups.length > 0 && (contentType === 'all' || contentType === 'group-posts') && (
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Groups</SelectItem>
                {userGroups.map(group => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.group_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* AI Suggestions */}
        <AISuggestions
          title="Recommended For You"
          suggestions={[
            {
              type: 'trending',
              title: 'Trending: Freelance Design',
              description: '50+ new gigs posted today',
              cta: 'Explore',
              action: 'browse_design'
            },
            {
              type: 'earning',
              title: 'High-Paying Tasks',
              description: 'Earn $50-$200 per project',
              cta: 'Start',
              action: 'start_task'
            },
            {
              type: 'community',
              title: 'Join Digital Marketing Group',
              description: '2.5K active members',
              cta: 'Join',
              action: 'join_group'
            }
          ]}
          onAction={(suggestion) => {
            if (suggestion.action === 'browse_design') window.location.href = '/search';
            if (suggestion.action === 'start_task') window.location.href = '/create';
            if (suggestion.action === 'join_group') window.location.href = '/groups';
          }}
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="border-2 border-purple-200">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-900">{following.length}</p>
              <p className="text-xs text-gray-600">Following</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-pink-200">
            <CardContent className="p-4 text-center">
              <Users className="w-6 h-6 text-pink-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-900">{userGroups.length}</p>
              <p className="text-xs text-gray-600">Groups</p>
            </CardContent>
          </Card>
          <Card className="border-2 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-900">{trendingPosts.length}</p>
              <p className="text-xs text-gray-600">Trending</p>
            </CardContent>
          </Card>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        )}

        {!isLoading && filteredContent.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold mb-2 text-gray-700">No content yet</h3>
            <p className="text-gray-500 mb-4">Follow creators or join groups to see personalized content</p>
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => window.location.href = '/search'}
                className="gradient-bg-primary text-white"
              >
                Find Creators
              </Button>
              <Button 
                onClick={() => window.location.href = '/groups'}
                variant="outline"
              >
                Browse Groups
              </Button>
            </div>
          </div>
        )}

        {!isLoading && filteredContent.map(item => {
          if (item.type === 'group-post') {
            return <GroupPostCard key={item.id} post={item} currentUser={user} />;
          }
          return <PostCard key={item.id} post={item} currentUser={user} />;
        })}
      </div>
    </div>
  );
}