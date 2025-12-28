import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Palette, Save, Settings } from 'lucide-react';
import { createPageUrl } from '../../utils';

export default function ContentPreferences({ user }) {
  const queryClient = useQueryClient();
  const [selectedCategories, setSelectedCategories] = useState([]);

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (preferences) {
      setSelectedCategories(preferences.preferred_categories || []);
    }
  }, [preferences]);

  const categories = [
    { id: 'tech', label: 'Tech', icon: '💻' },
    { id: 'art', label: 'Art', icon: '🎨' },
    { id: 'music', label: 'Music', icon: '🎵' },
    { id: 'wellness', label: 'Wellness', icon: '🧘' },
    { id: 'business', label: 'Business', icon: '💼' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { id: 'sports', label: 'Sports', icon: '⚽' },
    { id: 'food', label: 'Food', icon: '🍕' },
    { id: 'travel', label: 'Travel', icon: '✈️' },
    { id: 'fashion', label: 'Fashion', icon: '👗' },
    { id: 'gaming', label: 'Gaming', icon: '🎮' }
  ];

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const savePreferences = async () => {
    try {
      if (preferences) {
        await base44.entities.UserPreference.update(preferences.id, {
          preferred_categories: selectedCategories
        });
      } else {
        await base44.entities.UserPreference.create({
          user_email: user.email,
          preferred_categories: selectedCategories
        });
      }
      queryClient.invalidateQueries(['user-preferences']);
      alert('✅ Preferences saved!');
    } catch (error) {
      alert('Failed to save preferences');
    }
  };

  return (
    <Card className="bg-white border border-gray-200 mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="w-4 h-4 text-purple-600" />
            Content Preferences
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = createPageUrl('Settings')}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center justify-between p-2 border border-gray-200 rounded-lg">
              <Label htmlFor={cat.id} className="cursor-pointer text-sm flex items-center gap-2">
                <span>{cat.icon}</span>
                {cat.label}
              </Label>
              <Switch
                id={cat.id}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
            </div>
          ))}
        </div>
        <Button onClick={savePreferences} size="sm" className="w-full gradient-bg-primary text-white">
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
      </CardContent>
    </Card>
  );
}