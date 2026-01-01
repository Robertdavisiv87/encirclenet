import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import PostCard from './PostCard';
import { Loader2, Filter } from 'lucide-react';

export default function FilteredFeed({ user, onLike, onTip }) {
  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const prefs = await base44.entities.UserPreference.filter({ user_email: user.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: allPosts = [], isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const posts = await base44.entities.Post.list('-created_date', 100);
        return posts.filter(post => 
          post.moderation_status !== 'pending_review' && 
          post.moderation_status !== 'rejected'
        );
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        return [];
      }
    },
    initialData: [],
    staleTime: 30000,
    retry: 2
  });

  // Filter posts based on user preferences
  const filteredPosts = React.useMemo(() => {
    if (!preferences?.preferred_categories || preferences.preferred_categories.length === 0) {
      return allPosts;
    }

    return allPosts.filter(post => {
      // Include posts that have matching tags
      if (post.tags?.some(tag => 
        preferences.preferred_categories.some(cat => 
          tag.toLowerCase().includes(cat.toLowerCase())
        )
      )) {
        return true;
      }

      // Include posts from followed creators
      if (post.created_by === user?.email) {
        return true;
      }

      return false;
    });
  }, [allPosts, preferences, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {preferences?.preferred_categories?.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 rounded-lg p-3 border border-purple-200">
          <Filter className="w-4 h-4 text-purple-600" />
          <span>Showing content based on your preferences</span>
        </div>
      )}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500">No posts match your preferences yet</p>
        </div>
      ) : (
        filteredPosts.map((post) => (
          <PostCard 
            key={post.id}
            post={post} 
            currentUser={user}
            onLike={onLike}
            onTip={onTip}
          />
        ))
      )}
    </div>
  );
}