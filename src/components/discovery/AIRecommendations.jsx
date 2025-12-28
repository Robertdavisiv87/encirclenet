import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Sparkles, Loader2, Users, Hash, Tv } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function AIRecommendations({ user }) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: recommendations, refetch } = useQuery({
    queryKey: ['ai-recommendations', user?.email],
    queryFn: async () => {
      // Get user's engagement history
      const likes = await base44.entities.Like.filter({ user_email: user?.email });
      const follows = await base44.entities.Follow.filter({ follower_email: user?.email });
      
      // Build context for AI
      const context = {
        liked_posts: likes.length,
        following_count: follows.length,
        user_categories: user?.niche_categories || []
      };

      // Get AI recommendations
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this user's activity: ${JSON.stringify(context)}, recommend 5 creators, 5 hashtags, and 3 content channels they would enjoy. Return as JSON with format: {"creators": [{"name": "...", "reason": "..."}], "hashtags": ["..."], "channels": [{"name": "...", "category": "..."}]}`,
        response_json_schema: {
          type: "object",
          properties: {
            creators: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  reason: { type: "string" }
                }
              }
            },
            hashtags: {
              type: "array",
              items: { type: "string" }
            },
            channels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      return result;
    },
    enabled: !!user?.email,
    staleTime: 300000 // Cache for 5 minutes
  });

  const handleRefresh = async () => {
    setIsGenerating(true);
    await refetch();
    setTimeout(() => setIsGenerating(false), 1000);
  };

  if (!recommendations) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Generating personalized recommendations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300 realistic-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Recommendations
          </CardTitle>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isGenerating}
            className="border-purple-400"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recommended Creators */}
        {recommendations.creators && recommendations.creators.length > 0 && (
          <div>
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Creators You Might Like
            </h4>
            <div className="space-y-2">
              {recommendations.creators.slice(0, 3).map((creator, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-3 border border-purple-200"
                >
                  <p className="font-semibold text-blue-900">{creator.name}</p>
                  <p className="text-xs text-gray-600">{creator.reason}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Hashtags */}
        {recommendations.hashtags && recommendations.hashtags.length > 0 && (
          <div>
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-600" />
              Trending Topics
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendations.hashtags.slice(0, 5).map((tag, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1 bg-white rounded-full text-sm font-semibold text-purple-700 border border-purple-300 cursor-pointer hover:shadow-md transition-all"
                >
                  #{tag}
                </motion.span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Channels */}
        {recommendations.channels && recommendations.channels.length > 0 && (
          <div>
            <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Tv className="w-4 h-4 text-purple-600" />
              Channels to Explore
            </h4>
            <div className="space-y-2">
              {recommendations.channels.map((channel, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white rounded-xl p-3 border border-purple-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-blue-900">{channel.name}</p>
                    <p className="text-xs text-gray-600">{channel.category}</p>
                  </div>
                  <Button size="sm" className="gradient-bg-primary text-white">
                    Explore
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}