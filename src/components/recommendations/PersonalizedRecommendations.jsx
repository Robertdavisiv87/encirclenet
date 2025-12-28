import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../../utils';

export default function PersonalizedRecommendations({ user }) {
  // Get user's group memberships
  const { data: myGroups = [] } = useQuery({
    queryKey: ['my-groups', user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ user_email: user?.email }),
    enabled: !!user?.email
  });

  // Get user's preferences
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user?.email });
      return prefs[0];
    },
    enabled: !!user?.email
  });

  // Get user's followed creators
  const { data: following = [] } = useQuery({
    queryKey: ['following', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user?.email }),
    enabled: !!user?.email
  });

  // Recommended groups based on preferences
  const { data: recommendedGroups = [] } = useQuery({
    queryKey: ['recommended-groups', preferences?.preferred_categories],
    queryFn: async () => {
      if (!preferences?.preferred_categories?.length) {
        return await base44.entities.CreatorGroup.list('-member_count', 5);
      }
      const allGroups = await base44.entities.CreatorGroup.list('-member_count', 20);
      return allGroups.filter(g => 
        preferences.preferred_categories.includes(g.category)
      ).slice(0, 5);
    },
    enabled: !!user?.email
  });

  // Recommended users based on groups
  const { data: recommendedUsers = [] } = useQuery({
    queryKey: ['recommended-users', myGroups],
    queryFn: async () => {
      if (myGroups.length === 0) {
        const allUsers = await base44.entities.User.list('-created_date', 10);
        return allUsers.filter(u => u.email !== user?.email).slice(0, 5);
      }
      
      const groupIds = myGroups.map(g => g.group_id);
      const memberships = await base44.entities.GroupMembership.list('-created_date', 50);
      const usersInMyGroups = memberships
        .filter(m => groupIds.includes(m.group_id) && m.user_email !== user?.email)
        .map(m => m.user_email);
      
      const uniqueUsers = [...new Set(usersInMyGroups)].slice(0, 5);
      const allUsers = await base44.entities.User.list();
      return allUsers.filter(u => uniqueUsers.includes(u.email));
    },
    enabled: !!user?.email && myGroups.length > 0
  });

  // Trending posts from followed creators
  const { data: recommendedPosts = [] } = useQuery({
    queryKey: ['recommended-posts', following],
    queryFn: async () => {
      const followingEmails = following.map(f => f.following_email);
      if (followingEmails.length === 0) {
        return await base44.entities.Post.list('-likes_count', 5);
      }
      const allPosts = await base44.entities.Post.list('-created_date', 50);
      return allPosts
        .filter(p => followingEmails.includes(p.created_by))
        .sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0))
        .slice(0, 5);
    },
    enabled: !!user?.email
  });

  // Upcoming events in user's groups
  const { data: upcomingEvents = [] } = useQuery({
    queryKey: ['upcoming-events', myGroups],
    queryFn: async () => {
      const groupIds = myGroups.map(g => g.group_id);
      if (groupIds.length === 0) return [];
      const allEvents = await base44.entities.GroupEvent.list('event_date', 20);
      const now = new Date();
      return allEvents.filter(e => 
        groupIds.includes(e.group_id) && new Date(e.event_date) > now
      ).slice(0, 3);
    },
    enabled: !!user?.email && myGroups.length > 0
  });

  if (!user) return null;

  return (
    <div className="space-y-4 mb-6">
      {/* Recommended Groups */}
      {recommendedGroups.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="w-5 h-5 text-purple-600" />
              Recommended Groups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendedGroups.slice(0, 3).map((group, index) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => window.location.href = `${createPageUrl('ViewGroup')}?id=${group.id}`}
                >
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">{group.group_name}</p>
                    <p className="text-xs text-gray-600">{group.member_count || 0} members</p>
                  </div>
                  <Button size="sm" variant="outline">Join</Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggested Connections */}
      {recommendedUsers.length > 0 && (
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-blue-600" />
              People You May Know
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendedUsers.slice(0, 3).map((user, index) => (
                <motion.div
                  key={user.email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
                  onClick={() => window.location.href = `${createPageUrl('ViewProfile')}?email=${user.email}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.full_name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-blue-900">{user.full_name}</p>
                      <p className="text-xs text-gray-600">From your groups</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">Follow</Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 bg-white rounded-lg hover:shadow-md transition-all cursor-pointer"
                >
                  <p className="font-semibold text-blue-900 text-sm">{event.title}</p>
                  <p className="text-xs text-gray-600">
                    {new Date(event.event_date).toLocaleDateString()}
                  </p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}