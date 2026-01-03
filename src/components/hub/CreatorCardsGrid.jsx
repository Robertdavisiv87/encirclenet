import React from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Eye, UserPlus, Briefcase, ExternalLink } from 'lucide-react';
import { createPageUrl } from '../../utils';

export default function CreatorCardsGrid({ creators, currentUser }) {
  const queryClient = useQueryClient();

  const followMutation = useMutation({
    mutationFn: async (creatorEmail) => {
      return await base44.entities.Follow.create({
        follower_email: currentUser?.email,
        following_email: creatorEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['following']);
    }
  });

  if (creators.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No creators found. Try adjusting your search or category.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {creators.map((creator, i) => (
        <motion.div
          key={creator.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Card className="hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-300 h-full">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="w-12 h-12 border-2 border-purple-300">
                  <AvatarImage src={creator.author_avatar} />
                  <AvatarFallback className="gradient-bg-primary text-white">
                    {creator.author_name?.[0] || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 text-sm">{creator.author_name}</h3>
                  <p className="text-xs text-gray-600">
                    {creator.tags?.[0] || 'Creator'}
                  </p>
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center">
                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Heart className="w-3 h-3" />
                    {creator.likes_count || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {creator.comments_count || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" />
                    {Math.floor(Math.random() * 10000)}
                  </p>
                </div>
              </div>

              {creator.is_raw_mode && (
                <Badge className="bg-orange-100 text-orange-800 text-xs mb-3 w-full justify-center">
                  🔥 Raw Mode Creator
                </Badge>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-1.5">
                <Button
                  onClick={() => currentUser && followMutation.mutate(creator.created_by)}
                  disabled={!currentUser || followMutation.isLoading}
                  size="sm"
                  variant="outline"
                  className="text-xs p-2"
                >
                  <UserPlus className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => window.location.href = createPageUrl('ViewProfile') + `?email=${creator.created_by}`}
                  size="sm"
                  variant="outline"
                  className="text-xs p-2"
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
                <Button
                  onClick={() => alert('Collaboration features coming soon!')}
                  size="sm"
                  className="gradient-bg-primary text-white text-xs p-2"
                >
                  <Briefcase className="w-3 h-3" />
                </Button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-2">
                Follow • View • Hire
              </p>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}