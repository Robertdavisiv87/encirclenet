import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Settings, 
  Grid3X3, 
  Mic, 
  Bookmark, 
  Users,
  Edit,
  Link as LinkIcon,
  DollarSign,
  LogOut,
  Crown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import TierBadge from '../components/monetization/TierBadge';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: myPosts } = useQuery({
    queryKey: ['my-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({ created_by: user?.email }, '-created_date'),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['followers', user?.email],
    queryFn: () => base44.entities.Follow.filter({ following_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: following } = useQuery({
    queryKey: ['following', user?.email],
    queryFn: () => base44.entities.Follow.filter({ follower_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: transactions } = useQuery({
    queryKey: ['my-earnings', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ to_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const totalEarnings = transactions.reduce((sum, t) => sum + (t.amount || 0), 0);

  const { data: subscription } = useQuery({
    queryKey: ['profile-subscription', user?.email],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: user?.email,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!user?.email
  });

  const handleLogout = () => {
    base44.auth.logout();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-zinc-500 mb-4">Please sign in to view your profile</p>
          <Button 
            onClick={() => base44.auth.redirectToLogin()}
            className="bg-gradient-to-r from-purple-600 to-pink-500"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <h1 className="text-xl font-bold">{user.full_name || 'User'}</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" className="text-zinc-400">
            <Settings className="w-5 h-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-400"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start gap-8 mb-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-purple-500/30">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-3xl">
              {user.full_name?.[0] || user.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-bold">{user.full_name || 'User'}</h2>
              <TierBadge tier={subscription?.tier || 'free'} size="md" />
              <Button variant="outline" size="sm" className="border-zinc-700">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <p className="font-bold">{myPosts.length}</p>
                <p className="text-sm text-zinc-500">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{followers.length}</p>
                <p className="text-sm text-zinc-500">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{following.length}</p>
                <p className="text-sm text-zinc-500">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-400">${totalEarnings}</p>
                <p className="text-sm text-zinc-500">Earned</p>
              </div>
            </div>

            <p className="text-sm text-zinc-300 mb-2">{user.bio || 'No bio yet'}</p>
            {user.website && (
              <a href={user.website} className="text-sm text-purple-400 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {user.website}
              </a>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={() => window.location.href = '/subscription'}
            variant="outline"
            className="border-purple-500/50"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Tier
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
            <Users className="w-4 h-4 mr-2" />
            My Circle
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="w-full bg-transparent border-t border-zinc-800 rounded-none">
          <TabsTrigger 
            value="posts" 
            className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-white rounded-none"
          >
            <Grid3X3 className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="voice" 
            className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-white rounded-none"
          >
            <Mic className="w-5 h-5" />
          </TabsTrigger>
          <TabsTrigger 
            value="saved" 
            className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-white rounded-none"
          >
            <Bookmark className="w-5 h-5" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          {myPosts.length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">No Posts Yet</p>
              <p className="text-sm">Start sharing your story with VibePosts</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {myPosts.map(post => (
                <div 
                  key={post.id}
                  className="aspect-square relative group cursor-pointer overflow-hidden"
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
                    {post.tips_received > 0 && (
                      <span className="text-yellow-400 font-semibold">💰 ${post.tips_received}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="voice" className="mt-0">
          <div className="text-center py-20 text-zinc-500">
            <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Voice Notes</p>
            <p className="text-sm">Your voice posts will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-20 text-zinc-500">
            <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Saved Posts</p>
            <p className="text-sm">Save posts to view them later</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}