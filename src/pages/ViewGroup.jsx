import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Users, Calendar, MessageSquare, Settings, UserPlus, LogOut, Shield } from 'lucide-react';
import { createPageUrl } from '../utils';
import GroupPostCard from '../components/groups/GroupPostCard';
import GroupEventCard from '../components/groups/GroupEventCard';
import CreateGroupPost from '../components/groups/CreateGroupPost';
import CreateGroupEvent from '../components/groups/CreateGroupEvent';
import GroupMembersList from '../components/groups/GroupMembersList';

export default function ViewGroup() {
  const [user, setUser] = useState(null);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const queryClient = useQueryClient();

  const urlParams = new URLSearchParams(window.location.search);
  const groupId = urlParams.get('id');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: group } = useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const groups = await base44.entities.CreatorGroup.filter({ id: groupId });
      return groups[0];
    },
    enabled: !!groupId
  });

  const { data: membership } = useQuery({
    queryKey: ['group-membership', groupId, user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ 
      group_id: groupId,
      user_email: user?.email 
    }),
    enabled: !!groupId && !!user?.email,
    initialData: []
  });

  const { data: posts } = useQuery({
    queryKey: ['group-posts', groupId],
    queryFn: () => base44.entities.GroupPost.filter({ group_id: groupId }, '-created_date'),
    enabled: !!groupId,
    initialData: []
  });

  const { data: events } = useQuery({
    queryKey: ['group-events', groupId],
    queryFn: () => base44.entities.GroupEvent.filter({ group_id: groupId }, 'event_date'),
    enabled: !!groupId,
    initialData: []
  });

  const { data: members } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.GroupMembership.filter({ group_id: groupId }),
    enabled: !!groupId,
    initialData: []
  });

  const joinMutation = useMutation({
    mutationFn: () => base44.entities.GroupMembership.create({
      group_id: groupId,
      user_email: user.email,
      role: 'member'
    }),
    onSuccess: async () => {
      queryClient.invalidateQueries(['group-membership']);
      queryClient.invalidateQueries(['group-members']);
      await base44.entities.CreatorGroup.update(groupId, {
        member_count: (group.member_count || 0) + 1
      });
      queryClient.invalidateQueries(['group']);
    }
  });

  const leaveMutation = useMutation({
    mutationFn: async () => {
      const membershipRecord = membership[0];
      await base44.entities.GroupMembership.delete(membershipRecord.id);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries(['group-membership']);
      queryClient.invalidateQueries(['group-members']);
      await base44.entities.CreatorGroup.update(groupId, {
        member_count: Math.max(0, (group.member_count || 0) - 1)
      });
      queryClient.invalidateQueries(['group']);
    }
  });

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const isMember = membership.length > 0;
  const isOwner = user?.email === group.creator_email;
  const canPost = isMember || !group.is_private;

  return (
    <div className="max-w-6xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Cover Image */}
      {group.cover_image && (
        <div className="w-full h-48 relative">
          <img src={group.cover_image} alt={group.group_name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold gradient-text mb-2">{group.group_name}</h1>
            <p className="text-gray-600 mb-2">{group.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {group.member_count || 0} members
              </span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {group.category}
              </span>
              {group.is_private && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                  Private
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {!isMember && !isOwner && (
              <Button
                onClick={() => joinMutation.mutate()}
                disabled={joinMutation.isPending}
                className="gradient-bg-primary"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Join Group
              </Button>
            )}
            {isMember && !isOwner && (
              <Button
                variant="outline"
                onClick={() => leaveMutation.mutate()}
                disabled={leaveMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Leave
              </Button>
            )}
            {isOwner && (
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Tabs defaultValue="posts">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="posts" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="events" className="gap-2">
              <Calendar className="w-4 h-4" />
              Events
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            {canPost && (
              <div className="mb-6">
                {!showPostForm ? (
                  <Button
                    onClick={() => setShowPostForm(true)}
                    className="w-full gradient-bg-primary"
                  >
                    Create Post
                  </Button>
                ) : (
                  <CreateGroupPost
                    groupId={groupId}
                    user={user}
                    onSuccess={() => {
                      setShowPostForm(false);
                      queryClient.invalidateQueries(['group-posts']);
                    }}
                    onCancel={() => setShowPostForm(false)}
                  />
                )}
              </div>
            )}

            <div className="space-y-4">
              {posts.map(post => (
                <GroupPostCard key={post.id} post={post} currentUser={user} />
              ))}
              {posts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">No posts yet. Be the first to share!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            {canPost && (
              <div className="mb-6">
                {!showEventForm ? (
                  <Button
                    onClick={() => setShowEventForm(true)}
                    className="w-full gradient-bg-primary"
                  >
                    Create Event
                  </Button>
                ) : (
                  <CreateGroupEvent
                    groupId={groupId}
                    user={user}
                    onSuccess={() => {
                      setShowEventForm(false);
                      queryClient.invalidateQueries(['group-events']);
                    }}
                    onCancel={() => setShowEventForm(false)}
                  />
                )}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {events.map(event => (
                <GroupEventCard key={event.id} event={event} currentUser={user} />
              ))}
            </div>
            {events.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No upcoming events</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="members">
            <GroupMembersList 
              members={members} 
              groupId={groupId}
              isOwner={isOwner}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}