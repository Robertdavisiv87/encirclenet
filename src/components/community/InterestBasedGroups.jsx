import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { createPageUrl } from '../../utils';

const interests = [
  { id: 'tech', name: 'Tech & Innovation', icon: '💻', color: 'bg-blue-100 text-blue-700', count: 145 },
  { id: 'fitness', name: 'Fitness & Wellness', icon: '🏋️', color: 'bg-green-100 text-green-700', count: 230 },
  { id: 'art', name: 'Art & Design', icon: '🎨', color: 'bg-purple-100 text-purple-700', count: 189 },
  { id: 'music', name: 'Music & Audio', icon: '🎵', color: 'bg-pink-100 text-pink-700', count: 156 },
  { id: 'business', name: 'Business & Startups', icon: '💼', color: 'bg-orange-100 text-orange-700', count: 198 },
  { id: 'education', name: 'Learning & Education', icon: '📚', color: 'bg-indigo-100 text-indigo-700', count: 267 },
  { id: 'gaming', name: 'Gaming Community', icon: '🎮', color: 'bg-red-100 text-red-700', count: 312 },
  { id: 'food', name: 'Food & Cooking', icon: '🍳', color: 'bg-yellow-100 text-yellow-700', count: 178 },
];

export default function InterestBasedGroups() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text mb-2">Find Your Community</h2>
          <p className="text-gray-600">Join groups based on your interests and passions</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {interests.map((interest, index) => (
          <motion.div
            key={interest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all bg-gradient-to-br from-white to-purple-50"
              onClick={() => window.location.href = `${createPageUrl('Groups')}?category=${interest.id}`}
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-3">{interest.icon}</div>
                <h3 className="font-bold text-blue-900 mb-2">{interest.name}</h3>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{interest.count} groups</span>
                </div>
                <Button size="sm" className="mt-4 w-full gradient-bg-primary text-white">
                  Explore
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}