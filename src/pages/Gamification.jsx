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
    <div className="max-w-6xl mx-auto p-6 min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">🏆 Daily Challenges & Achievements</h1>
        <p className="text-blue-900 font-medium">Complete challenges, earn rewards, and level up your profile. Each action fuels your growth and unlocks new opportunities to earn!</p>
      </div>

      {/* Level & Points */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-400 realistic-shadow mb-6 hover-lift">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-blue-900">Level {level}</h3>
                <p className="text-sm text-gray-600">{points} / {nextLevelPoints} XP</p>
              </div>
              <div className="w-16 h-16 rounded-full gradient-bg-primary flex items-center justify-center shadow-glow animate-pulse-glow">
                <Star className="w-8 h-8 text-white" />
              </div>
            </div>
            <Progress value={levelProgress} className="h-3" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white border-2 border-gray-200 realistic-shadow mb-6 hover-lift">
          <CardContent className="p-6">
            <StreakDisplay 
              currentStreak={userStats?.current_streak || 0}
              longestStreak={userStats?.longest_streak || 0}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-white border-2 border-gray-200 realistic-shadow mb-6 hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Award className="w-5 h-5 text-yellow-600" />
              Your Badges ({badges.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges.length > 0 ? (
              <BadgeShowcase badges={badges} maxDisplay={10} />
            ) : (
              <p className="text-gray-600 text-center py-8">
                Complete challenges to earn your first badge! 🎯
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white border-2 border-gray-200 realistic-shadow hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Gift className="w-5 h-5 text-purple-600" />
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
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <ChallengeCard challenge={challenge} />
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}