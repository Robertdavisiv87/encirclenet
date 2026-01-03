import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CheckCircle, XCircle, AlertTriangle, Sparkles, Eye, Ban } from 'lucide-react';
import { toast } from 'sonner';

export default function AIContentModerator() {
  const [selectedContent, setSelectedContent] = useState(null);
  const [processing, setProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch pending content
  const { data: pendingPosts, isLoading: loadingPosts } = useQuery({
    queryKey: ['pending-moderation-posts'],
    queryFn: () => base44.entities.Post.filter({ moderation_status: 'pending_review' })
  });

  const { data: flaggedContent } = useQuery({
    queryKey: ['flagged-content'],
    queryFn: () => base44.entities.ContentReport.filter({ status: 'pending' })
  });

  // Auto-moderate mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ contentId, action, reason }) => {
      const response = await base44.functions.invoke('aiModerateContent', {
        content_id: contentId,
        action,
        reason
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-moderation-posts']);
      queryClient.invalidateQueries(['flagged-content']);
      toast.success('Content moderated successfully');
    },
    onError: (error) => {
      toast.error('Moderation failed: ' + error.message);
    }
  });

  // Batch AI moderation
  const handleBatchModeration = async () => {
    if (!pendingPosts?.length) return;
    
    setProcessing(true);
    try {
      for (const post of pendingPosts.slice(0, 10)) { // Process 10 at a time
        await base44.functions.invoke('aiModerateContent', {
          content_id: post.id,
          content_type: 'post',
          content_text: post.caption || '',
          media_url: post.media_url
        });
      }
      queryClient.invalidateQueries(['pending-moderation-posts']);
      toast.success('Batch moderation complete');
    } catch (error) {
      toast.error('Batch moderation failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleModerate = (contentId, action, reason = '') => {
    moderateMutation.mutate({ contentId, action, reason });
  };

  const getSeverityColor = (reason) => {
    if (reason?.includes('spam')) return 'bg-yellow-100 text-yellow-800';
    if (reason?.includes('harassment') || reason?.includes('hate')) return 'bg-red-100 text-red-800';
    if (reason?.includes('violence') || reason?.includes('nudity')) return 'bg-red-200 text-red-900';
    return 'bg-gray-100 text-gray-800';
  };

  if (loadingPosts) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            AI Content Moderator
          </h2>
          <p className="text-sm text-gray-600 mt-1">AI-powered content review and moderation</p>
        </div>
        <Button
          onClick={handleBatchModeration}
          disabled={processing || !pendingPosts?.length}
          className="gradient-bg-primary text-white"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Auto-Moderate All
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingPosts?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Flagged Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{flaggedContent?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Auto-Approved Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">--</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review ({pendingPosts?.length || 0})</TabsTrigger>
          <TabsTrigger value="flagged">Flagged ({flaggedContent?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingPosts?.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-gray-600">No content pending review</p>
              </CardContent>
            </Card>
          ) : (
            pendingPosts?.map((post) => (
              <Card key={post.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {post.media_url && (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {post.content_type === 'photo' ? (
                          <img src={post.media_url} alt="Content" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Eye className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">{post.author_name}</p>
                          <p className="text-sm text-gray-600">{post.created_by}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50">
                          Pending Review
                        </Badge>
                      </div>
                      
                      {post.caption && (
                        <p className="text-sm text-gray-700 mb-3">{post.caption}</p>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleModerate(post.id, 'approve')}
                          disabled={moderateMutation.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleModerate(post.id, 'reject', 'Policy violation')}
                          disabled={moderateMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            try {
                              const result = await base44.functions.invoke('aiModerateContent', {
                                content_id: post.id,
                                content_type: 'post',
                                content_text: post.caption || '',
                                media_url: post.media_url
                              });
                              toast.success('AI analysis complete');
                              console.log('AI Result:', result.data);
                            } catch (error) {
                              toast.error('AI analysis failed');
                            }
                          }}
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Analyze
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-4">
          {flaggedContent?.map((report) => (
            <Card key={report.id} className="hover-lift">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <Badge className={getSeverityColor(report.reason)}>
                      {report.reason}
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">
                      Reporter: {report.reporter_email}
                    </p>
                    <p className="text-sm text-gray-600">
                      Reported User: {report.reported_user_email}
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                
                {report.description && (
                  <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-3 rounded-lg">
                    "{report.description}"
                  </p>
                )}
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      base44.entities.ContentReport.update(report.id, { status: 'resolved' });
                      queryClient.invalidateQueries(['flagged-content']);
                      toast.success('Report resolved');
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      base44.entities.ContentReport.update(report.id, { status: 'dismissed' });
                      queryClient.invalidateQueries(['flagged-content']);
                      toast.info('Report dismissed');
                    }}
                  >
                    Dismiss
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Ban user action
                      toast.warning('Ban user feature - coming soon');
                    }}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Ban User
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {flaggedContent?.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8">
                <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                <p className="text-gray-600">No flagged content to review</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}