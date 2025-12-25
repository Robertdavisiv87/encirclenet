import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PostCard from '../components/feed/PostCard';
import StoryBar from '../components/feed/StoryBar';
import { Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: posts, isLoading, refetch } = useQuery({
    queryKey: ['posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 50),
    initialData: []
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-lg z-40 border-b border-zinc-800">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold gradient-text">CircleNet</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="text-zinc-400 hover:text-white"
          >
            <RefreshCw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Stories */}
      <div className="border-b border-zinc-800">
        <StoryBar currentUser={user} />
      </div>

      {/* Feed */}
      <div className="p-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <span className="text-4xl">🌟</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Welcome to CircleNet!</h3>
            <p className="text-zinc-500 mb-6">
              Your feed is empty. Start creating content or follow others to see posts.
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-500">
              Create Your First Post
            </Button>
          </div>
        ) : (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user}
              onLike={() => queryClient.invalidateQueries(['posts'])}
              onTip={() => queryClient.invalidateQueries(['posts'])}
            />
          ))
        )}
      </div>
    </div>
  );
}