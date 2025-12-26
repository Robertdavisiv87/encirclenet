import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  User, 
  Lock, 
  Bell, 
  Eye, 
  MessageSquare, 
  Shield, 
  Palette,
  Database,
  HelpCircle,
  LogOut,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import SEO from '../components/SEO';

export default function Settings() {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({
    // Privacy
    is_private: false,
    allow_messages_from: 'everyone', // everyone, followers, none
    allow_comments: true,
    show_activity_status: true,
    
    // Notifications
    notifications_enabled: true,
    email_notifications: true,
    push_notifications: true,
    
    // Display
    show_posts_count: true,
    show_earnings: true,
    
    // Data
    save_data_mode: false
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setSettings({
          ...settings,
          is_private: currentUser.is_private || false
        });
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const updateSetting = async (key, value) => {
    setSettings({ ...settings, [key]: value });
    
    // Update in database if it's a user property
    if (key === 'is_private') {
      await base44.auth.updateMe({ [key]: value });
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out?')) {
      base44.auth.logout();
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 pb-20">
      <SEO 
        title="Settings - Encircle Net"
        description="Manage your account settings, privacy, and preferences"
      />

      {/* Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-lg z-40 border-b border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-blue-900">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Account Section */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <User className="w-5 h-5 text-purple-600" />
              Account
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-semibold text-blue-900">{user.full_name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Email</p>
                <p className="text-xs text-gray-600">Manage your email address</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Section */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Lock className="w-5 h-5 text-purple-600" />
              Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Private Account</p>
                <p className="text-xs text-gray-600">Only followers can see your posts</p>
              </div>
              <Switch
                checked={settings.is_private}
                onCheckedChange={(checked) => updateSetting('is_private', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Activity Status</p>
                <p className="text-xs text-gray-600">Show when you're active</p>
              </div>
              <Switch
                checked={settings.show_activity_status}
                onCheckedChange={(checked) => updateSetting('show_activity_status', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Allow Comments</p>
                <p className="text-xs text-gray-600">Let people comment on your posts</p>
              </div>
              <Switch
                checked={settings.allow_comments}
                onCheckedChange={(checked) => updateSetting('allow_comments', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Messages Section */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="font-medium text-blue-900">Who can message you</p>
              <div className="space-y-2">
                {['everyone', 'followers', 'none'].map(option => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                    <input
                      type="radio"
                      name="messages"
                      checked={settings.allow_messages_from === option}
                      onChange={() => updateSetting('allow_messages_from', option)}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-blue-900 capitalize">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Bell className="w-5 h-5 text-purple-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Push Notifications</p>
                <p className="text-xs text-gray-600">Receive push notifications</p>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => updateSetting('push_notifications', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Email Notifications</p>
                <p className="text-xs text-gray-600">Receive email updates</p>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Display Section */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Eye className="w-5 h-5 text-purple-600" />
              Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Show Post Count</p>
                <p className="text-xs text-gray-600">Display number of posts on profile</p>
              </div>
              <Switch
                checked={settings.show_posts_count}
                onCheckedChange={(checked) => updateSetting('show_posts_count', checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Show Earnings</p>
                <p className="text-xs text-gray-600">Display earnings on profile</p>
              </div>
              <Switch
                checked={settings.show_earnings}
                onCheckedChange={(checked) => updateSetting('show_earnings', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Storage */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Database className="w-5 h-5 text-purple-600" />
              Data & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">Save Data Mode</p>
                <p className="text-xs text-gray-600">Use less data for media</p>
              </div>
              <Switch
                checked={settings.save_data_mode}
                onCheckedChange={(checked) => updateSetting('save_data_mode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card className="border-2 border-gray-200 realistic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <HelpCircle className="w-5 h-5 text-purple-600" />
              Help & Support
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <p className="font-medium text-blue-900">Help Center</p>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <Separator />
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <p className="font-medium text-blue-900">Privacy Policy</p>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <Separator />
            <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-lg">
              <p className="font-medium text-blue-900">Terms of Service</p>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          variant="destructive"
          className="w-full bg-red-600 hover:bg-red-700 text-white"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>

        <p className="text-center text-xs text-gray-500 mt-8">
          Encircle Net v1.0.0
        </p>
      </div>
    </div>
  );
}