import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Lock, Video, Trophy, Plus, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import CommunityStats from '../components/community/CommunityStats';
import InterestBasedGroups from '../components/community/InterestBasedGroups';
import TrendingDiscussions from '../components/community/TrendingDiscussions';

export default function Community() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        window.location.href = createPageUrl('Home');
      }
    };
    loadUser();
  }, []);

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: () => base44.entities.CreatorGroup.list('-created_date', 20),
    initialData: []
  });

  const { data: circles } = useQuery({
    queryKey: ['circles'],
    queryFn: () => base44.entities.ContentCircle.list('-created_date', 20),
    initialData: []
  });

  const { data: liveQAs } = useQuery({
    queryKey: ['live-qas'],
    queryFn: () => base44.entities.LiveQA.filter({ status: 'scheduled' }),
    initialData: []
  });

  const { data: challenges } = useQuery({
    queryKey: ['challenges'],
    queryFn: () => base44.entities.CommunityChallenge.filter({ status: 'active' }),
    initialData: []
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Community Hub</h1>
        <p className="text-gray-600">Join groups, exclusive circles, live sessions, and challenges</p>
      </div>

      <div className="mb-8">
        <CommunityStats />
      </div>

      <div className="mb-8">
        <InterestBasedGroups />
      </div>

      <div className="mb-8">
        <TrendingDiscussions />
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="circles">Circles</TabsTrigger>
          <TabsTrigger value="liveqa">Live Q&A</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="groups" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Creator Groups</h2>
            <Link to={createPageUrl('CreateGroup')}>
              <Button className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <motion.div key={group.id} whileHover={{ scale: 1.02 }}>
                <Card 
                  className="cursor-pointer hover:shadow-glow"
                  onClick={() => window.location.href = `${createPageUrl('ViewGroup')}?id=${group.id}`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-cyan-600" />
                      <CardTitle className="text-lg">{group.group_name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{group.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{group.member_count} members</span>
                      <Button size="sm" className="gradient-bg-primary text-white">
                        View Group
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="circles" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Exclusive Content Circles</h2>
            <Link to={createPageUrl('CreateCircle')}>
              <Button className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Circle
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {circles.map((circle) => (
              <motion.div key={circle.id} whileHover={{ scale: 1.02 }}>
                <Card className="cursor-pointer hover:shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-purple-600" />
                      <CardTitle className="text-lg">{circle.circle_name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{circle.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{circle.member_count} members</span>
                      <Button size="sm" className="gradient-bg-primary text-white">
                        Join
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="liveqa" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Upcoming Live Q&A Sessions</h2>
            <Link to={createPageUrl('ScheduleQA')}>
              <Button className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Q&A
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {liveQAs.map((qa) => (
              <motion.div key={qa.id} whileHover={{ scale: 1.02 }}>
                <Card className="cursor-pointer hover:shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Video className="w-5 h-5 text-red-600" />
                      <CardTitle className="text-lg">{qa.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{qa.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(qa.scheduled_date).toLocaleString()}
                      </span>
                      <Button size="sm" variant="outline">
                        RSVP
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Active Challenges</h2>
            <Link to={createPageUrl('CreateChallenge')}>
              <Button className="gradient-bg-primary text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge) => (
              <motion.div key={challenge.id} whileHover={{ scale: 1.02 }}>
                <Card className="cursor-pointer hover:shadow-glow">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-yellow-600" />
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">
                        {challenge.submission_count} submissions
                      </span>
                      <span className="text-xs font-bold text-green-600">
                        ${challenge.prize_pool} prize
                      </span>
                    </div>
                    <Button size="sm" className="w-full gradient-bg-primary text-white">
                      Participate
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}