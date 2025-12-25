import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Award, Star, TrendingUp, Gift } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StreakDisplay from '../components/gamification/StreakDisplay';
import BadgeShowcase from '../components/gamification/BadgeShowcase';
import ChallengeCard from '../components/gamification/ChallengeCard';
import { motion } from 'framer-motion';

export default function Gamification() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: userStats } = useQuery({
    queryKey: ['gamification-stats', user?.email],
    queryFn: async () => {
      const stats = await base44.entities.UserStats.filter({ user_email: user?.email });
      if (stats.length > 0) return stats[0];
      
      // Create initial stats
      return base44.entities.UserStats.create({
        user_email: user.email,
        points: 0,
        level: 1,
        current_streak: 0,
        longest_streak: 0
      });
    },
    enabled: !!user?.email
  });

  const { data: badges } = useQuery({
    queryKey: ['user-badges', user?.email],
    queryFn: () => base44.entities.Badge.filter({ user_email: user?.email }),
    enabled: !!user?.email,
    initialData: []
  });

  const { data: challenges } = useQuery({
    queryKey: ['user-challenges', user?.email],
    queryFn: async () => {
      const userChallenges = await base44.entities.Challenge.filter({ user_email: user?.email });
      
      // Create daily challenges if none exist
      if (userChallenges.length === 0) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        await base44.entities.Challenge.bulkCreate([
          { user_email: user.email, challenge_type: 'post_3_times', target: 3, reward_points: 50, expires_date: tomorrow.toISOString().split('T')[0] },
          { user_email: user.email, challenge_type: 'get_10_likes', target: 10, reward_points: 30, expires_date: tomorrow.toISOString().split('T')[0] },
          { user_email: user.email, challenge_type: 'comment_5_times', target: 5, reward_points: 25, expires_date: tomorrow.toISOString().split('T')[0] }
        ]);
        
        return base44.entities.Challenge.filter({ user_email: user?.email });
      }
      
      return userChallenges;
    },
    enabled: !!user?.email,
    initialData: []
  });

  const level = userStats?.level || 1;
  const points = userStats?.points || 0;
  const nextLevelPoints = level * 100;
  const levelProgress = (points % nextLevelPoints) / nextLevelPoints * 100;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Achievements & Rewards</h1>
        <p className="text-zinc-500">Complete challenges, earn badges, level up!</p>
      </div>

      {/* Level & Points */}
      <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-500/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold">Level {level}</h3>
              <p className="text-sm text-zinc-400">{points} / {nextLevelPoints} XP</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
              <Star className="w-8 h-8 text-white" />
            </div>
          </div>
          <Progress value={levelProgress} className="h-3" />
        </CardContent>
      </Card>

      {/* Streak */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardContent className="p-6">
          <StreakDisplay 
            currentStreak={userStats?.current_streak || 0}
            longestStreak={userStats?.longest_streak || 0}
          />
        </CardContent>
      </Card>

      {/* Badges */}
      <Card className="bg-zinc-900 border-zinc-800 mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-400" />
            Your Badges ({badges.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {badges.length > 0 ? (
            <BadgeShowcase badges={badges} maxDisplay={10} />
          ) : (
            <p className="text-zinc-500 text-center py-8">
              Complete challenges to earn your first badge! 🎯
            </p>
          )}
        </CardContent>
      </Card>

      {/* Daily Challenges */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            Daily Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ChallengeCard challenge={challenge} />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}