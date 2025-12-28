import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, X } from 'lucide-react';
import moment from 'moment';

export default function UserReportsCard({ report, onResolve, onDismiss }) {
  const reasonColors = {
    spam: 'bg-yellow-100 text-yellow-800',
    harassment: 'bg-red-100 text-red-800',
    hate_speech: 'bg-red-600 text-white',
    violence: 'bg-red-600 text-white',
    nudity: 'bg-orange-100 text-orange-800',
    misinformation: 'bg-blue-100 text-blue-800',
    other: 'bg-gray-100 text-gray-800'
  };

  return (
    <Card className="border-2 border-orange-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-orange-600" />
            <div>
              <Badge className={reasonColors[report.reason]}>
                {report.reason.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-gray-500 ml-2">
                {moment(report.created_date).fromNow()}
              </span>
            </div>
          </div>
          <Badge variant="outline">
            {report.content_type}
          </Badge>
        </div>

        {/* Reporter Info */}
        <div className="bg-orange-50 rounded-lg p-3 mb-3">
          <p className="text-sm font-medium text-orange-900 mb-1">
            Reported by: {report.reporter_email}
          </p>
          <p className="text-sm text-gray-700">
            Reported user: {report.reported_user_email}
          </p>
        </div>

        {/* Description */}
        {report.description && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 border border-gray-200">
            <p className="text-xs font-medium text-gray-500 mb-1">Additional Details:</p>
            <p className="text-sm text-gray-800">{report.description}</p>
          </div>
        )}

        {/* Actions */}
        {report.status === 'pending' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
              onClick={() => onResolve(report)}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Take Action
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-gray-600 text-gray-600 hover:bg-gray-50"
              onClick={() => onDismiss(report)}
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}