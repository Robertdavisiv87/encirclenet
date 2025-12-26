import React from 'react';
import { CheckCircle, Clock, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

const challengeConfig = {
  post_3_times: { label: 'Post 3 Times', icon: '📝', target: 3 },
  get_10_likes: { label: 'Get 10 Likes', icon: '❤️', target: 10 },
  comment_5_times: { label: 'Comment 5 Times', icon: '💬', target: 5 },
  share_story: { label: 'Share a Story', icon: '📸', target: 1 },
  invite_friend: { label: 'Invite a Friend', icon: '👥', target: 1 },
  tip_creator: { label: 'Tip a Creator', icon: '💰', target: 1 },
  complete_profile: { label: 'Complete Profile', icon: '✨', target: 1 }
};

export default function ChallengeCard({ challenge }) {
  const config = challengeConfig[challenge.challenge_type] || { label: 'Challenge', icon: '🎯', target: 1 };
  const progress = (challenge.progress / (challenge.target || config.target)) * 100;
  const isCompleted = challenge.status === 'completed';

  return (
    <Card className={cn(
      "bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-gray-200 realistic-shadow transition-all hover-lift",
      isCompleted && "border-green-500/50 bg-gradient-to-br from-green-50 to-emerald-50"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{config.icon}</div>
            <div>
              <h4 className="font-semibold text-blue-900">{config.label}</h4>
              <p className="text-xs text-gray-600">
                {challenge.progress}/{challenge.target || config.target}
              </p>
            </div>
          </div>
          {isCompleted ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <div className="flex items-center gap-1 text-yellow-600 text-xs font-semibold">
              <Award className="w-4 h-4" />
              {challenge.reward_points}pts
            </div>
          )}
        </div>

        <Progress value={progress} className="h-2 mb-2" />
        
        {challenge.expires_date && !isCompleted && (
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Clock className="w-3 h-3" />
            Expires {new Date(challenge.expires_date).toLocaleDateString()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}