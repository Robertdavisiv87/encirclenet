import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Bell, Lock, Eye, Palette, Save } from 'lucide-react';

export default function Settings() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    let mounted = true;
    
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (mounted) {
          setUser(currentUser);
        }
      } catch (e) {
        console.error('Failed to load user:', e);
      }
    };
    
    loadUser();
    
    return () => {
      mounted = false;
    };
  }, []);

  const { data: preferences } = useQuery({
    queryKey: ['user-preferences', user?.email],
    queryFn: async () => {
      const prefs = await base44.entities.UserPreference.filter({ user_email: user?.email });
      return prefs[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: privacySettings } = useQuery({
    queryKey: ['privacy-settings', user?.email],
    queryFn: async () => {
      const settings = await base44.entities.UserPrivacySettings.filter({ user_email: user?.email });
      return settings[0] || null;
    },
    enabled: !!user?.email
  });

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [privacy, setPrivacy] = useState({
    allow_messages_from: 'everyone',
    allow_event_invites: true,
    show_online_status: true
  });

  useEffect(() => {
    if (preferences?.preferred_categories) {
      setSelectedCategories(preferences.preferred_categories);
    }
  }, [preferences?.preferred_categories]);

  useEffect(() => {
    if (privacySettings) {
      setPrivacy({
        allow_messages_from: privacySettings.allow_messages_from || 'everyone',
        allow_event_invites: privacySettings.allow_event_invites !== false,
        show_online_status: privacySettings.show_online_status !== false
      });
    }
  }, [privacySettings]);

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

  const savePrivacy = async () => {
    try {
      if (privacySettings) {
        await base44.entities.UserPrivacySettings.update(privacySettings.id, privacy);
      } else {
        await base44.entities.UserPrivacySettings.create({
          user_email: user.email,
          ...privacy
        });
      }
      queryClient.invalidateQueries(['privacy-settings']);
      alert('✅ Privacy settings saved!');
    } catch (error) {
      alert('Failed to save privacy settings');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <h1 className="text-4xl font-bold gradient-text mb-6">Settings</h1>

      {/* Content Preferences */}
      <Card className="mb-6 bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            Content Preferences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">Select categories you're interested in to personalize your feed</p>
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-purple-50 transition-all">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{cat.icon}</span>
                  <Label htmlFor={cat.id} className="cursor-pointer text-blue-900">{cat.label}</Label>
                </div>
                <Switch
                  id={cat.id}
                  checked={selectedCategories.includes(cat.id)}
                  onCheckedChange={() => toggleCategory(cat.id)}
                />
              </div>
            ))}
          </div>
          <Button onClick={savePreferences} className="w-full mt-4 gradient-bg-primary text-white shadow-glow">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card className="mb-6 bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-blue-600" />
            Privacy & Messaging
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-blue-900 mb-2 block">Who can send you messages?</Label>
            <div className="space-y-2">
              {['everyone', 'followers', 'nobody'].map(option => (
                <div key={option} className="flex items-center gap-2">
                  <input
                    type="radio"
                    id={option}
                    checked={privacy.allow_messages_from === option}
                    onChange={() => setPrivacy({ ...privacy, allow_messages_from: option })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={option} className="cursor-pointer capitalize">{option}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <Label className="text-blue-900">Allow event invites</Label>
            <Switch
              checked={privacy.allow_event_invites}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, allow_event_invites: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <Label className="text-blue-900">Show online status</Label>
            <Switch
              checked={privacy.show_online_status}
              onCheckedChange={(checked) => setPrivacy({ ...privacy, show_online_status: checked })}
            />
          </div>

          <Button onClick={savePrivacy} className="w-full gradient-bg-primary text-white shadow-glow">
            <Save className="w-4 h-4 mr-2" />
            Save Privacy Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}