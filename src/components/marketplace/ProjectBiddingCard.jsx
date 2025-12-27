import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Users, Clock, FileText } from 'lucide-react';
import moment from 'moment';

export default function ProjectBiddingCard({ project, onBid, onViewBids }) {
  const [showBidForm, setShowBidForm] = useState(false);

  return (
    <Card className="bg-white border-gray-200 hover:shadow-lg transition-all realistic-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg text-blue-900">{project.title}</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge className="bg-purple-100 text-purple-900">{project.category}</Badge>
              <Badge variant="outline" className="border-green-500 text-green-700">
                ${project.budget_min} - ${project.budget_max}
              </Badge>
              <Badge variant="outline" className={
                project.status === 'open' ? 'border-blue-500 text-blue-700' :
                project.status === 'awarded' ? 'border-green-500 text-green-700' :
                'border-gray-500 text-gray-700'
              }>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-700 line-clamp-3">{project.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Due: {moment(project.deadline).format('MMM D, YYYY')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span>{project.bids_count || 0} bids</span>
          </div>
        </div>

        {project.skills_required && project.skills_required.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Skills Required:</p>
            <div className="flex flex-wrap gap-2">
              {project.skills_required.slice(0, 5).map((skill, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {project.skills_required.length > 5 && (
                <Badge variant="outline" className="text-xs">
                  +{project.skills_required.length - 5} more
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {project.status === 'open' && (
            <Button 
              onClick={() => onBid(project)}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white"
            >
              Submit Proposal
            </Button>
          )}
          <Button 
            onClick={() => onViewBids(project)}
            variant="outline"
            className="flex-1"
          >
            <FileText className="w-4 h-4 mr-2" />
            View Bids
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}