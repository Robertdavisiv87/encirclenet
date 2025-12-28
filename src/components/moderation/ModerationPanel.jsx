import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, AlertTriangle, Users, Settings, Plus, Trash } from 'lucide-react';
import FlaggedContentCard from './FlaggedContentCard';
import UserReportsCard from './UserReportsCard';

export default function ModerationPanel({ user }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [newKeyword, setNewKeyword] = useState('');
  const queryClient = useQueryClient();

  const { data: moderationSettings } = useQuery({
    queryKey: ['moderation-settings', user?.email],
    queryFn: async () => {
      const s = await base44.entities.ModerationSettings.filter({ creator_email: user?.email });
      return s[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['moderation-reports'],
    queryFn: () => base44.entities.ContentReport.filter({ status: 'pending' })
  });

  const { data: flags = [] } = useQuery({
    queryKey: ['moderation-flags'],
    queryFn: () => base44.entities.ModerationFlag.filter({ status: 'pending' })
  });

  const { data: allPosts = [] } = useQuery({
    queryKey: ['posts-moderation'],
    queryFn: () => base44.entities.Post.list('-created_date', 200)
  });

  const updateSettings = async (updates) => {
    if (moderationSettings) {
      await base44.entities.ModerationSettings.update(moderationSettings.id, updates);
    } else {
      await base44.entities.ModerationSettings.create({
        creator_email: user.email,
        ...updates
      });
    }
    queryClient.invalidateQueries(['moderation-settings']);
  };

  const addKeyword = async () => {
    if (!newKeyword.trim()) return;
    const keywords = [...(moderationSettings?.blocked_keywords || []), newKeyword.toLowerCase()];
    await updateSettings({ blocked_keywords: keywords });
    setNewKeyword('');
  };

  const removeKeyword = async (keyword) => {
    const keywords = (moderationSettings?.blocked_keywords || []).filter(k => k !== keyword);
    await updateSettings({ blocked_keywords: keywords });
  };

  const approveMutation = useMutation({
    mutationFn: async (flag) => {
      await base44.entities.ModerationFlag.update(flag.id, {
        status: 'approved',
        reviewed_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-flags']);
      alert('✅ Content approved');
    }
  });

  const removeMutation = useMutation({
    mutationFn: async (flag) => {
      await base44.entities.ModerationFlag.update(flag.id, {
        status: 'removed',
        reviewed_by: user.email
      });
      
      if (flag.content_type === 'post') {
        await base44.entities.Post.delete(flag.content_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-flags']);
      queryClient.invalidateQueries(['posts-moderation']);
      alert('✅ Content removed');
    }
  });

  const resolveReportMutation = useMutation({
    mutationFn: async (report) => {
      await base44.entities.ContentReport.update(report.id, {
        status: 'resolved',
        moderator_email: user.email,
        moderator_action: 'Content reviewed and action taken',
        resolved_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-reports']);
      alert('✅ Report resolved');
    }
  });

  const dismissReportMutation = useMutation({
    mutationFn: async (report) => {
      await base44.entities.ContentReport.update(report.id, {
        status: 'dismissed',
        moderator_email: user.email,
        moderator_action: 'No violation found',
        resolved_date: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-reports']);
      alert('✅ Report dismissed');
    }
  });

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-4 w-full max-w-2xl">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="flagged">
          AI Flags
          {flags.length > 0 && (
            <Badge className="ml-2 bg-red-600">{flags.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="reports">
          Reports
          {reports.length > 0 && (
            <Badge className="ml-2 bg-orange-600">{reports.length}</Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <Card>
          <CardHeader>
            <CardTitle>Moderation Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center p-4 bg-red-50 rounded-lg border-2 border-red-200">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <p className="text-2xl font-bold">{flags.length}</p>
                <p className="text-sm text-gray-600">AI Flagged</p>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border-2 border-orange-200">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold">{reports.length}</p>
                <p className="text-sm text-gray-600">User Reports</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{allPosts.length}</p>
                <p className="text-sm text-gray-600">Total Posts</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border-2 border-green-200">
                <Shield className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{((1 - flags.length / Math.max(allPosts.length, 1)) * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">Clean Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="flagged">
        <Card>
          <CardHeader>
            <CardTitle>AI Flagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-gray-600 font-medium">No flagged content! 🎉</p>
                <p className="text-sm text-gray-500 mt-1">AI moderation is keeping the community safe</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag) => {
                  const post = allPosts.find(p => p.id === flag.content_id);
                  return (
                    <FlaggedContentCard
                      key={flag.id}
                      flag={flag}
                      post={post}
                      onApprove={() => approveMutation.mutate(flag)}
                      onRemove={() => removeMutation.mutate(flag)}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card>
          <CardHeader>
            <CardTitle>User Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <p className="text-gray-600 font-medium">No pending reports</p>
                <p className="text-sm text-gray-500 mt-1">Community is behaving well!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <UserReportsCard
                    key={report.id}
                    report={report}
                    onResolve={() => resolveReportMutation.mutate(report)}
                    onDismiss={() => dismissReportMutation.mutate(report)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Moderation Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label>AI-powered moderation</Label>
              <Switch
                checked={moderationSettings?.auto_flag_enabled !== false}
                onCheckedChange={(checked) => updateSettings({ auto_flag_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label>Spam detection</Label>
              <Switch
                checked={moderationSettings?.spam_detection_enabled !== false}
                onCheckedChange={(checked) => updateSettings({ spam_detection_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <Label>Require approval for posts</Label>
              <Switch
                checked={moderationSettings?.require_approval || false}
                onCheckedChange={(checked) => updateSettings({ require_approval: checked })}
              />
            </div>

            <div>
              <Label className="mb-2 block">Blocked Keywords</Label>
              <div className="flex gap-2 mb-3">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Add keyword..."
                />
                <Button onClick={addKeyword} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {moderationSettings?.blocked_keywords?.map(keyword => (
                  <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                    {keyword}
                    <Trash 
                      className="w-3 h-3 cursor-pointer text-red-500" 
                      onClick={() => removeKeyword(keyword)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}