import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search as SearchIcon, Users, Loader2, Calendar, MessageSquare } from 'lucide-react';
import { createPageUrl } from '../utils';
import SEO from '../components/SEO';
import SearchFilters from '../components/search/SearchFilters';
import PersonalizedRecommendations from '../components/recommendations/PersonalizedRecommendations';
import moment from 'moment';

export default function Search() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [contentType, setContentType] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const allUsers = await base44.asServiceRole.entities.User.list();
      return allUsers.filter(u => 
        u.full_name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        u.bio?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    },
    enabled: debouncedQuery.length > 0 && (contentType === 'all' || contentType === 'users')
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['search-posts', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const allPosts = await base44.entities.Post.list('-created_date', 100);
      return allPosts.filter(p => 
        p.caption?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.tags?.some(t => t.toLowerCase().includes(debouncedQuery.toLowerCase()))
      );
    },
    enabled: debouncedQuery.length > 0 && (contentType === 'all' || contentType === 'posts')
  });

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['search-groups', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const allGroups = await base44.entities.CreatorGroup.list('-created_date');
      return allGroups.filter(g => 
        g.group_name?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        g.description?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        g.category?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    },
    enabled: debouncedQuery.length > 0 && (contentType === 'all' || contentType === 'groups')
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['search-events', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const allEvents = await base44.entities.GroupEvent.list('event_date', 50);
      return allEvents.filter(e => 
        e.title?.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        e.description?.toLowerCase().includes(debouncedQuery.toLowerCase())
      );
    },
    enabled: debouncedQuery.length > 0 && (contentType === 'all' || contentType === 'events')
  });

  const sortResults = (items, type) => {
    if (!items || items.length === 0) return items;
    
    const sorted = [...items];
    switch (sortBy) {
      case 'date':
        return sorted.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
      case 'popularity':
        if (type === 'users') return sorted;
        if (type === 'posts') return sorted.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        if (type === 'groups') return sorted.sort((a, b) => (b.member_count || 0) - (a.member_count || 0));
        if (type === 'events') return sorted.sort((a, b) => (b.attendees?.length || 0) - (a.attendees?.length || 0));
        return sorted;
      case 'trending':
        if (type === 'posts') {
          return sorted.sort((a, b) => {
            const scoreA = (a.likes_count || 0) + (a.comments_count || 0) * 2;
            const scoreB = (b.likes_count || 0) + (b.comments_count || 0) * 2;
            return scoreB - scoreA;
          });
        }
        return sorted;
      default:
        return sorted;
    }
  };

  const sortedUsers = sortResults(users, 'users');
  const sortedPosts = sortResults(posts, 'posts');
  const sortedGroups = sortResults(groups, 'groups');
  const sortedEvents = sortResults(events, 'events');

  const isLoading = usersLoading || postsLoading || groupsLoading || eventsLoading;
  const hasResults = users.length > 0 || posts.length > 0 || groups.length > 0 || events.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <SEO 
        title="Search - Encircle Net"
        description="Search for users, posts, groups, and events on Encircle Net"
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold gradient-text mb-2">Search</h1>
        <p className="text-gray-600">Find people, posts, groups, and events</p>
      </div>

      <div className="relative mb-6">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search anything..."
          className="pl-10 h-12 text-base border-2 border-purple-200 focus:border-purple-400"
        />
      </div>

      <SearchFilters
        contentType={contentType}
        onContentTypeChange={setContentType}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {!debouncedQuery && (
        <PersonalizedRecommendations user={user} />
      )}

      {isLoading && debouncedQuery && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      )}

      {!isLoading && debouncedQuery && !hasResults && (
        <div className="text-center py-20">
          <SearchIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2 text-gray-700">No results found</h3>
          <p className="text-gray-500">Try different keywords or filters</p>
        </div>
      )}

      {!isLoading && sortedPosts.length > 0 && (contentType === 'all' || contentType === 'posts') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Posts ({sortedPosts.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sortedPosts.map(post => (
              <Card key={post.id} className="hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-2">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>{post.author_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{post.author_name}</p>
                      <p className="text-xs text-gray-500">{moment(post.created_date).fromNow()}</p>
                    </div>
                  </div>
                  {post.media_url && (
                    <img src={post.media_url} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                  )}
                  <p className="text-sm text-gray-700 line-clamp-2">{post.caption}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>{post.likes_count || 0} likes</span>
                    <span>{post.comments_count || 0} comments</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && sortedGroups.length > 0 && (contentType === 'all' || contentType === 'groups') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Groups ({sortedGroups.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedGroups.map(group => (
              <Card 
                key={group.id}
                className="hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200"
                onClick={() => window.location.href = `${createPageUrl('ViewGroup')}?id=${group.id}`}
              >
                <CardContent className="p-4">
                  {group.cover_image && (
                    <img src={group.cover_image} alt={group.group_name} className="w-full h-24 object-cover rounded-lg mb-3" />
                  )}
                  <h3 className="font-bold text-blue-900 mb-1">{group.group_name}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{group.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{group.member_count || 0} members</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && sortedEvents.length > 0 && (contentType === 'all' || contentType === 'events') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Events ({sortedEvents.length})
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {sortedEvents.map(event => (
              <Card key={event.id} className="hover:shadow-lg transition-all border-2 border-gray-200">
                <CardContent className="p-4">
                  <h3 className="font-bold text-blue-900 mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">{event.description}</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-600" />
                      <span>{moment(event.event_date).format('MMM D, YYYY [at] h:mm A')}</span>
                    </div>
                    {event.attendees?.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span>{event.attendees.length} attending</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {!isLoading && sortedUsers.length > 0 && (contentType === 'all' || contentType === 'users') && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            People ({sortedUsers.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedUsers.map(foundUser => (
              <Card
                key={foundUser.id}
                className="hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200"
                onClick={() => window.location.href = `${createPageUrl('ViewProfile')}?email=${foundUser.email}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={foundUser.avatar} />
                      <AvatarFallback>{foundUser.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{foundUser.full_name}</p>
                      <p className="text-xs text-gray-500 truncate">{foundUser.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}