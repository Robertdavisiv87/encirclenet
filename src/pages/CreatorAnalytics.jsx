import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Lock, Video, Trophy, TrendingUp, DollarSign, Eye, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#9333EA', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

export default function CreatorAnalytics() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {}
    };
    loadUser();
  }, []);

  const { data: myGroups } = useQuery({
    queryKey: ['my-groups', user?.email],
    queryFn: () => base44.entities.CreatorGroup.filter({ creator_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const { data: myCircles } = useQuery({
    queryKey: ['my-circles', user?.email],
    queryFn: () => base44.entities.ContentCircle.filter({ creator_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const { data: myQAs } = useQuery({
    queryKey: ['my-qas', user?.email],
    queryFn: () => base44.entities.LiveQA.filter({ creator_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const { data: myChallenges } = useQuery({
    queryKey: ['my-challenges', user?.email],
    queryFn: () => base44.entities.CommunityChallenge.filter({ creator_email: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  const { data: myPosts } = useQuery({
    queryKey: ['my-posts', user?.email],
    queryFn: () => base44.entities.Post.filter({ created_by: user?.email }),
    initialData: [],
    enabled: !!user?.email
  });

  // Calculate metrics
  const totalGroupMembers = myGroups.reduce((sum, g) => sum + (g.member_count || 0), 0);
  const totalCircleMembers = myCircles.reduce((sum, c) => sum + (c.member_count || 0), 0);
  const totalCircleRevenue = myCircles.reduce((sum, c) => sum + (c.monthly_revenue || 0), 0);
  const totalQAAttendees = myQAs.reduce((sum, q) => sum + (q.attendee_count || 0), 0);
  const totalQATips = myQAs.reduce((sum, q) => sum + (q.tips_received || 0), 0);
  const totalChallengeSubmissions = myChallenges.reduce((sum, ch) => sum + (ch.submission_count || 0), 0);
  const totalChallengePrizes = myChallenges.reduce((sum, ch) => sum + (ch.prize_pool || 0), 0);
  const totalPostLikes = myPosts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalPostComments = myPosts.reduce((sum, p) => sum + (p.comments_count || 0), 0);

  // Group data for charts
  const groupData = myGroups.map(g => ({ name: g.group_name, members: g.member_count || 0 }));
  const circleData = myCircles.map(c => ({ name: c.circle_name, members: c.member_count || 0, revenue: c.monthly_revenue || 0 }));
  const qaData = myQAs.map(q => ({ name: q.title, attendees: q.attendee_count || 0, tips: q.tips_received || 0 }));
  const challengeData = myChallenges.map(ch => ({ name: ch.title, submissions: ch.submission_count || 0, prize: ch.prize_pool || 0 }));

  const contentPerformance = [
    { name: 'Posts', value: myPosts.length },
    { name: 'Groups', value: myGroups.length },
    { name: 'Circles', value: myCircles.length },
    { name: 'Q&As', value: myQAs.length },
    { name: 'Challenges', value: myChallenges.length }
  ];

  const statCards = [
    { label: 'Total Group Members', value: totalGroupMembers, icon: Users, color: 'text-cyan-600', bg: 'bg-cyan-50' },
    { label: 'Circle Subscribers', value: totalCircleMembers, icon: Lock, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Circle Revenue', value: `$${totalCircleRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Q&A Attendees', value: totalQAAttendees, icon: Video, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Q&A Tips', value: `$${totalQATips.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Challenge Entries', value: totalChallengeSubmissions, icon: Trophy, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Post Likes', value: totalPostLikes, icon: Heart, color: 'text-pink-600', bg: 'bg-pink-50' },
    { label: 'Post Comments', value: totalPostComments, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' }
  ];

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-b from-purple-50 via-white to-pink-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Creator Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into your community and content performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className={`${stat.bg} border-2 hover:shadow-glow transition-all`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="circles">Circles</TabsTrigger>
          <TabsTrigger value="qa">Live Q&A</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                Group Engagement Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={groupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" fill="#06b6d4" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid md:grid-cols-3 gap-4">
                <div className="bg-cyan-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Groups</p>
                  <p className="text-3xl font-bold text-cyan-600">{myGroups.length}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-3xl font-bold text-cyan-600">{totalGroupMembers}</p>
                </div>
                <div className="bg-cyan-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Avg Members/Group</p>
                  <p className="text-3xl font-bold text-cyan-600">
                    {myGroups.length > 0 ? Math.round(totalGroupMembers / myGroups.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="circles">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-purple-600" />
                  Circle Subscriber Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={circleData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="members" fill="#9333EA" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Circle Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={circleData} dataKey="revenue" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {circleData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mt-6">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total Circles</p>
              <p className="text-3xl font-bold text-purple-600">{myCircles.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-3xl font-bold text-purple-600">{totalCircleMembers}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Monthly Revenue</p>
              <p className="text-3xl font-bold text-green-600">${totalCircleRevenue.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-gray-600">Your Share (90%)</p>
              <p className="text-3xl font-bold text-green-600">${(totalCircleRevenue * 0.9).toFixed(2)}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="qa">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                Live Q&A Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={qaData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="attendees" stroke="#dc2626" strokeWidth={2} />
                  <Line type="monotone" dataKey="tips" stroke="#eab308" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-6 grid md:grid-cols-4 gap-4">
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Sessions</p>
                  <p className="text-3xl font-bold text-red-600">{myQAs.length}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Attendees</p>
                  <p className="text-3xl font-bold text-red-600">{totalQAAttendees}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Tips</p>
                  <p className="text-3xl font-bold text-yellow-600">${totalQATips.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Avg Tips/Session</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    ${myQAs.length > 0 ? (totalQATips / myQAs.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Challenge Participation Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={challengeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="submissions" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 grid md:grid-cols-4 gap-4">
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Challenges</p>
                  <p className="text-3xl font-bold text-orange-600">{myChallenges.length}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Submissions</p>
                  <p className="text-3xl font-bold text-orange-600">{totalChallengeSubmissions}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Total Prizes</p>
                  <p className="text-3xl font-bold text-yellow-600">${totalChallengePrizes.toFixed(2)}</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600">Avg Entries/Challenge</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {myChallenges.length > 0 ? Math.round(totalChallengeSubmissions / myChallenges.length) : 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={contentPerformance} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {contentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  Post Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-pink-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Total Posts</p>
                    <p className="text-4xl font-bold text-pink-600">{myPosts.length}</p>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Total Likes</p>
                    <p className="text-4xl font-bold text-pink-600">{totalPostLikes}</p>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Total Comments</p>
                    <p className="text-4xl font-bold text-blue-600">{totalPostComments}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Avg Engagement/Post</p>
                    <p className="text-4xl font-bold text-purple-600">
                      {myPosts.length > 0 ? Math.round((totalPostLikes + totalPostComments) / myPosts.length) : 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}