import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Users, DollarSign, TrendingUp, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AffiliateHub({ user }) {
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { data: affiliate } = useQuery({
    queryKey: ['affiliate', user?.email],
    queryFn: async () => {
      const programs = await base44.entities.AffiliateProgram.filter({ user_email: user?.email });
      if (programs.length > 0) return programs[0];
      
      // Create affiliate program for new user
      const code = `${user?.email?.split('@')[0]?.toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      return await base44.entities.AffiliateProgram.create({
        user_email: user?.email,
        referral_code: code
      });
    },
    enabled: !!user
  });

  const referralUrl = `${window.location.origin}?ref=${affiliate?.referral_code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Users className="w-6 h-6" />
            Your Affiliate Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{affiliate?.referrals_count || 0}</p>
              <p className="text-sm text-gray-600">Total Referrals</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{affiliate?.conversions_count || 0}</p>
              <p className="text-sm text-gray-600">Conversions</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">${affiliate?.total_commission_earned || 0}</p>
              <p className="text-sm text-gray-600">Total Earned</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">Your Referral Link</p>
            <div className="flex gap-2">
              <Input value={referralUrl} readOnly className="flex-1" />
              <Button onClick={handleCopy} variant="outline">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-purple-100 rounded-lg p-3 border border-purple-200">
            <p className="text-sm text-purple-900">
              <span className="font-semibold">Earn {(affiliate?.commission_rate || 0.1) * 100}%</span> commission on every referral's first transaction!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}