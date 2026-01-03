import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CommunityStats() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['community-stats'],
    queryFn: async () => {
      const [groups, forums, events, users] = await Promise.all([
        base44.entities.CreatorGroup.list('-created_date', 1000),
        base44.entities.Forum.list('-created_date', 1000),
        base44.entities.Event.filter({ status: 'scheduled' }),
        base44.asServiceRole.entities.User.list()
      ]);

      const totalMembers = groups.reduce((sum, g) => sum + (g.member_count || 0), 0);
      const totalDiscussions = forums.reduce((sum, f) => sum + (f.post_count || 0), 0);

      return {
        totalGroups: groups.length,
        totalMembers,
        totalDiscussions,
        upcomingEvents: events.length,
        activeUsers: users.length
      };
    },
    initialData: {
      totalGroups: 0,
      totalMembers: 0,
      totalDiscussions: 0,
      upcomingEvents: 0,
      activeUsers: 0
    }
  });

  const statCards = [
    { label: 'Active Groups', value: stats.totalGroups, icon: Users, color: 'text-blue-600' },
    { label: 'Community Members', value: stats.totalMembers, icon: TrendingUp, color: 'text-purple-600' },
    { label: 'Discussions', value: stats.totalDiscussions, icon: MessageSquare, color: 'text-green-600' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: Calendar, color: 'text-orange-600' },
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-blue-900">
                    {isLoading ? '...' : stat.value.toLocaleString()}
                  </p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br from-purple-100 to-pink-100`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}