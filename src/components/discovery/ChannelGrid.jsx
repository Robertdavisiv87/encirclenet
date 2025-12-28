import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tv, Users, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function ChannelGrid({ category, onChannelClick }) {
  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels', category],
    queryFn: async () => {
      if (category && category !== 'all') {
        return await base44.entities.Channel.filter({ category });
      }
      return await base44.entities.Channel.list('-follower_count', 20);
    }
  });

  if (isLoading) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {channels.map((channel, index) => (
        <motion.div
          key={channel.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card 
            onClick={() => onChannelClick?.(channel)}
            className="cursor-pointer hover:shadow-glow transition-all bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-gray-200"
          >
            <CardContent className="p-4">
              <div className="relative mb-3">
                {channel.cover_image ? (
                  <img 
                    src={channel.cover_image} 
                    alt={channel.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Tv className="w-12 h-12 text-white" />
                  </div>
                )}
                {channel.is_official && (
                  <div className="absolute top-2 right-2 bg-blue-500 rounded-full p-1">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-blue-900 mb-1">{channel.name}</h3>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{channel.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {channel.follower_count}
                </span>
                <Button size="sm" className="gradient-bg-primary text-white text-xs">
                  Follow
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}