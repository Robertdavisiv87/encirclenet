import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle, XCircle, Plus, Trash } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import moment from 'moment';

export default function ModerationPanel({ user }) {
  const [newKeyword, setNewKeyword] = useState('');
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ['moderation-settings', user?.email],
    queryFn: async () => {
      const s = await base44.entities.ModerationSettings.filter({ creator_email: user?.email });
      return s[0] || null;
    },
    enabled: !!user?.email
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['content-reports'],
    queryFn: () => base44.entities.ContentReport.filter({ status: 'pending' }),
    refetchInterval: 30000
  });

  const { data: flags = [] } = useQuery({
    queryKey: ['moderation-flags'],
    queryFn: () => base44.entities.ModerationFlag.filter({ status: 'pending' }),
    refetchInterval: 30000
  });

  const updateSettings = async (updates) => {
    if (settings) {
      await base44.entities.ModerationSettings.update(settings.id, updates);
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
    const keywords = [...(settings?.blocked_keywords || []), newKeyword.toLowerCase()];
    await updateSettings({ blocked_keywords: keywords });
    setNewKeyword('');
  };

  const removeKeyword = async (keyword) => {
    const keywords = (settings?.blocked_keywords || []).filter(k => k !== keyword);
    await updateSettings({ blocked_keywords: keywords });
  };

  const resolveReport = async (reportId, action) => {
    await base44.entities.ContentReport.update(reportId, {
      status: 'resolved',
      moderator_email: user.email,
      moderator_action: action,
      resolved_date: new Date().toISOString()
    });
    queryClient.invalidateQueries(['content-reports']);
  };

  const reviewFlag = async (flagId, status) => {
    await base44.entities.ModerationFlag.update(flagId, {
      status,
      reviewed_by: user.email
    });
    queryClient.invalidateQueries(['moderation-flags']);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Moderation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <Label>AI-powered moderation</Label>
            <Switch
              checked={settings?.auto_flag_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ auto_flag_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <Label>Spam detection</Label>
            <Switch
              checked={settings?.spam_detection_enabled !== false}
              onCheckedChange={(checked) => updateSettings({ spam_detection_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <Label>Require approval for posts</Label>
            <Switch
              checked={settings?.require_approval || false}
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
              {settings?.blocked_keywords?.map(keyword => (
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

      <Tabs defaultValue="reports">
        <TabsList className="w-full bg-white border-2 border-gray-200">
          <TabsTrigger value="reports" className="flex-1">
            Reports ({reports.length})
          </TabsTrigger>
          <TabsTrigger value="ai-flags" className="flex-1">
            AI Flags ({flags.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {reports.map(report => (
            <Card key={report.id} className="bg-red-50 border-2 border-red-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-red-600 text-white mb-2">{report.reason}</Badge>
                    <p className="text-sm text-gray-600">
                      Reported by {report.reporter_email} • {moment(report.created_date).fromNow()}
                    </p>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">{report.description}</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => resolveReport(report.id, 'removed')}
                    className="bg-red-600 text-white"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Remove Content
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => resolveReport(report.id, 'dismissed')}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Dismiss
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="ai-flags" className="space-y-4">
          {flags.map(flag => (
            <Card key={flag.id} className="bg-yellow-50 border-2 border-yellow-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Badge className="bg-yellow-600 text-white mb-2">{flag.flag_reason}</Badge>
                    {flag.ai_confidence && (
                      <p className="text-sm text-gray-600">AI Confidence: {flag.ai_confidence}%</p>
                    )}
                  </div>
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                </div>
              </CardHeader>
              <CardContent>
                {flag.ai_explanation && (
                  <p className="text-sm mb-3 text-gray-700">{flag.ai_explanation}</p>
                )}
                {flag.matched_keywords?.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-1">Matched keywords:</p>
                    <div className="flex gap-1 flex-wrap">
                      {flag.matched_keywords.map(kw => (
                        <Badge key={kw} variant="outline">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => reviewFlag(flag.id, 'removed')}
                    className="bg-red-600 text-white"
                  >
                    Remove
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => reviewFlag(flag.id, 'approved')}
                  >
                    Approve
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}