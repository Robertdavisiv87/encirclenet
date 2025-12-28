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
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import TierBadge from '../components/monetization/TierBadge';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import StreakDisplay from '../components/gamification/StreakDisplay';
import SEO from '../components/SEO';
import EditProfileModal from '../components/profile/EditProfileModal';
import StreakModal from '../components/gamification/StreakModal';
import FollowersModal from '../components/profile/FollowersModal';
import { createPageUrl } from '../utils';
import { Switch } from '@/components/ui/switch';
import ImageLightbox from '../components/ui/ImageLightbox';
import VideoPlayer from '../components/video/VideoPlayer';
import ProfileCustomization from '../components/profile/ProfileCustomization';
import CollaborationsShowcase from '../components/profile/CollaborationsShowcase';
import PortfolioSection from '../components/profile/PortfolioSection';
import VideoPlayer from '../components/video/VideoPlayer';
import ContentPreferences from '../components/profile/ContentPreferences';
import PointsDisplay from '../components/gamification/PointsDisplay';
import CreatorEarningsCard from '../components/monetization/CreatorEarningsCard';
import CreatorTierManager from '../components/monetization/CreatorTierManager';
import { Briefcase, Palette } from 'lucide-react';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);

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

  const { data: badges } = useQuery({
    queryKey: ['profile-badges', user?.email],
    queryFn: () => base44.entities.Badge.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: userStats } = useQuery({
    queryKey: ['profile-stats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ user_email: user?.email });
      return stats[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: userPoints } = useQuery({
    queryKey: ['user-points-profile', user?.email],
    queryFn: async () => {
      const points = await base44.entities.UserPoints.filter({ user_email: user?.email });
      return points[0] || null;
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
      <SEO 
        title={`${user.full_name || 'User'} Profile - EncircleNet`}
        description={`View ${user.full_name || 'User'}'s profile, posts, and earnings on EncircleNet. Connect with creators and build your circle.`}
        keywords="creator profile, social media profile, influencer profile, earnings dashboard, content creator"
      />
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <h1 className="text-xl font-bold">{user.full_name || 'User'}</h1>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-zinc-400"
            onClick={() => window.location.href = createPageUrl('Settings')}
          >
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
          <div className="relative group cursor-pointer">
            <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-purple-500/30">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-3xl">
                {user.full_name?.[0] || user.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div 
              className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const { file_url } = await base44.integrations.Core.UploadFile({ file });
                      await base44.auth.updateMe({ avatar: file_url });
                      setUser({ ...user, avatar: file_url });
                    } catch (error) {
                      alert('Failed to upload photo');
                    }
                  }
                };
                input.click();
              }}
            >
              <div className="text-center">
                <Edit className="w-6 h-6 text-white mx-auto mb-1" />
                <p className="text-white text-xs font-semibold">Change Photo</p>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-bold">{user.full_name || 'User'}</h2>
              <TierBadge tier={subscription?.tier || 'free'} size="md" />
              <Button 
                variant="outline" 
                size="sm" 
                className="border-zinc-700"
                onClick={() => setShowEditModal(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="flex gap-8 mb-4">
              <div 
                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => window.location.href = createPageUrl('Create')}
              >
                <p className="font-bold">{myPosts.length}</p>
                <p className="text-sm text-zinc-500">Posts</p>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setShowFollowersModal(true)}
              >
                <p className="font-bold">{followers.length}</p>
                <p className="text-sm text-zinc-500">Followers</p>
              </div>
              <div 
                className="text-center cursor-pointer hover:opacity-70 transition-opacity"
                onClick={() => setShowFollowersModal(true)}
              >
                <p className="font-bold">{following.length}</p>
                <p className="text-sm text-zinc-500">Following</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-green-400">${totalEarnings}</p>
                <p className="text-sm text-zinc-500">Earned</p>
              </div>
            </div>

            {user.tagline && (
              <p className="text-sm font-semibold text-purple-600 mb-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                {user.tagline}
              </p>
            )}

            <p className="text-sm text-black mb-2">{user.bio || 'No bio yet'}</p>
            {user.website && (
              <a href={user.website} className="text-sm text-purple-400 flex items-center gap-1">
                <LinkIcon className="w-3 h-3" />
                {user.website}
              </a>
            )}

            {/* Professional Info */}
            {(user.skills?.length > 0 || user.availability_status) && (
              <div className="mt-3 space-y-2">
                {user.skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {user.skills.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {user.availability_status && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full ${
                      user.availability_status === 'available' ? 'bg-green-500' :
                      user.availability_status === 'busy' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className="capitalize">{user.availability_status}</span>
                    {user.hourly_rate > 0 && (
                      <span className="text-gray-500">• ${user.hourly_rate}/hr</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Points Display */}
            {userPoints && (
              <div className="mt-3">
                <PointsDisplay userPoints={userPoints} compact />
              </div>
            )}

            {/* Gamification Stats */}
            {userStats && (
              <div className="mt-4 space-y-3">
                <div 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setShowStreakModal(true)}
                >
                  <StreakDisplay 
                    currentStreak={userStats.current_streak || 0}
                    longestStreak={userStats.longest_streak || 0}
                    size="sm"
                  />
                </div>
                {badges.length > 0 && (
                  <div>
                    <p className="text-xs text-zinc-500 mb-2">Badges Earned</p>
                    <BadgeShowcase badges={badges} maxDisplay={5} />
                  </div>
                )}
              </div>
            )}
            </div>
            </div>

        {/* Privacy Toggle */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-blue-900 text-sm">Private Account</p>
            <p className="text-xs text-gray-600">Only followers can see your posts</p>
          </div>
          <Switch
            checked={user?.is_private || false}
            onCheckedChange={async (checked) => {
              await base44.auth.updateMe({ is_private: checked });
              setUser({ ...user, is_private: checked });
            }}
          />
        </div>

        {/* Content Preferences */}
        <ContentPreferences user={user} />

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button 
            onClick={() => window.location.href = createPageUrl('Subscription')}
            variant="outline"
            className="border-purple-500/50"
          >
            <Crown className="w-4 h-4 mr-2" />
            {subscription?.tier === 'free' ? 'Upgrade (Free)' : `Tier: ${subscription?.tier || 'Free'}`}
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-pink-500"
            onClick={() => setShowCustomization(!showCustomization)}
          >
            <Palette className="w-4 h-4 mr-2" />
            Customize
          </Button>
        </div>

        {/* Profile Customization Section */}
        {showCustomization && (
          <div className="mb-6">
            <ProfileCustomization 
              user={user} 
              onSave={() => {
                setShowCustomization(false);
                const loadUser = async () => {
                  const currentUser = await base44.auth.me();
                  setUser(currentUser);
                };
                loadUser();
              }}
            />
          </div>
        )}

        {/* Creator Earnings */}
        <div className="mb-6">
          <CreatorEarningsCard creatorEmail={user.email} />
        </div>

        {/* Creator Tier Manager */}
        <div className="mb-6">
          <CreatorTierManager creatorEmail={user.email} />
        </div>

        {/* Portfolio & Collaborations */}
        <div className="space-y-4 mb-6">
          <PortfolioSection userEmail={user.email} isOwner={true} />
          <CollaborationsShowcase user={user} isOwner={true} />
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
                  onClick={() => {
                    if (post.content_type === 'photo' && post.media_url) {
                      setSelectedImage({ url: post.media_url, caption: post.caption });
                      setShowImageLightbox(true);
                    } else if (post.content_type === 'video' && post.media_url) {
                      setSelectedVideo({ url: post.media_url, caption: post.caption });
                      setShowVideoModal(true);
                    }
                  }}
                >
                  {post.content_type === 'photo' && post.media_url ? (
                    <img 
                      src={post.media_url} 
                      alt="" 
                      className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                    />
                  ) : post.content_type === 'video' && post.media_url ? (
                    <div className="w-full h-full bg-black relative">
                      <video 
                        src={post.media_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-l-8 border-l-purple-600 border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
                        </div>
                      </div>
                    </div>
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
          {myPosts.filter(p => p.content_type === 'voice').length === 0 ? (
            <div className="text-center py-20 text-zinc-500">
              <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">Voice Notes</p>
              <p className="text-sm">Your voice posts will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {myPosts.filter(p => p.content_type === 'voice').map(post => (
                <div 
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Mic className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-blue-900">{post.caption || 'Voice Note'}</p>
                      <p className="text-xs text-gray-500">{moment(post.created_date).fromNow()}</p>
                    </div>
                  </div>
                  {post.media_url && (
                    <audio controls className="w-full" src={post.media_url}>
                      Your browser does not support audio.
                    </audio>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                    <span>❤️ {post.likes_count || 0}</span>
                    <span>💬 {post.comments_count || 0}</span>
                    {post.tips_received > 0 && (
                      <span className="text-green-600">💰 ${post.tips_received}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="saved" className="mt-0">
          <div className="text-center py-20 text-zinc-500">
            <Bookmark className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-2">Saved Posts</p>
            <p className="text-sm">Save posts to view them later</p>
            <Button 
              className="mt-4 gradient-bg-primary text-white shadow-glow"
              onClick={() => window.location.href = createPageUrl('Explore')}
            >
              Explore Posts
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Modal */}
      <EditProfileModal 
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        currentUser={user}
        onSave={() => {
          const loadUser = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
          };
          loadUser();
        }}
      />

      {/* Streak Modal */}
      <StreakModal 
        isOpen={showStreakModal}
        onClose={() => setShowStreakModal(false)}
        userStats={userStats}
        posts={myPosts}
      />

      {/* Followers Modal */}
      <FollowersModal 
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        followers={followers}
        following={following}
        currentUser={user}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={showImageLightbox}
        imageUrl={selectedImage?.url}
        caption={selectedImage?.caption}
        onClose={() => {
          setShowImageLightbox(false);
          setSelectedImage(null);
        }}
      />

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowVideoModal(false);
            setSelectedVideo(null);
          }}
        >
          <div 
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setShowVideoModal(false);
                setSelectedVideo(null);
              }}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="bg-black rounded-xl overflow-hidden">
              <VideoPlayer 
                src={selectedVideo.url} 
                className="w-full"
                aspectRatio="video"
              />
              {selectedVideo.caption && (
                <div className="p-4 bg-zinc-900">
                  <p className="text-white">{selectedVideo.caption}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}