import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AffiliateHub from '../components/monetization/AffiliateHub';
import PromoteService from '../components/monetization/PromoteService';
import ExclusiveContent from '../components/monetization/ExclusiveContent';
import NetworkEarningsTracker from '../components/monetization/NetworkEarningsTracker';
import { DollarSign, TrendingUp, Zap } from 'lucide-react';

export default function PassiveIncome() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Passive Income Streams</h1>
          <p className="text-gray-600">Earn money while you sleep — multiple ways to build recurring revenue</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300">
            <CardContent className="pt-6 text-center">
              <DollarSign className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-purple-900">$0</p>
              <p className="text-sm text-gray-700">This Month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-900">0</p>
              <p className="text-sm text-gray-700">Active Streams</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-yellow-100 to-orange-100 border-2 border-yellow-300">
            <CardContent className="pt-6 text-center">
              <Zap className="w-10 h-10 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-900">$0</p>
              <p className="text-sm text-gray-700">Lifetime Earned</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="affiliate" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
            <TabsTrigger value="promote">Promote</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="affiliate" className="mt-6">
            <AffiliateHub user={user} />
          </TabsContent>

          <TabsContent value="promote" className="mt-6">
            <PromoteService user={user} />
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <ExclusiveContent user={user} />
          </TabsContent>

          <TabsContent value="network" className="mt-6">
            <NetworkEarningsTracker user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}