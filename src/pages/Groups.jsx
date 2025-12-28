import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Plus, Search, TrendingUp, Lock, Crown } from 'lucide-react';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';

const categories = [
  { id: 'all', label: 'All', icon: '🌐' },
  { id: 'tech', label: 'Tech', icon: '💻' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'music', label: 'Music', icon: '🎵' },
  { id: 'wellness', label: 'Wellness', icon: '🧘' },
  { id: 'business', label: 'Business', icon: '💼' },
  { id: 'education', label: 'Education', icon: '📚' },
  { id: 'other', label: 'Other', icon: '✨' }
];

export default function Groups() {
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: groups } = useQuery({
    queryKey: ['all-groups'],
    queryFn: () => base44.entities.CreatorGroup.list('-created_date'),
    initialData: []
  });

  const { data: myMemberships } = useQuery({
    queryKey: ['my-memberships', user?.email],
    queryFn: () => base44.entities.GroupMembership.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.group_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const myGroupIds = myMemberships.map(m => m.group_id);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Community Groups</h1>
          <p className="text-gray-600">Join groups, connect with like-minded people, and share your passion</p>
        </div>
        <Button
          onClick={() => window.location.href = createPageUrl('CreateGroup')}
          className="gradient-bg-primary text-white shadow-glow"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groups..."
            className="pl-10 bg-white"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className={selectedCategory === cat.id ? 'gradient-bg-primary' : ''}
            >
              <span className="mr-1">{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGroups.map((group, index) => {
          const isMember = myGroupIds.includes(group.id);

          return (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-2 border-gray-200 hover:border-purple-300"
                onClick={() => window.location.href = `${createPageUrl('ViewGroup')}?id=${group.id}`}
              >
                <CardContent className="p-0">
                  {group.cover_image && (
                    <img 
                      src={group.cover_image} 
                      alt={group.group_name}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-blue-900">{group.group_name}</h3>
                      {group.is_private && (
                        <Lock className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {group.description}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Users className="w-4 h-4" />
                        <span>{group.member_count || 0} members</span>
                      </div>
                      {isMember && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Joined
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-20">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">No groups found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your search or create a new group</p>
          <Button
            onClick={() => window.location.href = createPageUrl('CreateGroup')}
            className="gradient-bg-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Group
          </Button>
        </div>
      )}
    </div>
  );
}