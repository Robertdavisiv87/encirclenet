import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, TrendingUp, Users, DollarSign, Activity, Calendar } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

export default function AdvancedAnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(7); // days

  const { data: revenue } = useQuery({
    queryKey: ['admin-revenue'],
    queryFn: () => base44.entities.Revenue.list('-created_date', 500)
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => base44.entities.User.list('-created_date', 1000)
  });

  const { data: posts } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => base44.entities.Post.list('-created_date', 1000)
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.CreatorSubscription.filter({ status: 'active' })
  });

  const { data: commissions } = useQuery({
    queryKey: ['admin-commissions'],
    queryFn: () => base44.entities.AdminCommission.list('-created_date', 500)
  });

  // Calculate metrics
  const revenueByDay = React.useMemo(() => {
    if (!revenue) return [];
    
    const dateMap = {};
    const startDate = startOfDay(subDays(new Date(), dateRange));
    
    revenue.forEach(r => {
      const date = format(new Date(r.created_date), 'MMM dd');
      if (new Date(r.created_date) >= startDate) {
        dateMap[date] = (dateMap[date] || 0) + r.amount;
      }
    });

    return Object.entries(dateMap).map(([date, amount]) => ({
      date,
      revenue: amount.toFixed(2)
    }));
  }, [revenue, dateRange]);

  const userGrowth = React.useMemo(() => {
    if (!users) return [];
    
    const dateMap = {};
    const startDate = startOfDay(subDays(new Date(), dateRange));
    
    users.forEach(u => {
      const date = format(new Date(u.created_date), 'MMM dd');
      if (new Date(u.created_date) >= startDate) {
        dateMap[date] = (dateMap[date] || 0) + 1;
      }
    });

    return Object.entries(dateMap).map(([date, count]) => ({
      date,
      users: count
    }));
  }, [users, dateRange]);

  const revenueBySource = React.useMemo(() => {
    if (!revenue) return [];
    
    const sourceMap = {};
    revenue.forEach(r => {
      sourceMap[r.source] = (sourceMap[r.source] || 0) + r.amount;
    });

    return Object.entries(sourceMap).map(([name, value]) => ({
      name,
      value: parseFloat(value.toFixed(2))
    }));
  }, [revenue]);

  const contentMetrics = React.useMemo(() => {
    if (!posts) return { total: 0, viral: 0, trending: 0, average_engagement: 0 };
    
    const viral = posts.filter(p => (p.likes_count || 0) > 100).length;
    const trending = posts.filter(p => (p.likes_count || 0) > 50).length;
    const avgEngagement = posts.reduce((sum, p) => sum + (p.likes_count || 0) + (p.comments_count || 0), 0) / posts.length;

    return {
      total: posts.length,
      viral,
      trending,
      average_engagement: avgEngagement.toFixed(1)
    };
  }, [posts]);

  const COLORS = ['#9333EA', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  const exportData = () => {
    const data = {
      revenue: revenueByDay,
      users: userGrowth,
      sources: revenueBySource,
      content: contentMetrics,
      subscriptions: subscriptions?.length || 0,
      total_commissions: commissions?.reduce((sum, c) => sum + c.amount, 0) || 0
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold gradient-text">Advanced Analytics</h2>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={exportData} className="gradient-bg-primary text-white">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${revenue?.reduce((sum, r) => sum + r.amount, 0).toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Viral Posts</CardTitle>
            <Activity className="w-4 h-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contentMetrics.viral}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="users">User Growth</TabsTrigger>
          <TabsTrigger value="content">Content Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueByDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#9333EA" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Source</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={revenueBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {revenueBySource.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Commissions</span>
                    <span className="font-bold text-lg">
                      ${commissions?.reduce((sum, c) => sum + c.amount, 0).toFixed(2) || '0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Commission</span>
                    <span className="font-semibold">
                      ${(commissions?.reduce((sum, c) => sum + c.amount, 0) / (commissions?.length || 1)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Commission Rate</span>
                    <span className="font-semibold">5-20%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Total Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{contentMetrics.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Trending Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{contentMetrics.trending}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Avg Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{contentMetrics.average_engagement}</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}