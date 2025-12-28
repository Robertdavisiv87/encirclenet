import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, X, Eye } from 'lucide-react';
import moment from 'moment';

export default function FlaggedContentCard({ flag, post, onApprove, onRemove }) {
  const severityColors = {
    low: 'bg-yellow-100 text-yellow-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    critical: 'bg-red-600 text-white'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    removed: 'bg-red-100 text-red-800'
  };

  return (
    <Card className="border-2 border-red-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <Badge className={statusColors[flag.status]}>
                {flag.status}
              </Badge>
              <span className="text-xs text-gray-500 ml-2">
                {moment(flag.created_date).fromNow()}
              </span>
            </div>
          </div>
          <Badge className={severityColors[flag.ai_confidence >= 90 ? 'critical' : flag.ai_confidence >= 70 ? 'high' : 'medium']}>
            {flag.ai_confidence}% Confidence
          </Badge>
        </div>

        {/* AI Explanation */}
        <div className="bg-red-50 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium text-red-900 mb-1">AI Analysis:</p>
          <p className="text-sm text-gray-700">{flag.ai_explanation}</p>
        </div>

        {/* Matched Violations */}
        {flag.matched_keywords?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Detected Violations:</p>
            <div className="flex flex-wrap gap-1">
              {flag.matched_keywords.map((keyword, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Content Preview */}
        {post && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Content:</p>
            <p className="text-sm text-gray-800 line-clamp-3">
              {post.caption || 'No caption'}
            </p>
            {post.media_url && (
              <div className="mt-2">
                {post.content_type === 'photo' && (
                  <img src={post.media_url} alt="" className="w-32 h-32 object-cover rounded" />
                )}
                {post.content_type === 'video' && (
                  <video src={post.media_url} className="w-32 h-32 object-cover rounded" />
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Author: {post.author_name} • {post.created_by}
            </p>
          </div>
        )}

        {/* Actions */}
        {flag.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => onApprove(flag)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
              onClick={() => onRemove(flag)}
            >
              <X className="w-4 h-4 mr-1" />
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}