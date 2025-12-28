import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  Grid3X3, 
  Mic, 
  Lock,
  Users,
  Heart,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import TierBadge from '../components/monetization/TierBadge';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import StreakDisplay from '../components/gamification/StreakDisplay';
import SEO from '../components/SEO';
import { createPageUrl } from '../utils';
import HireMeButton from '../components/profile/HireMeButton';
import CollaborationsShowcase from '../components/profile/CollaborationsShowcase';
import PortfolioSection from '../components/profile/PortfolioSection';
import { ExternalLink, Briefcase, CheckCircle } from 'lucide-react';

export default function ViewProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const profileEmail = urlParams.get('email');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (e) {}

      if (profileEmail) {
        try {
          const users = await base44.entities.User.filter({ email: profileEmail });
          if (users.length > 0) {
            setProfileUser(users[0]);
          }
        } catch (e) {}
      }
    };
    loadUsers();
  }, [profileEmail]);

  useEffect(() => {
    const checkFollowing = async () => {
      if (!currentUser || !profileEmail) return;
      try {
        const follows = await base44.entities.Follow.filter({
          follower_email: currentUser.email,
          following_email: profileEmail
        });
        setIsFollowing(follows.length > 0);
      } catch (e) {}
    };
    checkFollowing();
  }, [currentUser, profileEmail]);

  const { data: posts } = useQuery({
    queryKey: ['user-posts', profileEmail],
    queryFn: () => base44.entities.Post.filter({ created_by: profileEmail }, '-created_date'),
    enabled: !!profileEmail,
    initialData: []
  });

  const { data: followers } = useQuery({
    queryKey: ['user-followers', profileEmail],
    queryFn: () => base44.entities.Follow.filter({ following_email: profileEmail }),
    enabled: !!profileEmail,
    initialData: []
  });

  const { data: following } = useQuery({
    queryKey: ['user-following', profileEmail],
    queryFn: () => base44.entities.Follow.filter({ follower_email: profileEmail }),
    enabled: !!profileEmail,
    initialData: []
  });

  const { data: subscription } = useQuery({
    queryKey: ['view-subscription', profileEmail],
    queryFn: async () => {
      const subs = await base44.entities.Subscription.filter({ 
        user_email: profileEmail,
        status: 'active'
      });
      return subs[0];
    },
    enabled: !!profileEmail
  });

  const { data: badges } = useQuery({
    queryKey: ['view-badges', profileEmail],
    queryFn: () => base44.entities.Badge.filter({ user_email: profileEmail }),
    enabled: !!profileEmail,
    initialData: []
  });

  const { data: userStats } = useQuery({
    queryKey: ['view-stats', profileEmail],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ user_email: profileEmail });
      return stats[0] || null;
    },
    enabled: !!profileEmail
  });

  const handleFollow = async () => {
    if (!currentUser) {
      base44.auth.redirectToLogin();
      return;
    }

    if (isFollowing) {
      const follows = await base44.entities.Follow.filter({
        follower_email: currentUser.email,
        following_email: profileEmail
      });
      if (follows.length > 0) {
        await base44.entities.Follow.delete(follows[0].id);
      }
      setIsFollowing(false);
    } else {
      await base44.entities.Follow.create({
        follower_email: currentUser.email,
        follower_name: currentUser.full_name,
        following_email: profileEmail,
        following_name: profileUser?.full_name || 'User'
      });
      setIsFollowing(true);
    }
  };

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">User not found</p>
          <Button 
            onClick={() => window.location.href = createPageUrl('Home')}
            className="mt-4"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Check if profile is private
  const isPrivate = profileUser.is_private && currentUser?.email !== profileEmail;

  const isOwner = currentUser?.email === profileEmail;

  const getThemeStyles = (theme) => {
    const themes = {
      default: 'from-purple-50 via-white to-pink-50',
      dark: 'from-gray-900 via-gray-800 to-black',
      minimal: 'from-white via-gray-50 to-white',
      vibrant: 'from-orange-50 via-red-50 to-pink-50',
      elegant: 'from-indigo-50 via-purple-50 to-pink-50',
      professional: 'from-blue-50 via-cyan-50 to-white'
    };
    return themes[theme] || themes.default;
  };

  return (
    <div className={`max-w-4xl mx-auto bg-gradient-to-b ${getThemeStyles(profileUser.profile_theme || 'default')} min-h-screen`}>
      <SEO 
        title={`${profileUser.full_name || 'User'} Profile - Encircle Net`}
        description={`View ${profileUser.full_name || 'User'}'s profile on Encircle Net`}
      />

      {/* Banner */}
      {profileUser.profile_banner && (
        <div className="relative w-full h-48 md:h-64">
          <img 
            src={profileUser.profile_banner} 
            alt="Profile Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-blue-900">{profileUser.full_name || 'User'}</h1>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        <div className="flex items-start gap-8 mb-6">
          <Avatar className="w-24 h-24 md:w-32 md:h-32 ring-4 ring-purple-500/30 shadow-glow">
            <AvatarImage src={profileUser.avatar} />
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-500 text-3xl">
              {profileUser.full_name?.[0] || profileUser.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <h2 className="text-xl font-bold text-blue-900">{profileUser.full_name || 'User'}</h2>
              <TierBadge tier={subscription?.tier || 'free'} size="md" />
              {currentUser?.email !== profileEmail && (
                <Button 
                  onClick={handleFollow}
                  className={isFollowing ? "bg-gray-200 text-gray-700" : "gradient-bg-primary text-white shadow-glow"}
                >
                  {isFollowing ? 'Following' : '+ Follow'}
                </Button>
              )}
            </div>

            <div className="flex gap-8 mb-4">
              <div className="text-center">
                <p className="font-bold text-blue-900">{posts.length}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-900">{followers.length}</p>
                <p className="text-sm text-gray-600">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-blue-900">{following.length}</p>
                <p className="text-sm text-gray-600">Following</p>
              </div>
            </div>

            {profileUser.tagline && (
              <p className="text-sm font-semibold text-purple-700 mb-2">
                {profileUser.tagline}
              </p>
            )}
            
            <p className="text-sm text-blue-800 mb-2">{profileUser.bio || 'No bio yet'}</p>
            
            {profileUser.website && (
              <a href={profileUser.website} target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {profileUser.website}
              </a>
            )}

            {/* Professional Info */}
            {(profileUser.skills?.length > 0 || profileUser.services_offered?.length > 0) && (
              <div className="mt-4 space-y-3">
                {profileUser.skills?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileUser.services_offered?.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Services Offered</p>
                    <div className="flex flex-wrap gap-2">
                      {profileUser.services_offered.map((service, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {profileUser.availability_status && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full ${
                      profileUser.availability_status === 'available' ? 'bg-green-500' :
                      profileUser.availability_status === 'busy' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{profileUser.availability_status}</span>
                    {profileUser.hourly_rate > 0 && (
                      <span className="text-gray-500">• ${profileUser.hourly_rate}/hr</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Social Links */}
            {profileUser.social_links && Object.keys(profileUser.social_links).some(k => profileUser.social_links[k]) && (
              <div className="mt-4 flex gap-2">
                {Object.entries(profileUser.social_links).map(([platform, url]) => url && (
                  <a 
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-purple-500 text-gray-700 hover:text-white flex items-center justify-center transition-all"
                    title={platform}
                  >
                    {platform[0].toUpperCase()}
                  </a>
                ))}
              </div>
            )}

            {/* Gamification Stats */}
            {userStats && !isPrivate && (
              <div className="mt-4 space-y-3">
                <StreakDisplay 
                  currentStreak={userStats.current_streak || 0}
                  longestStreak={userStats.longest_streak || 0}
                  size="sm"
                />
                {badges.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-2">Badges Earned</p>
                    <BadgeShowcase badges={badges} maxDisplay={5} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Hire Me Button */}
        {!isOwner && profileUser.services_offered?.length > 0 && (
          <div className="mb-4">
            <HireMeButton creator={profileUser} />
          </div>
        )}

        {/* Portfolio & Collaborations */}
        {!isPrivate && (
          <div className="space-y-4 mb-6">
            <PortfolioSection userEmail={profileEmail} isOwner={isOwner} />
            <CollaborationsShowcase user={profileUser} isOwner={isOwner} />
          </div>
        )}
      </div>

      {/* Content Tabs */}
      {isPrivate ? (
        <div className="text-center py-20">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="font-semibold text-gray-700 mb-2">This Account is Private</p>
          <p className="text-sm text-gray-500">Follow this account to see their posts</p>
        </div>
      ) : (
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full bg-transparent border-t border-gray-200 rounded-none">
            <TabsTrigger 
              value="posts" 
              className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-purple-500 rounded-none"
            >
              <Grid3X3 className="w-5 h-5" />
            </TabsTrigger>
            <TabsTrigger 
              value="voice" 
              className="flex-1 data-[state=active]:border-t-2 data-[state=active]:border-purple-500 rounded-none"
            >
              <Mic className="w-5 h-5" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-0">
            {posts.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-medium mb-2">No Posts Yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1 p-1">
                {posts.map(post => (
                  <div 
                    key={post.id}
                    className="aspect-square relative group cursor-pointer overflow-hidden rounded-lg"
                  >
                    {post.content_type === 'photo' && post.media_url ? (
                      <img 
                        src={post.media_url} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    ) : post.content_type === 'text' ? (
                      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4">
                        <p className="text-sm text-center line-clamp-3 text-blue-900">{post.caption}</p>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <span className="text-2xl">
                          {post.content_type === 'video' ? '🎬' : '🎤'}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <span className="text-white font-semibold flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.likes_count || 0}
                      </span>
                      {post.tips_received > 0 && (
                        <span className="text-yellow-400 font-semibold flex items-center gap-1">
                          <DollarSign className="w-4 h-4" /> ${post.tips_received}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="voice" className="mt-0">
            <div className="text-center py-20 text-gray-500">
              <Mic className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium mb-2">Voice Notes</p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}