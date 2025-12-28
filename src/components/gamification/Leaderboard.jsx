import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Leaderboard({ currentUser }) {
  const [timeframe, setTimeframe] = useState('all'); // all, month, week

  const { data: topUsers, isLoading } = useQuery({
    queryKey: ['leaderboard', timeframe],
    queryFn: async () => {
      const users = await base44.entities.UserPoints.list('-total_points', 50);
      return users;
    }
  });

  const { data: allUsers } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      return await base44.entities.User.list();
    }
  });

  const getUserData = (email) => {
    return allUsers?.find(u => u.email === email);
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return { icon: Trophy, color: 'text-yellow-500' };
    if (rank === 2) return { icon: Medal, color: 'text-gray-400' };
    if (rank === 3) return { icon: Award, color: 'text-orange-600' };
    return { icon: TrendingUp, color: 'text-blue-500' };
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Leaderboard
          </CardTitle>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={timeframe === 'all' ? 'default' : 'ghost'}
              onClick={() => setTimeframe('all')}
              className={timeframe === 'all' ? 'gradient-bg-primary text-white' : ''}
            >
              All Time
            </Button>
            <Button
              size="sm"
              variant={timeframe === 'month' ? 'default' : 'ghost'}
              onClick={() => setTimeframe('month')}
              className={timeframe === 'month' ? 'gradient-bg-primary text-white' : ''}
            >
              Month
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : (
          <div className="space-y-2">
            {topUsers?.slice(0, 10).map((userPoints, index) => {
              const userData = getUserData(userPoints.user_email);
              const { icon: RankIcon, color } = getRankIcon(index + 1);
              const isCurrentUser = currentUser?.email === userPoints.user_email;

              return (
                <div
                  key={userPoints.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    isCurrentUser 
                      ? "bg-purple-200 border-2 border-purple-400 shadow-glow" 
                      : "bg-white hover:bg-purple-50"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <RankIcon className={cn("w-5 h-5", color)} />
                    <span className="font-bold text-blue-900 w-6">#{index + 1}</span>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={userData?.avatar_url} />
                      <AvatarFallback>
                        {userData?.full_name?.[0] || userPoints.user_email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-blue-900">
                        {userData?.full_name || userPoints.user_email}
                        {isCurrentUser && <span className="text-purple-600 ml-1">(You)</span>}
                      </p>
                      <p className="text-xs text-gray-600">Level {userPoints.current_level}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-900">{userPoints.total_points}</p>
                    <p className="text-xs text-gray-600">points</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}