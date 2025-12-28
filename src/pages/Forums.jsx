import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Users, Plus, TrendingUp, Pin } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../utils';

export default function Forums() {
  const [user, setUser] = useState(null);
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

  const { data: forums = [] } = useQuery({
    queryKey: ['forums', selectedCategory],
    queryFn: async () => {
      if (selectedCategory === 'all') {
        return await base44.entities.Forum.list('-post_count', 50);
      }
      return await base44.entities.Forum.filter({ category: selectedCategory });
    }
  });

  const categories = ['all', 'lifestyle', 'tech', 'art', 'music', 'wellness', 'business', 'education', 'entertainment', 'sports', 'food', 'travel', 'fashion', 'gaming', 'fitness'];

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">Community Forums</h1>
            <p className="text-gray-600">Join discussions, ask questions, share knowledge</p>
          </div>
          <Button className="gradient-bg-primary text-white shadow-glow">
            <Plus className="w-4 h-4 mr-2" />
            Create Forum
          </Button>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(cat => (
            <Button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              size="sm"
              variant={selectedCategory === cat ? 'default' : 'outline'}
              className={selectedCategory === cat ? 'gradient-bg-primary text-white' : ''}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {forums.map((forum, index) => (
          <motion.div
            key={forum.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-glow transition-all bg-white border-2 border-gray-200"
              onClick={() => window.location.href = createPageUrl(`ForumDetail?id=${forum.id}`)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                    <span className="text-blue-900">{forum.name}</span>
                  </div>
                  {forum.is_private && <Pin className="w-4 h-4 text-yellow-500" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">{forum.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {forum.member_count} members
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {forum.post_count} posts
                  </span>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-semibold">
                    {forum.category}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}